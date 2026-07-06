const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const command = process.argv[2];
if (!command) {
  console.error("Usage: node ./scripts/run-frontend.js <script>");
  process.exit(1);
}

function getFrontendDir() {
  const candidates = [
    path.resolve(__dirname, "..", "frontend"),
    path.resolve(process.cwd(), "frontend"),
    path.resolve(process.cwd()),
  ];

  return candidates.find((candidate) => fs.existsSync(path.join(candidate, "package.json"))) || candidates[0];
}

function getNpmCommand(platform = process.platform) {
  return platform === "win32"
    ? { type: "cmd", execPath: "cmd.exe", args: ["/d", "/s", "/c", "npm.cmd"] }
    : { type: "shell", execPath: "npm", args: [] };
}

const frontendDir = getFrontendDir();
const npmCommand = getNpmCommand();
const child =
  npmCommand.type === "cmd"
    ? spawn(npmCommand.execPath, [...npmCommand.args, "run", command], {
        cwd: frontendDir,
        stdio: "inherit",
      })
    : spawn(npmCommand.execPath, [...npmCommand.args, "run", command], {
        cwd: frontendDir,
        stdio: "inherit",
      });

child.on("exit", (code) => {
  process.exit(code);
});

child.on("error", (err) => {
  console.error(err);
  process.exit(1);
});

module.exports = {
  getFrontendDir,
  getNpmCommand,
};
