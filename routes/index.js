import { Router } from "express";
import {
  getJoin, postJoin, getLogin, postLogin, logout, userWarn,
  userBye, userList, userDetail, userRenew, goback, changePwd, checkId
} from "../controller/UserController.js";

import {
  contentsList, contentsDetail, diaryList,
  contentsNew, contentsUpdate, contentsBye
} from "../controller/ContentsController.js";

import {
  getPostList,
  postForm,
  insertPost,
  postDetail,
  updatePost,
  postDelete_one,
  insertReply,
  download,
  updateReply,
  deleteReply
} from "../controller/PostController.js";

import { getMainPage, getMyPage, getAdminPage } from "../controller/PageController.js";

import {
  addFavorite,
  removeFavorite,
  checkFavorite
} from "../controller/PostSaveController.js";

import {
  getMyFavs,
  getMyPosts,
  getMyComments
} from "../controller/MyPageController.js";

import {
  insertCommentReply,
  updateCommentReply,
  deleteCommentReply
} from "../controller/ReplyController.js";

import { AllPostList, AdminPostDelete_one } from "../controller/adminController.js";

const router = Router();

// 사용자
router.get("/join", getJoin);
router.post("/join", postJoin);
router.get("/login", getLogin);
router.post("/login", postLogin);
router.get("/logout", logout);
router.get("/userlist", userList);
router.get("/userdetail/:userid", userDetail);
router.post("/userRenew/:userid", userRenew);
router.post("/changePwd",changePwd);
router.get("/changePwd",changePwd);
router.get("/userBye/:userid", userBye);
router.get("/userWarn/:userid", userWarn);
router.get("/goback",goback);
router.get("/checkid", checkId);  

// 컨텐츠
router.get("/moneylist", contentsList);              //소비내역
router.get("/moneydetail/:idx", contentsDetail);     //자세히 보기(수정/추가 폼으로)
router.get("/diarylist", diaryList);                 //일기내역 보기
router.post("/contentsNew", contentsNew);    
router.post("/contentsUpdate/:idx", contentsUpdate); //수정/일기추가(action)
router.get("/contentsBye/:idx", contentsBye);       //수정부분에서 삭제버튼

// 게시판
router.get("/post", getPostList);                     // 기본 목록 (1페이지)
router.get("/post/page/:page", getPostList);          // 페이징
router.get("/post/form", postForm);                    // 글쓰기 폼
router.post("/post/insert", insertPost);               // 글 등록
router.get("/post/communitydetail/:post_id", postDetail);       // 상세보기
router.post("/post/update/:post_id", updatePost);      // 수정
router.get("/post/delete/:post_id", postDelete_one);   // 삭제
router.post("/post/reply_insert", insertReply);        // 댓글 등록
router.post("/post/reply_update/:comment_id", updateReply); //댓글 수정
router.get('/post/reply_delete/:comment_id/:post_id', deleteReply); //댓글 삭제
router.get("/post/download/:post_id", download); //파일다운로드

//게시글 즐겨찾기
router.post("/post/favorite", addFavorite); //즐겨찾기 추가
router.delete("/post/favorite/:fav_id", removeFavorite); //즐겨찾기 취소
router.get("/post/favorite/check", checkFavorite); //즐겨찾기 여부 조회

//답글 기능
router.post("/post/comment_reply_insert", insertCommentReply); //답글 등록
router.post("/post/comment_reply_update", updateCommentReply); //답글 수정
router.get("/post/comment_reply_delete/:reply_id/:post_id", deleteCommentReply) //답글 삭제

//마이페이지 추가 기능 
router.get("/user_favlist/:userid", getMyFavs); //즐겨찾기 목록 조회
router.get("/user_postlist/:userid", getMyPosts); //작성 게시글 목록 조회
router.get("/user_commentlist/:username", getMyComments); //작성 댓글 목록 조회 

//관리자 게시판 관리
router.get("/adminPostPage", AllPostList); //게시글 관리 페이지
router.get("/adminPostPage/delete/:post_id", AdminPostDelete_one); //글삭제

//팝업
router.get("/popup", (req, res) => {
  res.render("popup"); // popup.ejs
});

//페이지 이동
router.get("/main", getMainPage); //메인페이지
router.get("/mypage", getMyPage); //마이페이지
router.get("/adminPage", getAdminPage); //관리자 페이지

export default router;
