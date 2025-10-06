/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
const { spawn } = require("child_process");

const log = (message) => console.log(`[build] ${message}`);

const resolveDefaultBasePath = () => {
  if (process.env.NEXT_PUBLIC_BASE_PATH && process.env.NEXT_PUBLIC_BASE_PATH.trim()) {
    return process.env.NEXT_PUBLIC_BASE_PATH.trim();
  }

  const candidates = [process.env.BUILD_BASE_PATH, process.env.PUBLIC_BASE_PATH, process.env.GAME_TYPE]
    .filter(Boolean)
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .map((value) => (value.startsWith("/") ? value : `/${value}`));

  if (candidates.length > 0) {
    const detected = candidates[0];
    log(`Detected base path from environment (${detected}).`);
    return detected;
  }

  const fallback = "/puan-merdiveni";
  log(`NEXT_PUBLIC_BASE_PATH missing — defaulting to '${fallback}'. Set NEXT_PUBLIC_BASE_PATH or BUILD_BASE_PATH to override.`);
  return fallback;
};

const normalizeBasePath = (value) => {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed || trimmed === "/") return "";
  const prefixed = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return prefixed.endsWith("/") ? prefixed.slice(0, -1) : prefixed;
};

const disableBasePath = String(process.env.DISABLE_BASE_PATH || "").toLowerCase() === "true";
const preparedBasePath = disableBasePath ? "" : normalizeBasePath(resolveDefaultBasePath());
process.env.NEXT_PUBLIC_BASE_PATH = preparedBasePath;

if (disableBasePath) {
  log("DISABLE_BASE_PATH is true — building without a base path override.");
} else {
  log(`Using NEXT_PUBLIC_BASE_PATH='${preparedBasePath}'`);
}

const nextExecutable = process.platform === "win32" ? "next.cmd" : "next";
const child = spawn(nextExecutable, ["build"], {
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});

child.on("close", (code) => {
  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
