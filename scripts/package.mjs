import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const releasesDir = path.join(root, "releases");
const requiredFiles = ["manifest.json", "viewer.html", "content.js", "background.js", "icons/icon-16.png"];
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "responsive-devtool-release-"));

try {
  execFileSync(process.execPath, [path.join(root, "scripts/build.mjs")], { cwd: root, stdio: "inherit" });
  fs.mkdirSync(releasesDir, { recursive: true });

  for (const target of ["chrome", "firefox"]) {
    const buildDir = path.join(root, "dist", target);
    const stagingDir = path.join(tempDir, target);
    fs.cpSync(buildDir, stagingDir, { recursive: true });

    for (const file of requiredFiles) {
      if (!fs.existsSync(path.join(stagingDir, file))) {
        throw new Error(`${target} package is missing ${file}`);
      }
    }

    const manifest = JSON.parse(fs.readFileSync(path.join(stagingDir, "manifest.json"), "utf8"));
    if (manifest.version !== pkg.version) {
      throw new Error(`${target} manifest version ${manifest.version} does not match ${pkg.version}`);
    }

    fs.copyFileSync(path.join(root, "README.md"), path.join(stagingDir, "README.md"));
    fs.copyFileSync(path.join(root, "CREDITS.md"), path.join(stagingDir, "CREDITS.md"));

    const archivePath = path.join(releasesDir, `responsive-devtool-v${pkg.version}-${target}.zip`);
    fs.rmSync(archivePath, { force: true });
    execFileSync("zip", ["-q", "-r", "-9", archivePath, "."], { cwd: stagingDir });
    execFileSync("unzip", ["-tqq", archivePath]);
    console.log(`✔ packaged ${target} → releases/${path.basename(archivePath)}`);
  }
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
