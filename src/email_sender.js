const nodemailer = require("nodemailer");
require("dotenv").config();

const errorMessages = {
  invalidEmailOption:
    "Invalid email options provided. Ensure email, and text are supplied.",
};

async function sendEmail(email, subject, text) {
  if (!email || !text) {
    throw new Error(errorMessages.invalidEmailOption);
  }
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_LOGIN,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Daily inspiration" <${email} >`,
      to: email,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    return `Email sent successfully: ${info.response}`;
  } catch (error) {
    throw new Error(`Error sending email: ${error.message}`);
  }
}

module.exports = { sendEmail };
