const { execSync } = require("child_process");

const BACKEND_START = "cd apps/backend && npm run start";
const FRONTEND_START = "cd apps/frontend && npm run preview";

execSync(`concurrently "${BACKEND_START}" "${FRONTEND_START}"`, { stdio: "inherit" });
