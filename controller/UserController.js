import bcrypt from 'bcrypt';
import crypto from 'crypto';
import db from '../model/db.js';
import { insertUser, selectLogin, deleteUser, selectUserAll, selectUserId, updateUser, updatePwd, warnUser } from '../model/UserDAO.js';
import { deleteContents } from '../model/ContentsDAO.js';

// 회원가입 화면 띄우기
export const getJoin = (req, res) => {
    res.render('join');
};

// 회원 생성 쿼리
export const postJoin = async (req, res) => {
    try {
        const { userid, pwd, username, fav_card1, fav_card2, fav_card3, goal_money } = req.body;
        await insertUser (userid, pwd, username, fav_card1, fav_card2, fav_card3, goal_money);
        res.redirect('/money/login?msg=success');
    } catch (err) {
        console.error('회원가입 진행 오류:', err);
        res.status(500).send('회원가입 진행 실패');
    }
};

// 로그인 화면 띄우기 (msg 내용 전달)
export const getLogin = (req, res) => {
    const msg = req.query.msg || null;
    res.render('login', { msg });
};

// 로그인 정보 찾는 쿼리, session 생성
export const postLogin = async (req, res) => {
  const { userid, pwd } = req.body;

  // 1. 사용자 조회 (pwd는 해시 그대로 가져옴)
  const [rows] = await db.execute('SELECT * FROM money_user WHERE userid = ?', [userid]);
  const user = rows[0];

  if (!user) {
    return res.redirect('/money/login?msg=fail');
  }

  const storedPwd = user.pwd;

  let isMatch = false;

  // 2. bcrypt 해시인지 판별 (bcrypt 해시는 보통 $2b$, $2a$ 로 시작)
  if (storedPwd.startsWith('$2b$') || storedPwd.startsWith('$2a$')) {
    // bcrypt 해시 비교
    isMatch = await bcrypt.compare(pwd, storedPwd);
  } else {
    // 기존 SHA2(256) 비교
    const sha256Pwd = crypto.createHash('sha256').update(pwd).digest('hex');
    isMatch = (sha256Pwd === storedPwd);
  }

  if (isMatch) {
    // 로그인 성공 시 세션 설정
    req.session.user_type = user.user_type;
    req.session.userid = user.userid;
    req.session.username = user.username;

    if (req.session.user_type === 'admin') {
      res.redirect('/money/adminPage');
    } else {
      res.redirect('/money/main');
    }
  } else {
    res.redirect('/money/login?msg=fail');
  }
};
   
// 로그아웃 - 세션 파괴
export const logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/money/login?msg=logout');
    });
};

// 회원 탈퇴 (관리자, 일반 사용자 동일)
export const userBye = async (req, res) => {
    try {
        const { userid } = req.params;
        await deleteUser (userid);
         if (!req.session.userid || req.session.user_type !== 'admin') {
        req.session.destroy(() => {
        res.redirect('/money/main?msg=bye');
        
    });
         } else {
            res.redirect('/money/userlist');
        }
    } catch (err) {
        console.error('사용자 삭제 오류:', err);
        res.status(500).send('사용자 삭제 실패');
    }
};

//관리자 유저관리창
export const userList = async (req, res) => {
    try {
        if (!req.session.userid || req.session.user_type !== 'admin') {
            res.redirect('/money/login?msg=authority');
        }
        const users = await selectUserAll ();
        res.render('userlist', { users });
    } catch (err) {
        console.error('사용자 조회 오류:', err);
        res.status(500).send('전체사용자 조회 실패');
    }
};

export const userDetail = async (req, res) => {
    try {
        if (!req.session.userid) {
                res.redirect('/money/login?msg=authority');
        }

        const { userid } = req.params;
        const user = await selectUserId (userid);
        if (!req.session.userid || req.session.user_type !== 'admin') {
            res.render('mydetail', { user });
        }else{
            res.render('userdetail', { user });
        }
    } catch (err) {
        console.error('사용자 정보 조회 오류:', err);
        res.status(500).send('사용자 상세정보 조회 실패');
}
};

//회원정보 변경(비밀번호X)
export const userRenew = async (req, res) => {
    const {fav_card1, fav_card2, fav_card3, goal_money, log, idforuser} = req.body;
    await updateUser (fav_card1, fav_card2, fav_card3, goal_money, log, idforuser);
    if (!req.session.userid || req.session.user_type !== 'admin') {
        res.redirect('/money/mypage');
    }else{
        res.redirect('/money/userlist');
    }
};

//회원정보 상세/수정 ==> 목록버튼 세션용
export const goback = async (req, res) => {
    if (!req.session.userid || req.session.user_type !== 'admin') {
        res.redirect('/money/mypage');
    }else{
        res.redirect('/money/userlist');
    }
};

//비밀번호 변경
export const changePwd = async(req,res) =>{
    const{idforuser, pwd} = req.query
    await updatePwd(idforuser,pwd);
    res.send('ok');
};

//아이디 중복검사
export const checkId = async (req, res) => {
    try {
        const { userid } = req.query;
        if(!userid || userid.trim() ==='') {
            return res.status(400).json({ error: '아이디가 제공되지 않았습니다.'});
        }

        const user = await selectUserId(userid);
        const exists = !!user; //user 객체가 존재하면 true

        res.json({ exists });
    } catch (err) {
        console.error('아이디 중복 검사 오류:', err);
        res.status(500).json({ error: '서버 오류 발생' });
    }
};

//경고주기
export const userWarn = async (req, res) => {
    try {
        const { userid } = req.params;
        await warnUser (userid);
        res.redirect('/money/userlist');
    } catch (err) {
        console.error('사용자 경고 오류:', err);
        res.status(500).json({ error: '사용자 경고 중 오류 발생' });
    }
};