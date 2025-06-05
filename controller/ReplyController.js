import { 
    getRepliesByCommentId,
    insertCommentReplyToDB, 
    updateCommentReplyToDB, 
    deleteCommentReplyToDB,
  } 
from '../model/ReplyDAO.js';

// 답글 등록 (파라미터: comment_id, writer, content, post_id), 매개변수(comment_id, writer, content)
export const insertCommentReply = async (req, res) => {
  const row = req.body;
  await insertCommentReplyToDB({ comment_id: row.comment_id, writer: row.writer, content: row.content });
  res.redirect("/money/post/communitydetail/" + row.post_id);
};

// 답글 수정 (매개변수: reply_id, content) + post_id(파라미터)
export const updateCommentReply = async (req, res) => {
  const row = req.body;
  await updateCommentReplyToDB({ reply_id: row.reply_id, content: row.content });
  res.redirect("/money/post/communitydetail/" + row.post_id);
};

// 답글 삭제 (매개변수: reply_id) + post_id(파라미터)
export const deleteCommentReply = async (req, res) => {
   const { reply_id, post_id } = req.params;
   const success = await deleteCommentReplyToDB(reply_id);
   return success ? res.redirect("/money/post/communitydetail/" + post_id) : res.status(404).send("Comment not found");
};
