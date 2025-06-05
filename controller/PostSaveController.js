import { favPostToDB, unFavPostToDB, getPostFavoriteId } from '../model/PostsaveDAO.js';

// 게시글 즐겨찾기 추가
export const addFavorite = async (req, res) => {
  try {
    const { userid, post_id } = req.body;
    if (!userid || !post_id) {
      return res.status(400).json({ message: "userid와 post_id는 필수입니다." });
    }

    const fav_id = await favPostToDB({ userid, post_id }); // fav_id 반환한다고 가정
    res.status(201).json({ message: "즐겨찾기에 추가되었습니다.", fav_id }); // ✅ 클라이언트 포맷 맞춤
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류로 즐겨찾기 추가에 실패했습니다." });
  }
};

// 게시글 즐겨찾기 취소
export const removeFavorite = async (req, res) => {
  try {
    const { fav_id } = req.params;
    if (!fav_id) {
      return res.status(400).json({ message: "fav_id가 필요합니다." });
    }

    const success = await unFavPostToDB(fav_id);
    if (success) {
      res.json({ message: "즐겨찾기에서 제거되었습니다." }); // ✅ 문구 통일
    } else {
      res.status(404).json({ message: "해당 즐겨찾기를 찾을 수 없습니다." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류로 즐겨찾기 취소에 실패했습니다." });
  }
};

// 특정 게시글에 대해 사용자가 즐겨찾기 했는지 조회
export const checkFavorite = async (req, res) => {
  try {
    const { userid, post_id } = req.query;
    if (!userid || !post_id) {
      return res.status(400).json({ message: "userid와 post_id가 필요합니다." });
    }

    const fav_id = await getPostFavoriteId({ userid, post_id });

    if (fav_id) {
      res.json({ favorited: true, fav_id }); // ✅ 즐겨찾기 상태 true
    } else {
      res.json({ favorited: false }); // ✅ 즐겨찾기 안되어 있음
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류로 즐겨찾기 조회에 실패했습니다." });
  }
};
