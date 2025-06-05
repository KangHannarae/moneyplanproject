import db from './db.js';

// moneylist 페이지에 표시될 내용(로그인한 사용자의 전체 가계부 내역) 조회하는 SQL
export const selectContentsByYearMonth = async (userid, year, month) => {
    const sql = "select idx, date_format(date, '%Y-%m-%d') date, in_out, price, contents, category, payby from money_contents where writer = ? and year(date) = ? and month(date) = ? order by date desc";
    const [rows] = await db.execute(sql, [userid, year, month]);
    return rows;
};

export const selectMonthOut = async (userid, year, month) => {
    const sql = "select sum(price) from money_contents where writer = ? and in_out = '지출' and year(date) = ? and month(date) = ?";
    const result = await db.execute(sql, [userid, year, month]);
    return result;
};

export const selectMonthIn = async (userid, year, month) => {
    const sql = "select sum(price) from money_contents where writer = ? and in_out = '수입' and year(date) = ? and month(date) = ?";
    const result = await db.execute(sql, [userid, year, month]);
    return result;
};

export const selectSumFavCard = async (userid, year, month, payby) => {
    const sql = "select sum(price) from money_contents where writer= ? and in_out = '지출' and  year(date) = ? and month(date) = ? and payby = ?";
    const result = await db.execute(sql, [userid, year, month, payby]);
    return result;
};

// 가계부 내역의 상세정보 조회하는 SQL
export const selectContentsIdx = async (idx) => {
    const sql = "select writer, date_format(date, '%Y-%m-%d') date, in_out, price, contents, category, payby, diary,diary_img,idx from money_contents where idx = ?";
    const [rows] = await db.execute(sql, [idx]);
    return rows[0];
};

//자신의 카드이름 호출
export const card = async (userid) =>{
    const sql = "select fav_card1, fav_card2, fav_card3 from money_user where userid=?";
    const [row] = await db.execute(sql, [userid]);
    return row[0];
};


// moneydetail 페이지에서 수정내용 작성 후 레코드 수정하는 SQL
export const updateContents = async (idx, req, res, form_data) => {
    form_data(req, res, async function (err) {
        if (err){
            console.log('파일 업로드 오류:', err);
            return res.status(500).send('업로드 실패');
        }

        try{
            const row = req.body;
            let filename ='-';

            if(req.files && req.files['filename'] && req.files['filename'][0]){
                filename = req.files['filename'][0].filename;
            }else if(row.old_filename){
                filename = row.old_filename;
            }
            const sql = "update money_contents set date=?, price=?, contents=?, category=?, payby=?, diary=?, diary_img = ? where idx=?";
            return db.execute(sql, [row.date,row.price,row.contents,row.category,row.payby,row.diary,filename,idx]); 

            res.redirect('/money/moneylist');
        }catch(dberror){
            console.log('DB 오류:',dberror);
            res.status(500).send('DB 오류');
        }
    });
};

// moneylist 페이지 상단에 텍스트필드에 내용 추가하여 레코드 생성하는 SQL
export const insertContents = async (date, in_out, price, contents, category, payby, userid) => {
    const sql = "insert into money_contents (date, in_out, price, contents, category, payby, writer, diary_img) values (?, ?, ?, ?, ?, ?, ?,'-')";    
    return db.execute(sql, [date, in_out, price, contents, category, payby, userid]);
};

// moneylist 페이지 및 moneydetail 에서 가계부 내역 1개 삭제하는 SQL
export const deleteContents = async (idx) => {
    const sql = "delete from money_contents where idx = ?";
    return db.execute(sql, [idx]);
};

// moneylist 페이지에서 "내 일기 모아보기" 기능 이용할 때 diary(_img) 필드가 null 이 아닌(일기 내용이 있는) 레코드 조회하는 SQL
export const selectDiaryAll = async (userid) => {
    const sql = "select date_format(date, '%Y-%m-%d') date, in_out, price, contents, diary, diary_img, idx from money_contents where writer = ? and diary is not null order by date desc";
    const [rows] = await db.execute(sql, [userid]);
    return [rows];
};

/*export const selectContentsAll = async (userid) => {
    const sql = "select idx, date_format(date, '%Y-%m-%d') date, in_out, price, contents, category, payby from money_contents where writer = ? order by date desc;";
    const [rows] = await db.execute(sql, [userid]);
    return rows;
};*/