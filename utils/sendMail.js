const sendgrid = require("@sendgrid/mail");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

const mail = (options) => {
  const msg = {
    to: options.to,
    from: {
      name: "Tasko",
      email: process.env.MAIL_FROM,
    },
    subject: options.subject,
    text: options.message,
  };

  const sendMail = async () => {
    try {
      await sendgrid.send(msg);
      console.log("Email send successfully");
    } catch (err) {
      if (err.response) {
        console.log(err.response.body);
      }
    }
  };

  sendMail();
};

module.exports = mail;
