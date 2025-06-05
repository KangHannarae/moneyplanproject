import { selectAllPostDB } from '../model/adminPostMngDAO.js';
import { deletePostSaveToDB, deletePostById } from '../model/PostDAO.js';

export const AllPostList = async (req, res) => {
    const rows = await selectAllPostDB();
    res.render('adminPostMng', { items: rows });
};

export const AdminPostDelete_one = async (req, res) => {
  const { post_id } = req.params;
  await deletePostSaveToDB(post_id);
  const success = await deletePostById(post_id);
  return success ? res.redirect("/money/adminPostPage") : res.status(404).send("Post not found");
};
