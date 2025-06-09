import bcrypt from 'bcrypt';
import { sendTemporaryPassword } from '../utils/mailer.js';
import db from '../model/db.js'; 
import crypto from 'crypto';

export const resetPassword = async (req, res) => {
  const { userid, email } = req.body;

  try {
    // 1. 사용자 확인
    const [users] = await db.query('SELECT * FROM money_user WHERE userid = ?', [userid]);

    if (users.length === 0) {
      return res.status(404).json({ message: '해당하는 사용자 정보가 없습니다.' });
    }

    // 2. 임시 비밀번호 생성
    const tempPassword = crypto.randomBytes(4).toString('hex'); // 8자리 임시 비밀번호

    // 3. 해싱 후 DB에 저장
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    await db.query('UPDATE money_user SET pwd = ? WHERE userid = ?', [hashedPassword, userid]);

    // 4. 이메일로 발송
    await sendTemporaryPassword(email, tempPassword);

    return res.status(200).json({ message: '임시 비밀번호가 이메일로 발송되었습니다.' });
  } catch (error) {
    console.error('비밀번호 재설정 오류:', error);
    return res.status(500).json({ message: '서버 오류로 인해 비밀번호를 재설정할 수 없습니다.' });
  }
};
