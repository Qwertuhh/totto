import * as fs from "fs";
import { execSync } from "child_process";
import postImports from "post-imports"; 

const BUILD_DIST = "tsc -p tsconfig.json && tsc-alias";
const COPY_SRC_DIR =
'powershell -Command "cp -r dist/apps/backend/src/* dist/"';
const DELETE_APPS_DIR =
'powershell -Command "Remove-Item -Recurse -Force dist/apps/"';

if (!fs.existsSync("dist")) {
  execSync(`${BUILD_DIST} && ${COPY_SRC_DIR} && ${DELETE_APPS_DIR}`, {
    stdio: "inherit",
  });
}

//? Dist exists, and apps folder also exists
if (fs.existsSync("dist/apps")) {
  execSync(DELETE_APPS_DIR, { stdio: "inherit" });
}

postImports();
