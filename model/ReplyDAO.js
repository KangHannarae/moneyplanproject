import db from './db.js';

// 답글 리스트
export const getRepliesByCommentId = async (comment_id) => {
  const [rows] = await db.query(
    `SELECT reply_id, comment_id, writer, content, date_format(reply_date, '%Y-%m-%d')reply_date FROM comment_reply WHERE comment_id = ? ORDER BY reply_date ASC`,
    [comment_id]
  );
  return rows;
};

//답글 추가
export const insertCommentReplyToDB = async ({ comment_id, writer, content }) => {
  await db.query(
    "INSERT INTO comment_reply (comment_id, writer, content, reply_date) VALUES (?, ?, ?, NOW())",
    [comment_id, writer, content]
  );
};

// 답글 수정
export const updateCommentReplyToDB = async ({ reply_id, content }) => {
  await db.query(
    "UPDATE comment_reply SET content=? WHERE reply_id=?", [content, reply_id]
  );
};

// 답글 삭제
export const deleteCommentReplyToDB = async (reply_id) => {
  const [result] = await db.query("DELETE FROM comment_reply WHERE reply_id=?", [reply_id]);
  return result.affectedRows === 1;
};

