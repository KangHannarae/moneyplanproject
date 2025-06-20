import db from './db.js';

export const getPostListFromDB = async (limit, offset, category = 'all', keyword = '', search_option = 'all') => {
  let totalQuery = "SELECT COUNT(*) as total FROM post";
  let listQuery = `
    SELECT post_id, writer, category, title, content, DATE_FORMAT(post_date, '%Y-%m-%d') as post_date, 
           hit, filename, filesize, down,
           (SELECT COUNT(*) FROM post_comment WHERE post_id = p.post_id) as cnt
    FROM post p 
  `;
  const conditions = [];
  const params = [];

  // 카테고리 필터
  if (category && category !== 'all') {
    conditions.push("category = ?");
    params.push(category);
  }

  // 검색 옵션별 필터 처리
  if (keyword && keyword.trim() !== '') {
    const searchTerm = `%${keyword}%`;

    if (search_option === 'writer') {
      conditions.push("writer LIKE ?");
      params.push(searchTerm);
    } else if (search_option === 'title') {
      conditions.push("title LIKE ?");
      params.push(searchTerm);
    } else if (search_option === 'content') {
      conditions.push("content LIKE ?");
      params.push(searchTerm);
    } else { // all
      conditions.push("(title LIKE ? OR content LIKE ? OR writer LIKE ?)");
      params.push(searchTerm, searchTerm, searchTerm);
    }
  }

  // WHERE 조건 추가
  if (conditions.length > 0) {
    const whereClause = " WHERE " + conditions.join(" AND ");
    totalQuery += whereClause;
    listQuery += whereClause;
  }

  listQuery += " ORDER BY post_id DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  // limit과 offset 제외하고 COUNT 쿼리에 사용
  const [[{ total }]] = await db.query(totalQuery, params.slice(0, params.length - 2));
  const [rows] = await db.query(listQuery, params);

  return { total, rows };
};

// 게시글 추가
export const insertPostToDB = async ({ writer, category, title, content, filename, filesize }) => {
  await db.query(
    "INSERT INTO post (writer, category, title, content, post_date, filename, filesize) VALUES (?, ?, ?, ?, NOW(), ?, ?)",
    [writer, category, title, content, filename, filesize]
  );
};

//파일이름 조회
export const getFilenameById = async (post_id) => {
  const [result] = await db.query("SELECT filename FROM post WHERE post_id=?", [post_id]);
  return result[0]?.filename || null;
};

//다운로드 횟수 증가
export const incrementDownloadCount = async (post_id) => {
  await db.query("UPDATE post SET down = down + 1 WHERE post_id=?", [post_id]);
};

//조회수 증가
export const incrementHitCount = async (post_id) => {
  await db.query("UPDATE post SET hit=hit+1 WHERE post_id=?", [post_id]);
};

//글번호로 게시글 조회
export const getPostById = async (post_id) => {
  const [result] = await db.query(`
    SELECT post_id, writer, category, title, content, DATE_FORMAT(post_date, '%Y-%m-%d') as post_date,
           hit, filename, filesize, down 
    FROM post 
    WHERE post_id=?`, [post_id]);
  return result[0];
};

//글번호로 댓글 셀렉 + 댓글 작성자가 member_user테이블에 없을 시, isValidUser값 0으로 처리(LEFT JOIN)
export const getCommentsByPostId = async (post_id) => {
  const [comments] = await db.query(`
    SELECT 
      c.comment_id, 
      c.post_id, 
      c.writer, 
      c.content, 
      DATE_FORMAT(c.comment_date, '%Y-%m-%d') AS comment_date,
      IF(m.userid IS NULL, 0, 1) AS isValidUser
    FROM post_comment c
    LEFT JOIN money_user m ON c.writer = m.userid
    WHERE c.post_id = ?
    ORDER BY c.post_id
  `, [post_id]);
  return comments;
};

//게시글 업데이트
export const updatePostToDB = async ({ post_id, writer, category, title, content, filename, filesize }) => {
  await db.query(
    "UPDATE post SET writer=?, category=?, title=?, content=?, filename=?, filesize=? WHERE post_id=?",
    [writer, category, title, content, filename, filesize, post_id]
  );
};

//게시글 삭제
export const deletePostById = async (post_id) => {
  const [result] = await db.query("DELETE FROM post WHERE post_id=?", [post_id]);
  return result.affectedRows === 1;
};

//댓글 추가
export const insertReplyToDB = async ({ post_id, writer, content }) => {
  //const finalWriter = writer?.trim() ? writer : '익명';
  await db.query(
    "INSERT INTO post_comment (post_id, writer, content, comment_date) VALUES (?, ?, ?, NOW())",
    [post_id, writer, content]
  );
};

// 댓글 수정
export const updateReplyToDB = async ({ comment_id, content }) => {
  await db.query(
    "UPDATE post_comment SET content=? WHERE comment_id=?", [content, comment_id]
  );
};

// 댓글 삭제
export const deleteReplyToDB = async (comment_id) => {
  const [result] = await db.query("DELETE FROM post_comment WHERE comment_id=?", [comment_id]);
  return result.affectedRows === 1;
};

// post_id로 즐겨찾기 삭제
export const deletePostSaveToDB = async (post_id) => {
  const [result] = await db.query("delete from post_save where post_id=?", [post_id]);
  return result.affectedRows === 1;
};