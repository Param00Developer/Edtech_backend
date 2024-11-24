import {} from "dotenv/config";
import nodemailer from "nodemailer";

async function sendMail(email, title, body) {
  try {
    const postMan = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
    await postMan.sendMail({
      from: "EdTech Backend",
      to: email,
      subject: title,
      html: `${body}`,
    });
  } catch (err) {
    console.error("Error while sending mail :" + err);
  }
}

export default sendMail;
