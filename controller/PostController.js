import multer from "multer";
import fs from "fs/promises";
import path from "path";
import {
  getPostListFromDB, insertPostToDB, getFilenameById, incrementDownloadCount,
  incrementHitCount, getPostById, getCommentsByPostId,
  updatePostToDB, deletePostById, insertReplyToDB, updateReplyToDB, deleteReplyToDB,
  deletePostSaveToDB
} from "../model/PostDAO.js";

import { getRepliesByCommentId } from "../model/ReplyDAO.js";

// 업로드 설정 
const storage = multer.diskStorage({
  destination(req, file, done) {
    done(null, path.join("public", "upload"));
  },
  filename(req, file, done) {
    const uniqueName = Date.now() + '-' + Buffer.from(file.originalname, 'latin1').toString('utf-8');
    done(null, uniqueName);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// 전체 게시글 리스트
export const getPostList = async (req, res) => {
  const page = parseInt(req.params.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const activeTab = req.query.category || 'all';
  const keyword = req.query.keyword || ''; // 지피티햄이 손봄
  const category = req.query.category || 'all';
  const search_option = req.query.search_option || 'all'; // 지피티햄이 손봄

  try {
    let items = [];
    let total = 0;

    // 검색 파라미터도 전달
    const result = await getPostListFromDB(limit, offset, category, keyword, search_option); 
    items = result.rows;
    total = result.total;

    const totalPages = Math.ceil(total / limit);

    // 탭 별로 다른 변수에 데이터 할당 (빈 배열로 초기화 후 필요한 탭만 items 할당)
    const diaryItems = category === 'diary' ? items : [];
    const freeItems = category === 'free' ? items : [];
    const goalItems = category === 'goal' ? items : [];

    res.render("communitylist", {
      items,
      currentPage: page,
      totalPages,
      pageSize: limit,
      activeTab,
      keyword, 
      category,
      search_option, 
      diaryItems,
      freeItems,
      goalItems,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
};


// 글쓰기 폼으로 이동
export const postForm = (req, res) => {
  res.render("addPost", { session: req.session });
};

// 게시글 작성
export const insertPost = (req, res) => {
  const form_data = upload.single("file");

  form_data(req, res, async (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Upload failed");
    }

    try {
     const { writer, category, title, content } = req.body;

      const filename = req.file ? req.file.filename : '-';
      const filesize = req.file ? req.file.size : 0;

      await insertPostToDB({ writer, category, title, content, filename, filesize });
      res.redirect("/money/post");
    } catch (dbErr) {
      console.error(dbErr);
      res.status(500).send("Database error");
    }
  });
};


// 파일 다운로드
export const download = async (req, res) => {
  const { post_id } = req.params;

  try {
    const filename = await getFilenameById(post_id);
    if (!filename || filename === '-') return res.status(404).send("No file associated with this entry.");

    const file = path.join("public", "upload", filename);
    await fs.access(file);

    const originalFilename = filename.includes('-') ? filename.substring(filename.indexOf('-') + 1) : filename;

    res.download(file, originalFilename, async (err) => {
      if (err) {
        console.error("Download error:", err);
        return res.status(500).send("Failed to download file.");
      }
      await incrementDownloadCount(post_id);
    });
  } catch (err) {
    console.error("Error during download:", err);
    res.status(500).send("Internal server error");
  }
};

// 상세보기
export const postDetail = async (req, res) => {
  const { post_id } = req.params;
  await incrementHitCount(post_id);
  const post = await getPostById(post_id);
  const comment_list = await getCommentsByPostId(post_id);
  
  for(const comment of comment_list) {
    comment.replies = await getRepliesByCommentId(comment.comment_id);
  }

  res.render("communitydetail", { row: post, comment_list });
};

// 게시글 수정
export const updatePost = (req, res) => {
  const form_data = upload.single("file");

  form_data(req, res, async (err) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(500).send("File upload failed");
    }

    const { post_id } = req.params;
    const { writer, category, title, content, old_filename } = req.body;

    let filename = '-';
    let filesize = 0;

    try {
      if (req.file) {
        filename = req.file.filename;
        filesize = req.file.size;
      } else if (old_filename && old_filename !== '-') {
        filename = old_filename;
        try {
          const stat = await fs.stat(path.join("public", "upload", filename));
          filesize = stat.size;
        } catch {
          filesize = 0;
        }
      }

      await updatePostToDB({ post_id, writer, category, title, content, filename, filesize });
      res.redirect("/money/post");
    } catch (dbErr) {
      console.error("DB error:", dbErr);
      res.status(500).send("Database update failed.");
    }
  });
};

// 게시글 삭제
export const postDelete_one = async (req, res) => {
  const { post_id } = req.params;
  await deletePostSaveToDB(post_id);
  const success = await deletePostById(post_id);
  return success ? res.redirect("/money/post") : res.status(404).send("Post not found");
};

// 댓글 등록
export const insertReply = async (req, res) => {
  const row = req.body;
  await insertReplyToDB({ post_id: row.post_id, writer: row.writer, content: row.content });
  res.redirect("/money/post/communitydetail/" + row.post_id);
};

// 댓글 수정
export const updateReply = async (req, res) => {
  const row = req.body;
  await updateReplyToDB({ comment_id: row.comment_id, content: row.content });
  res.redirect("/money/post/communitydetail/" + row.post_id);
};

// 댓글 삭제
export const deleteReply = async (req, res) => {
   const { comment_id, post_id } = req.params;
   const success = await deleteReplyToDB(comment_id);
   return success ? res.redirect("/money/post/communitydetail/" + post_id) : res.status(404).send("Comment not found");
};
