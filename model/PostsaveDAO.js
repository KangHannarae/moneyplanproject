import db from './db.js';

// 게시글 즐겨찾기
export const favPostToDB = async ({ userid, post_id }) => {
  await db.query(
    "INSERT IGNORE INTO post_save (userid, post_id, created_at) VALUES (?, ?, now())",
    [userid, post_id]
  );
};

// 게시글 즐겨찾기 취소
export const unFavPostToDB = async (fav_id) => {
  const [result] = await db.query("DELETE FROM post_save WHERE fav_id=?", [fav_id]);
  return result.affectedRows === 1;
};

// 즐겨찾기 유무 - 즐겨찾기 되어있으면 fav_id 반환, 안 되어있으면 null 반환
export const getPostFavoriteId = async ({ userid, post_id }) => {
  const [rows] = await db.query(
    "SELECT fav_id FROM post_save WHERE userid = ? AND post_id = ?",
    [userid, post_id]
  );
  return rows.length ? rows[0].fav_id : null;
};
