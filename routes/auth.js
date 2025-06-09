import { generateTempPassword } from '../utils/generateTempPassword.js';
import { sendTemporaryPassword } from '../utils/mailer.js';
import bcrypt from 'bcrypt';

// POST /auth/reset-password
app.post('/auth/reset-password', async (req, res) => {
  const { userid, email } = req.body;

  // 1. 사용자 존재 확인
  const [user] = await db.query('SELECT * FROM money_user WHERE userid = ?', [userid]);
  if (!user.length) {
    return res.status(404).json({ message: '존재하지 않는 아이디입니다.' });
  }

  // 2. 임시 비밀번호 생성
  const tempPassword = generateTempPassword();

  // 3. 해시 후 DB 저장
  const hashed = await bcrypt.hash(tempPassword, 10);
  await db.query('UPDATE money_user SET pwd = ? WHERE userid = ?', [hashed, userid]);

  // 4. 이메일 전송
  await sendTemporaryPassword(email, tempPassword);

  res.json({ message: '임시 비밀번호가 이메일로 발송되었습니다.' });
});
