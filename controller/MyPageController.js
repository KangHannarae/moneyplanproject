import { selectMyFavDB, selectMyPostDB, selectMyCommentDB, getPostTitle } from '../model/MyPageDAO.js';

//즐겨찾기 목록 가져오기
export const getMyFavs = async (req, res) => {
  const { userid } = req.params;
  const myfavs = await selectMyFavDB(userid);
  res.render("myFavoriteList", { favs: myfavs });
};

//작성한 글 목록 가져오기
export const getMyPosts = async (req, res) => {
    const { userid } = req.params;
    const myposts = await selectMyPostDB(userid);
    res.render("myPostList", { posts: myposts });
};

//작성한 댓글 목록 가져오기
export const getMyComments = async (req, res) => {
  const { userid } = req.params;
  const mycomments = await selectMyCommentDB(userid);
  res.render("myCommentList", { comments: mycomments });
};
