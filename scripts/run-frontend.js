const { spawn } = require("child_process");
const path = require("path");

const command = process.argv[2];
if (!command) {
  console.error("Usage: node ./scripts/run-frontend.js <script>");
  process.exit(1);
}

const originalCwd = process.env.INIT_CWD || process.cwd();
const isWslUPath = /^\\\\wsl\.localhost\\/i.test(originalCwd);

function toWslPath(uncPath) {
  const trimmed = uncPath.replace(/^\\\\wsl\.localhost\\/i, "");
  const segments = trimmed.split("\\");
  const distro = segments.shift();
  const unixPath = "/" + segments.join("/");
  return { distro, unixPath };
}

let child;
if (process.platform === "win32" && isWslUPath) {
  const { distro, unixPath } = toWslPath(originalCwd);
  const frontendPath = path.posix.join(unixPath, "frontend");
  child = spawn(
    "wsl",
    ["-d", distro, "bash", "-lc", `cd '${frontendPath}' && npm run ${command}`],
    { stdio: "inherit" }
  );
} else if (process.platform === "win32") {
  const frontendDir = path.join(originalCwd, "frontend");
  child = spawn("cmd", ["/c", "pushd", frontendDir, "&&", "npm", "run", command], {
    stdio: "inherit",
  });
} else {
  const frontendDir = path.join(originalCwd, "frontend");
  child = spawn("npm", ["run", command], {
    cwd: frontendDir,
    stdio: "inherit",
  });
}

child.on("exit", (code) => {
  process.exit(code);
});

child.on("error", (err) => {
  console.error(err);
  process.exit(1);
});
