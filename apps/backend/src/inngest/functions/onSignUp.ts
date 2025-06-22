import inngest from "@/inngest/client";
import User, { IUser } from "@/models/user.model";
import logger from "@/utils/logger.utils";
import sendMail from "@/utils/mailer.utils";
import { NonRetriableError } from "inngest";
import { emailProtection } from "@/utils/IIPProtection";

const onSignup = inngest.createFunction(
  {
    id: "on-signup",
    retries: 2,
  },
  {
    event: "user/created",
  },
  async ({ event, step }) => {
    try {
      const { email } = event.data;
      if(!email) {
        logger.error("Email is required");
      }
      const user = (await step.run("get-user-email", async () => {
        const user = await User.findOne({ email });
        if (!user) {
          logger.error("User not found with email: " + emailProtection(email));
          throw new NonRetriableError("User not found");
        }
        return user as IUser;
      })) as IUser;

      const mailResponse = await step.run("send-welcome-email", async () => {
        const subject = "Welcome to totto!";
        const text = `Hello ${user.name},\n\nWelcome to totto! We're excited to have you join our community.\n\nBest,\nThe totto Team`;
        await sendMail(user.email, subject, text);
      });

      if(!mailResponse) {
        throw new NonRetriableError("Email not sent due to mailing error");
      }
      return {userId: user.id, email: user.email, success: true };
    } catch (error) {
      logger.error(error);
      return { success: false };
    }
  }
);

export default onSignup;
