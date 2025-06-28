const { execSync } = require("child_process");

const BACKEND_DEV = "cd apps/backend && npm run dev";
const FRONTEND_DEV = "cd apps/frontend && npm run dev";

execSync(`concurrently "${BACKEND_DEV}" "${FRONTEND_DEV}"`, { stdio: "inherit" });
