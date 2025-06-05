import db from './db.js';

// 회원가입
export const insertUser = async (userid, pwd, username, fav_card1, fav_card2, fav_card3, goal_money) => {
    const sql = "insert into money_user (userid, pwd, username, fav_card1, fav_card2, fav_card3, goal_money) values (?, SHA2(?,256), ?, ?, ?, ?, ?)";
    return db.execute(sql, [userid, pwd, username, fav_card1, fav_card2, fav_card3, goal_money]);
};

// 로그인
export const selectLogin = async (userid, pwd) => {
    const sql = "select * from money_user where userid = ? and pwd = SHA2(?,256)";
    const [rows] = await db.execute (sql, [userid, pwd]);
    return rows[0];
};

// 사용자 삭제 (관리자, 일반 사용자 쿼리 동일)
export const deleteUser = async (userid) => {
    const deletePostSaveByUser = "DELETE FROM post_save WHERE userid = ?";
    const deletePostSaveByPost = "DELETE FROM post_save WHERE post_id IN (SELECT post_id FROM post WHERE writer = ?)";
    const deletePost = "DELETE FROM post WHERE writer = ?";
    const deleteUser = "DELETE FROM money_user WHERE userid = ?";

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        await conn.execute(deletePostSaveByUser, [userid]);
        await conn.execute(deletePostSaveByPost, [userid]);
        await conn.execute(deletePost, [userid]);
        await conn.execute(deleteUser, [userid]);

        await conn.commit();
        return true;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

// 관리자 - 전체 사용자 조회
export const selectUserAll = async () => {
    const sql = "select userid, username, goal_money, date_format(join_date, '%Y-%m-%d') join_date, warn from money_user where user_type = 'user' order by join_date desc";
    const [rows] = await db.execute(sql);
    return rows;
};

// 회원정보 조회 ()
export const selectUserId = async (userid) => {
    const sql = "select userid, username, goal_money, fav_card1, fav_card2, fav_card3, date_format(join_date, '%Y-%m-%d') join_date, warn, log from money_user where userid = ?";
    const [rows] = await db.execute(sql, [userid]);
    return rows[0];
};

//회원 정보수정
export const updateUser = async (fav_card1, fav_card2, fav_card3, goal_money, log, idforuser) => {
    if(log == null){
        log = 0;
    }
    const sql = "update money_user set fav_card1 = ?, fav_card2 = ?, fav_card3 = ?, goal_money = ?, log = ? where userid = ?";
    return db.execute(sql, [fav_card1, fav_card2, fav_card3, goal_money, log, idforuser]);
};

//비밀번호 변경
export const updatePwd = async (idforuser,pwd) => {
    const sql = "update money_user set pwd = SHA2(?,256) where userid = ?";
    db.execute(sql, [pwd, idforuser]);
};

//회원 경고
export const warnUser = async (userid) => {
    const sql = "update money_user set warn = warn + 1 where userid = ?";
    return db.execute(sql, [userid]);
};