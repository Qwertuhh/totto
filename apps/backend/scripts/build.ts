import fs from "fs";
import fse from "fs-extra";
import path from "path";
import { execSync } from "child_process";

// Define paths
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const backendSrcDir = path.join(distDir, "apps/backend/src");
const appsDir = path.join(distDir, "apps");

// Build command
const BUILD_DIST = "tsc -p tsconfig.json && tsc-alias";

// Helper to run shell commands safely
function runCommand(command: string) {
  try {
    console.log(`Executing: ${command}`);
    execSync(command, { stdio: "inherit" });
    console.log(`Successfully executed: ${command}`);
  } catch (err) {
    console.error(`Failed to execute: ${command}`);
    process.exit(1);
  }
}

// Step 2: Build
runCommand(BUILD_DIST);

// Step 3: Ensure dist exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log(`Created dist directory: ${distDir}`);
}

// Step 4: Copy backend source files to dist/
if (fs.existsSync(backendSrcDir)) {
  const targetDir = distDir;
  console.log(
    `Copying backend source files from ${backendSrcDir} to ${targetDir}`
  );
  fse.copySync(backendSrcDir, targetDir, { overwrite: true });
}

// Step 5: Remove dist/apps directory
if (fs.existsSync(appsDir)) {
  console.log(`Removing apps directory: ${appsDir}`);
  fse.removeSync(appsDir);
}

// Step 6: Run post-imports
console.log("Running postImports...");
console.log("postImports completed.");

console.log("✅ Build completed successfully!");