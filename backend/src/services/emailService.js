const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  tls: { rejectUnauthorized: false }
});

const sendMail = async (to, subject, html) => {
  // Always log to console in development to ensure developers can see OTPs even if SMTP fails
  if (process.env.NODE_ENV === 'development') {
    console.log('\n--- DEVELOPMENT EMAIL ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    // Extract OTP and reset link for cleaner logging
    const otpMatch = html.match(/>(\d{6})</);
    const linkMatch = html.match(/href="([^"]*\/reset-password\/[^"]*)"/);
    if (otpMatch) {
      console.log(`OTP Code: ${otpMatch[1]}`);
    } else if (linkMatch) {
      console.log(`Reset Link: ${linkMatch[1]}`);
    } else {
      console.log('Content: (Check HTML structure)');
    }
    console.log('--------------------------\n');
  }

  try {
    await transporter.sendMail({
      from: `"Lancera Platform" <${process.env.EMAIL_USER}>`,
      to, subject, html
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'development') {
      console.error('Email send error:', error.message);
    } else {
      console.warn('SMTP failed (Expected with placeholder credentials). Using terminal fallback instead.');
    }
  }
};

const sendOTP = (email, otp) => sendMail(email, 'Lancera - Verify Your Email', `
  <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#1A1A2E;padding:30px;border-radius:12px;color:#fff">
    <h2 style="color:#6C63FF;text-align:center">Lancera</h2>
    <h3 style="text-align:center">Email Verification</h3>
    <p>Your OTP for email verification is:</p>
    <div style="font-size:36px;font-weight:bold;text-align:center;letter-spacing:12px;background:#6C63FF;padding:20px;border-radius:8px;margin:20px 0">${otp}</div>
    <p style="color:#aaa;font-size:12px">This OTP expires in 5 minutes. Do not share it with anyone.</p>
  </div>
`);

const sendWelcome = (email, name) => sendMail(email, 'Welcome to Lancera!', `
  <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#1A1A2E;padding:30px;border-radius:12px;color:#fff">
    <h2 style="color:#6C63FF;text-align:center">Welcome to Lancera, ${name}!</h2>
    <p>Your account has been verified successfully. You're now part of the AI-powered freelancer marketplace.</p>
    <p style="color:#aaa">Start exploring projects and let AI help you find the best opportunities.</p>
  </div>
`);

const sendBidWon = (email, name, projectTitle, bidAmount) => sendMail(email, `You won the bid for "${projectTitle}"!`, `
  <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#1A1A2E;padding:30px;border-radius:12px;color:#fff">
    <h2 style="color:#4BB543;text-align:center">Congratulations, ${name}!</h2>
    <p>You have won the bid for <strong>${projectTitle}</strong> with a bid of <strong>₹${bidAmount.toLocaleString()}</strong>.</p>
    <p>Login to your dashboard to start working on the project.</p>
  </div>
`);

const sendBidClosed = (email, name, projectTitle) => sendMail(email, `Bid closed for "${projectTitle}"`, `
  <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#1A1A2E;padding:30px;border-radius:12px;color:#fff">
    <h3 style="color:#aaa">Hi ${name},</h3>
    <p>The bidding for <strong>${projectTitle}</strong> has ended and another freelancer was selected.</p>
    <p>Keep exploring more opportunities on Lancera!</p>
  </div>
`);

const sendPhaseApproved = (email, name, projectTitle, phaseIndex, amount) => sendMail(email, `Phase ${phaseIndex + 1} approved - Payment released`, `
  <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#1A1A2E;padding:30px;border-radius:12px;color:#fff">
    <h2 style="color:#4BB543">Payment Released!</h2>
    <p>Hi ${name}, Phase ${phaseIndex + 1} of <strong>${projectTitle}</strong> has been approved.</p>
    <p>Amount released: <strong>₹${amount.toLocaleString()}</strong></p>
  </div>
`);

const sendResetPasswordEmail = (email, resetUrl) => sendMail(email, 'Lancera - Password Reset', `
  <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#1A1A2E;padding:30px;border-radius:12px;color:#fff;text-align:center">
    <h2 style="color:#6C63FF">Lancera Password Reset</h2>
    <p>You requested a password reset. Please click the button below to reset your password:</p>
    <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#6C63FF;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;margin:20px 0">Reset Password</a>
    <p style="color:#aaa;font-size:12px">This link expires in 30 minutes. If you did not request this, please ignore this email.</p>
  </div>
`);

const sendQuizReport = (clientEmail, clientName, projectTitle, freelancerScores) => {
  const rows = freelancerScores.map((f, i) =>
    `<tr style="border-bottom:1px solid #2D2D4E">
      <td style="padding:10px;color:#aaa">#${i + 1}</td>
      <td style="padding:10px;color:#fff;font-weight:bold">${f.name}</td>
      <td style="padding:10px;text-align:center">
        <span style="background:${f.score >= 80 ? '#4BB543' : f.score >= 60 ? '#F59E0B' : '#EF4444'};color:#fff;padding:3px 10px;border-radius:20px;font-weight:bold;font-size:13px">
          ${f.score}/100
        </span>
      </td>
      <td style="padding:10px;color:#aaa;text-align:center">${f.correct}/${f.total}</td>
    </tr>`
  ).join('');

  return sendMail(clientEmail, `Quiz Report — ${projectTitle}`, `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1A1A2E;padding:30px;border-radius:12px;color:#fff">
      <h2 style="color:#6C63FF;text-align:center">Lancera — AI Quiz Report</h2>
      <p>Hi ${clientName},</p>
      <p>All freelancers have completed the AI technical quiz for <strong>${projectTitle}</strong>. Here are their scores:</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#12122A;border-radius:8px;overflow:hidden">
        <thead>
          <tr style="background:#6C63FF">
            <th style="padding:10px;text-align:left;color:#fff">Rank</th>
            <th style="padding:10px;text-align:left;color:#fff">Freelancer</th>
            <th style="padding:10px;text-align:center;color:#fff">Score</th>
            <th style="padding:10px;text-align:center;color:#fff">Correct</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="color:#aaa;font-size:13px">These scores reflect the freelancers' technical proficiency based on your project's requirements. You can now start the bidding session from your dashboard.</p>
    </div>
  `);
};

module.exports = { sendOTP, sendWelcome, sendBidWon, sendBidClosed, sendPhaseApproved, sendResetPasswordEmail, sendQuizReport };
