import Mailgen from "mailgen";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// ✅ Mailtrap or SMTP Transporter
const mailTransporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.mailtrap.io",
  port: Number(process.env.MAIL_PORT) || 2525,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

// ✅ Mailgen configuration (for beautiful HTML emails)
const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "E-Commerce",
    link: process.env.CLIENT_URL || "http://localhost:3000",
    logo: "https://cdn-icons-png.flaticon.com/512/3737/3737372.png",
    copyright: `© ${new Date().getFullYear()} E-Commerce. All rights reserved.`,
  },
});

export { mailGenerator, mailTransporter };
