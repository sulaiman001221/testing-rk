const fs = require("fs");
const { sendEmail } = require("./email_sender");
require("dotenv").config({ path: "smtp_secrets.sh" });

const errorMessages = {
  invalidEmail: "Invalid email address provided.",
  noRecipientEmail: "No recipient email provided.",
  errorSendingEmail: "Error sending email: ",
  invalidEmailOption:
    "Invalid email options provided. Ensure fromEmail, fromName, toEmail, and text are supplied.",
  notDefined: "SMTP_LOGIN is not defined in the environment.",
};

const getRandomQuote = () => {
  const quotes = JSON.parse(fs.readFileSync("quotes.json", "utf-8"));
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
};

const validateEmail = (email) => {
  if (!email) {
    throw new Error(errorMessages.noRecipientEmail);
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error(errorMessages.invalidEmail);
  }
};

const sendInspiration = async () => {
  const email = process.argv[2];

  try {
    validateEmail(email);
    const { quote, author } = getRandomQuote();
    const message = `${quote} - ${author}`;

    if (!email) {
      throw new Error(errorMessages.notDefined);
    }
    await sendEmail(email, "Your Daily Inspiration", message);
    return `Email sent successfully to ${email}`;
  } catch (error) {
    throw new Error(`${errorMessages.errorSendingEmail} ${error.message}`);
  }
};

if (require.main === module) {
  sendInspiration();
}

module.exports = {
  getRandomQuote,
  validateEmail,
  sendInspiration,
  errorMessages,
};
