import nodemailer from "nodemailer";
import logger from "@/utils/logger.utils";

async function sendMail(to: string, subject: string, text: string) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_SMPT_HOST!,
      port: parseInt(process.env.MAILTRAP_SMPT_PORT!),
      secure: false,
      auth: {
        user: process.env.MAILTRAP_SMPT_USERNAME!,
        pass: process.env.MAILTRAP_SMPT_PASSWORD!,
      },
    });
    if (!transporter) {
      logger.error("Error in creating transporter");
      return false;
    }

    const info = await transporter.sendMail({
      from: '"totto App" <no-reply@toroapp.dev>',
      to,
      subject,
      text,
    });

    if (!info.response.startsWith("250")) {
      logger.error("Error in sending email, response: " + info.response);
      return false;
    }
    return info;
  } catch (error) {
    logger.error("Error sending email" + error);
    return false;
  }
}

export default sendMail;
