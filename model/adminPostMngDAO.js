import db from './db.js';

export const selectAllPostDB = async () => {
  const [rows] = await db.query(`
    SELECT post_id, writer, category, title, content,
           DATE_FORMAT(post_date, '%Y-%m-%d %H:%i:%s') AS post_date
    FROM post order by post_date desc
  `);
  return rows;
};
