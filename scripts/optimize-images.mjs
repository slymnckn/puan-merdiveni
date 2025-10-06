#!/usr/bin/env node
import { promises as fs } from "node:fs";
import { performance } from "node:perf_hooks";
import { parseArgs } from "node:util";
import path from "node:path";
import process from "node:process";
import fg from "fast-glob";
import imagemin from "imagemin";
import imageminOptipng from "imagemin-optipng";
import imageminJpegtran from "imagemin-jpegtran";

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);
  const value = bytes / 1024 ** i;
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`;
}

async function ensureDirectoryExists(dir) {
  try {
    const stats = await fs.stat(dir);
    if (!stats.isDirectory()) {
      throw new Error(`${dir} exists but is not a directory`);
    }
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(`Directory not found: ${dir}`);
    }
    throw error;
  }
}

async function optimizeFile(filePath, { dryRun = false, force = false }) {
  const original = await fs.readFile(filePath);
  const isPng = filePath.toLowerCase().endsWith(".png");
  const plugins = isPng
    ? [imageminOptipng({ optimizationLevel: 3 })]
    : [imageminJpegtran({ progressive: true })];

  const optimized = await imagemin.buffer(original, { plugins });

  if (!force && optimized.length >= original.length) {
    return { updated: false, skipped: true, before: original.length, after: optimized.length };
  }

  if (!dryRun) {
    await fs.writeFile(filePath, optimized);
  }

  return { updated: true, skipped: false, before: original.length, after: optimized.length };
}

async function main() {
  const { values, positionals } = parseArgs({
    options: {
      dir: { type: "string", short: "d" },
      "dry-run": { type: "boolean", default: false },
      force: { type: "boolean", default: false }
    },
    allowPositionals: true
  });

  const targetDir = path.resolve(process.cwd(), values.dir ?? positionals[0] ?? "public");
  const dryRun = values["dry-run"];
  const force = values.force;

  await ensureDirectoryExists(targetDir);

  const patterns = ["**/*.png", "**/*.jpg", "**/*.jpeg"];
  const files = await fg(patterns, {
    cwd: targetDir,
    absolute: true,
    onlyFiles: true,
    followSymbolicLinks: false,
    caseSensitiveMatch: false
  });

  if (files.length === 0) {
    console.log(`No PNG or JPEG files found under ${targetDir}`);
    return;
  }

  console.log(`Optimizing ${files.length} image${files.length === 1 ? "" : "s"} under ${targetDir}${dryRun ? " (dry run)" : ""}...`);

  const start = performance.now();
  let totalBefore = 0;
  let totalAfter = 0;
  let optimizedCount = 0;
  let skippedCount = 0;

  for (const file of files) {
    try {
      const { updated, skipped, before, after } = await optimizeFile(file, { dryRun, force });
      totalBefore += before;
      totalAfter += updated ? after : before;

      if (updated) {
        optimizedCount += 1;
        const saving = before - after;
        const percent = before === 0 ? 0 : (saving / before) * 100;
        const statusLabel = saving >= 0 ? "saved" : "grew";
        console.log(`✓ ${path.relative(targetDir, file)} - ${statusLabel} ${formatBytes(Math.abs(saving))} (${percent.toFixed(1)}%)`);
      } else if (skipped) {
        skippedCount += 1;
      }
    } catch (error) {
      console.error(`✗ Failed to optimize ${path.relative(targetDir, file)}:`, error.message);
    }
  }

  const durationMs = performance.now() - start;
  const totalSaved = totalBefore - totalAfter;

  console.log("");
  console.log(`Files processed: ${files.length}`);
  console.log(`Optimized: ${optimizedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Total size before: ${formatBytes(totalBefore)}`);
  console.log(`Total size after: ${formatBytes(totalAfter)}`);
  console.log(`Total saved: ${formatBytes(totalSaved)} (${totalBefore === 0 ? "0.0" : ((totalSaved / totalBefore) * 100).toFixed(1)}%)`);
  console.log(`Elapsed: ${(durationMs / 1000).toFixed(2)}s`);

  if (dryRun) {
    console.log("Dry run complete. Re-run without --dry-run to apply changes.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
