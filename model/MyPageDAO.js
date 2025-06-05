import db from './db.js';

//즐겨찾기한 게시글 목록 조회
export const selectMyFavDB = async (userid) => {
  const [myfavs] = await db.query(`
    SELECT ps.*, p.title 
    FROM post_save ps 
    JOIN post p ON ps.post_id = p.post_id 
    WHERE ps.userid = ?
  `, [userid]);
  return myfavs;
};

//작성한 게시글 목록 조회
export const selectMyPostDB = async (userid) => {
    const [myposts] = await db.query('select * from post where writer=?', [userid]);
    return myposts;
};

//작성한 댓글 목록 조회
export const selectMyCommentDB = async (username) => {
  const [mycomments] = await db.query(`
    SELECT pc.*, p.title 
    FROM post_comment pc 
    JOIN post p ON pc.post_id = p.post_id 
    WHERE pc.writer = ?
  `, [username]);
  return mycomments;
};

//post_id => title만 대조 (즐겨찾기 목록, 게시글 작성목록에서 쓸 예정임)
export const getPostTitle = async (post_id) => {
    const [title] = await db.query('select title from post where post_id=?', [post_id]); 
    return title;
};

//comment_id => post_id 대조 하 귀찮아