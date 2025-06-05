import multer from "multer";
import path from "path";
import db from '../model/db.js';
import { fileURLToPath } from "url";
import { selectContentsByYearMonth, selectSumFavCard, selectContentsIdx, updateContents, insertContents, selectDiaryAll, selectMonthOut, selectMonthIn, deleteContents, card } from '../model/ContentsDAO.js';
import { selectUserId } from "../model/UserDAO.js";

let filename = '';

const upload = multer({
    storage: multer.diskStorage({
        filename(req, file, done) {
            done(null, file.originalname);
        },
        destination(req, file, done) {
            filename = file.originalname;
            const __dirname = path.dirname(fileURLToPath(import.meta.url));
           done(null, "c:/money_upload_file");
        },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
});

// 가계부 내역 리스트 조회
export const contentsList = async (req, res) => {
    try {
        const user = await selectUserId (req.session.userid);
        const year = req.query.year || new Date().getFullYear();
        const month = req.query.month || (new Date().getMonth() + 1).toString().padStart(2, '0');
        var sum_card1 = 0;
        var sum_card2 = 0;
        var sum_card3 = 0;
        //카드 불러오기
        let my_card = [];
        if (user.fav_card1 !== null && user.fav_card1 !=='') {
            my_card.push(user.fav_card1)
            const [[sumFavCard1]] = await selectSumFavCard(req.session.userid, year, month, user.fav_card1);
            sum_card1 = sumFavCard1['sum(price)'] || 0;
        }
        if (user.fav_card2 !== null && user.fav_card2 !=='') {
            my_card.push(user.fav_card2)
            const [[sumFavCard2]] = await selectSumFavCard(req.session.userid, year, month, user.fav_card2);
            sum_card2 = sumFavCard2['sum(price)'] || 0;
        }
        if (user.fav_card3 !== null && user.fav_card3 !=='') {
            my_card.push(user.fav_card3)
            const [[sumFavCard3]] = await selectSumFavCard(req.session.userid, year, month, user.fav_card3);
            sum_card3 = sumFavCard3['sum(price)'] || 0;
        }

        const contents = await selectContentsByYearMonth(req.session.userid, year, month);
        
        const [[rows_out]] = await selectMonthOut(req.session.userid, year, month);
        const total_out = rows_out['sum(price)'] || 0;
        
        const [[rows_in]] = await selectMonthIn(req.session.userid, year, month);
        const total_in = rows_in['sum(price)'] || 0;

        const msg = req.query.msg || null;

        res.render('moneylist', { contents, user, total_out, total_in, year, month, my_card, sum_card1, sum_card2, sum_card3, msg });
    } catch (err) {
        console.error('내역 목록 오류:', err);
        res.status(500).send('가계부 내역 불러오기 실패');
    }
};

//소비내역 수정/삭제
export const contentsDetail = async (req,res) => { 
    try {
        const { idx } = req.params;
        const user = req.session.userid;
        const result = await selectContentsIdx(idx);
        const fav_card = await card(user);
        let my_card = [];
        if(fav_card.fav_card1 !== null && fav_card.fav_card1 !=='') {
            my_card.push(fav_card.fav_card1)
        }
        if(fav_card.fav_card2 !== null && fav_card.fav_card2 !=='') {
            my_card.push(fav_card.fav_card2)
        }
        if(fav_card.fav_card3 !== null && fav_card.fav_card3 !=='') {
            my_card.push(fav_card.fav_card3)
        }
        if(!user || user!==result.writer){
            return res.redirect('/money/moneylist');
        }else{
        res.render('moneydetail', { item: result,my_card });
        }
    } catch (err) {
        console.error('상세내역 조회 오류:', err);
        res.status(500).send('가계부 상세내역 불러오기 실패');
    }
};

//소비메모 리스트
export const diaryList = async (req, res) => {
    try {
        const row = await selectDiaryAll(req.session.userid);
        const diaries = row[0]
        res.render('diarylist', {diaries});
    } catch (err) {
        console.error('일기 모아보기 오류:', err);
        res.status(500).send('나의일기 조회 실패');
    }
};

// 가계부 내역 추가
export const contentsNew = async (req, res) => {
    try { 
        const { date, in_out, price, contents, category, payby } = req.body;
        const userid = req.session.userid;

        await insertContents (date, in_out, price, contents, category, payby, userid);
        res.redirect('/money/moneylist?msg=success');
    } catch (err) {
        console.error('내역 추가 오류:', err);
        res.status(500).send('가계부 내역 추가 실패');
    }
};

//컨텐츠 수정/일기 작성
export const contentsUpdate = (req, res) => {  
    try {
        const { idx } = req.params;
        const form_data = upload.fields([{ name: 'filename' }]);
        updateContents (idx, req, res, form_data);
        res.redirect('/money/moneylist');
    } catch (err) {
        console.error('수정 오류:', err);
        res.status(500).send('가계부 내역 수정 실패');
    }
};

//콘텐츠 삭제
export const contentsBye = async (req, res) => {
    try {
        const { idx } = req.params;
        await deleteContents (idx);
        res.redirect('/money/moneylist');
    } catch (err) {
        console.error('가계부 내역 삭제 오류:', err);
        res.status(500).send('가계부 내역 삭제 실패');
    }
};