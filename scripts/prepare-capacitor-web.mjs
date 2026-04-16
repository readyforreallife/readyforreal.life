import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const outDir = path.join(root, "capacitor-www");

const entries = [
  "app.html",
  "app.js",
  "details.html",
  "details.copytest.html",
  "favicon.ico",
  "flyer.css",
  "flyer.html",
  "flyer-social.css",
  "flyer-social.html",
  "index.html",
  "manifest.json",
  "offline.html",
  "pwa-gestures.js",
  "resume.html",
  "scenarios.json",
  "rubric.json",
  "site-search.css",
  "site-search.js",
  "site-search-index.json",
  "styles.css",
  "sw.js",
  "apple-touch-icon-rfrl.png",
  "apple-touch-icon.png",
  "apple-touch-icon-v2.png",
  "mekenzi-terry-headshot.png",
  "michael-terry-headshot.jpg",
  "michael-terry-resume.pdf",
  "MMMF_OnePager.pdf",
  "ModernManners Community Revenue.pdf",
  "ModernManners School Revenue.pdf",
  "assets",
  "docs",
  "worker",
];

const docMirrors = [
  ["app.html", "app-home.html"],
  ["index.html", "website-home.html"],
  ["docs/access-gate.js", "access-gate.js"],
  ["docs/admin/index.html", "admin/index.html"],
  ["docs/billing.html", "billing.html"],
  ["docs/bio.html", "bio.html"],
  ["docs/game-data.js", "game-data.js"],
  ["docs/game.html", "game.html"],
  ["docs/game.js", "game.js"],
  ["docs/index.html", "full-curriculum.html"],
  ["docs/offer.html", "offer.html"],
  ["docs/program.html", "program.html"],
  ["docs/resume.html", "curriculum-resume.html"],
];

function resetDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function copyFileOrDir(sourceRelative, destinationRelative = sourceRelative) {
  const source = path.join(root, sourceRelative);
  const destination = path.join(outDir, destinationRelative);
  if (!fs.existsSync(source)) return;

  const stats = fs.statSync(source);
  if (stats.isDirectory()) {
    fs.cpSync(source, destination, {
      recursive: true,
      force: true,
      dereference: true,
    });
    return;
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

resetDir(outDir);
entries.forEach((entry) => copyFileOrDir(entry));
docMirrors.forEach(([from, to]) => copyFileOrDir(from, to));

// Native launches should land on the full website homepage.

const appIconSource = path.join(root, "assets/icons/icon-512-rfrl.png");

function resizePng(source, destination, size) {
  if (!fs.existsSync(source)) return;
  fs.mkdirSync(path.dirname(destination), { recursive: true });

  try {
    execFileSync(
      "sips",
      ["-z", String(size), String(size), source, "--out", destination],
      {
        stdio: "ignore",
      },
    );
  } catch {
    fs.copyFileSync(source, destination);
  }
}

if (fs.existsSync(appIconSource)) {
  resizePng(
    appIconSource,
    path.join(
      root,
      "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png",
    ),
    1024,
  );

  const androidIconSizes = [
    ["mipmap-mdpi", 48],
    ["mipmap-hdpi", 72],
    ["mipmap-xhdpi", 96],
    ["mipmap-xxhdpi", 144],
    ["mipmap-xxxhdpi", 192],
  ];

  androidIconSizes.forEach(([folder, size]) => {
    const baseDir = path.join(root, "android/app/src/main/res", folder);
    [
      "ic_launcher.png",
      "ic_launcher_round.png",
      "ic_launcher_foreground.png",
    ].forEach((filename) => {
      resizePng(appIconSource, path.join(baseDir, filename), size);
    });
  });
}

console.log(`Prepared Capacitor web bundle in ${outDir}`);
