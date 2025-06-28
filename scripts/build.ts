import { execSync } from "child_process";
import fs from "fs";
import fse from "fs-extra";
import path from "path";

// Absolute paths
const root = path.resolve(__dirname, "..");
const distPath = path.resolve(root, "dist");
const frontendPath = path.resolve(root, "apps/frontend");
const backendPath = path.resolve(root, "apps/backend");

// Remove dist/
if (fs.existsSync(distPath)) {
  try {
    fse.removeSync(distPath);
  } catch (error) {
    console.error("Error removing dist directory:", error);
    process.exit(1);
  }
}

const shell = process.platform === "win32" ? "cmd.exe" : "/bin/sh";

// Build frontend and backend
try {
  execSync("npm run build", {
    cwd: frontendPath,
    stdio: "inherit",
    shell,
  });
} catch (error) {
  console.error("Error building frontend:", error);
  process.exit(1);
}

try {
  execSync("npm run build", {
    cwd: backendPath,
    stdio: "inherit",
    shell,
  });
} catch (error) {
  console.error("Error building backend:", error);
  process.exit(1);
}

// Copy build outputs
try {
  fse.copySync(
    path.join(frontendPath, "dist"),
    path.join(distPath, "frontend")
  );
  fse.copySync(path.join(backendPath, "dist"), path.join(distPath, "backend"));
} catch (error) {
  console.error("Error copying build outputs:", error);
  process.exit(1);
}

console.log("Build completed successfully!");
