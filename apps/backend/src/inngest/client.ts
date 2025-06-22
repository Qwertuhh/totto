import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "task-marker"
});
const healthCheck = inngest.createFunction(
  { id: "health-check" },
  { event: "test/health.check" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  }
);
export default inngest;
export const functions = [healthCheck];
