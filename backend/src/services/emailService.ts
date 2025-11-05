import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendMatchResultEmail = async (
  to: string,
  teamName: string,
  opponent: string,
  score: string,
  result: 'won' | 'lost' | 'drew',
  goalScorers: string[]
) => {
  const subject = `African Nations League Match Result: ${teamName} ${result} against ${opponent}`;
  
  const goalScorersText = goalScorers.length > 0 
    ? `Goal scorers: ${goalScorers.join(', ')}`
    : 'No goals scored in this match.';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a365d; text-align: center;">African Nations League</h2>
      <div style="background: #f7fafc; padding: 20px; border-radius: 8px;">
        <h3 style="color: #2d3748;">Match Result Notification</h3>
        <p>Dear ${teamName} Federation,</p>
        <p>Your match against ${opponent} has concluded.</p>
        <div style="text-align: center; margin: 20px 0; padding: 15px; background: white; border-radius: 5px;">
          <h4 style="margin: 0; color: #2d3748;">Final Score</h4>
          <h2 style="margin: 10px 0; color: #1a365d; font-size: 2em;">${score}</h2>
          <p style="color: #718096;">${goalScorersText}</p>
        </div>
        <p>Thank you for participating in the African Nations League!</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    console.log(`Match result email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};