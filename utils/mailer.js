import nodemailer from 'nodemailer';

export const sendTemporaryPassword = async (email, tempPassword) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail', 
    auth: {
      user: 'moneyplan0511@gmail.com',
      pass: 'tdyfghqegpbkzvjv' 
    }
  });

  const mailOptions = {
    from: 'moneyplan0511@gmail.com',
    to: email,
    subject: '[머니플래너] 임시비밀번호 안내',
    html: `
      <p>요청하신 임시 비밀번호는 다음과 같습니다: </p>
      <h3>${tempPassword}</h3>
      <p>로그인 후 반드시 비밀번호를 변경해주세요.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};
