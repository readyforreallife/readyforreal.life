import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const outDir = path.join(root, "capacitor-www");
const hubRootCandidates = [
  process.env.RFRL_HUB_ROOT,
  path.resolve(root, "../mmmf-codex"),
  "/Users/mikey/Desktop/School/MASTERS OF TEACHING /CMP DOCUMENTS/mmmf-codex",
].filter(Boolean);
const hubRoot = hubRootCandidates.find((candidate) => fs.existsSync(candidate));

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
  "manifest.json",
  "offline.html",
  "pwa-gestures.js",
  "scenarios.json",
  "rubric.json",
  "site-search.css",
  "site-search.js",
  "site-search-index.json",
  "styles.css",
  "survey.html",
  "survey-results.html",
  "survey-results-files",
  "student-portal.html",
  "student-portal.js",
  "curriculum-library.html",
  "one-pager.html",
  "portal-approvals.html",
  "portal-submissions.html",
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
];

const docMirrors = [
  ["app.html", "app-home.html"],
  ["docs/admin/index.html", "admin/index.html"],
  ["docs/bio.html", "bio.html"],
  ["docs/game-data.js", "game-data.js"],
  ["docs/game.html", "game.html"],
  ["docs/game.js", "game.js"],
  ["docs/program.html", "program.html"],
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

function copyFromExternalBase(
  baseDir,
  sourceRelative,
  destinationRelative = sourceRelative,
) {
  const source = path.join(baseDir, sourceRelative);
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

function removeElementByMarker(html, marker, closingTag) {
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) return html;

  const startIndex = html.lastIndexOf("<", markerIndex);
  const endIndex = html.indexOf(closingTag, markerIndex);
  if (startIndex < 0 || endIndex < 0) return html;

  return `${html.slice(0, startIndex)}${html.slice(endIndex + closingTag.length)}`;
}

function sanitizeNativePages() {
  const appHomePath = path.join(outDir, "app.html");
  const indexPath = path.join(outDir, "index.html");
  if (fs.existsSync(appHomePath)) {
    fs.copyFileSync(appHomePath, indexPath);
  }

  const appHomeFiles = [appHomePath, indexPath, path.join(outDir, "app-home.html")];
  appHomeFiles.forEach((filePath) => {
    if (!fs.existsSync(filePath)) return;
    let html = fs.readFileSync(filePath, "utf8");
    html = removeElementByMarker(html, 'href="/resume.html"', "</a>");
    fs.writeFileSync(filePath, html);
  });

  const portalPath = path.join(outDir, "student-portal.html");
  if (fs.existsSync(portalPath)) {
    let html = fs.readFileSync(portalPath, "utf8");
    html = removeElementByMarker(html, 'id="signupForm"', "</form>");
    html = removeElementByMarker(html, '>Main Website</a>', "</a>");
    fs.writeFileSync(portalPath, html);
  }

  ["program.html", "bio.html"].forEach((filename) => {
    const filePath = path.join(outDir, filename);
    if (!fs.existsSync(filePath)) return;
    const html = fs
      .readFileSync(filePath, "utf8")
      .replace(/\s*<script\s+src=["']access-gate\.js["']\s+defer><\/script>/gi, "");
    fs.writeFileSync(filePath, html);
  });

  const surveyPath = path.join(outDir, "survey.html");
  if (fs.existsSync(surveyPath)) {
    let html = fs.readFileSync(surveyPath, "utf8");
    html = removeElementByMarker(html, 'href="offer.html"', "</a>");
    fs.writeFileSync(surveyPath, html);
  }

  const blockedAnchorMarkers = [
    ">Main Website</a>",
    'href="website-home.html"',
    'href="../../website-home.html"',
    'href="resume.html"',
    'href="/resume.html"',
    'href="offer.html"',
  ];
  walkFiles(outDir)
    .filter((filePath) => filePath.endsWith(".html"))
    .forEach((filePath) => {
      let html = fs.readFileSync(filePath, "utf8");
      blockedAnchorMarkers.forEach((marker) => {
        while (html.includes(marker)) {
          const updated = removeElementByMarker(html, marker, "</a>");
          if (updated === html) break;
          html = updated;
        }
      });
      html = html.replace(
        /\s*<script\s+src=["']access-gate\.js["']\s+defer><\/script>/gi,
        "",
      );
      fs.writeFileSync(filePath, html);
    });

  [
    "mmmf-hub/assets/access-gate.js",
    "mmmf-hub/docs/index.html",
    "mmmf-hub/docs/registration-intake-form.html",
    "mmmf-hub/docs/viewer.html",
    "mmmf-hub/web",
  ].forEach((relativePath) => {
    fs.rmSync(path.join(outDir, relativePath), { recursive: true, force: true });
  });
}

function walkFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, files);
      return;
    }
    files.push(fullPath);
  });
  return files;
}

function generateDocxPreview(sourcePath, destinationPath) {
  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  try {
    execFileSync("textutil", ["-convert", "html", "-output", destinationPath, sourcePath], {
      stdio: "ignore",
    });
  } catch (_err) {}
}

function generatePptxPreviewBundle(sourcePath, destinationDir) {
  const tempDir = fs.mkdtempSync(path.join(process.cwd(), ".qlpreview-"));
  try {
    execFileSync("qlmanage", ["-p", "-o", tempDir, sourcePath], {
      stdio: "ignore",
    });
    const previewDir = path.join(
      tempDir,
      `${path.basename(sourcePath)}.qlpreview`,
    );
    if (fs.existsSync(previewDir)) {
      fs.rmSync(destinationDir, { recursive: true, force: true });
      fs.mkdirSync(path.dirname(destinationDir), { recursive: true });
      fs.cpSync(previewDir, destinationDir, {
        recursive: true,
        force: true,
        dereference: true,
      });
    }
  } catch (_err) {
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

const appRoutePatch = `
<script data-capacitor-route-patch>
(() => {
  const KNOWN_APP_HOSTS = new Set([
    "readyforreal.life",
    "www.readyforreal.life",
    "readyforreallife.github.io",
    "localhost",
  ]);
  const BLOCKED_APP_PATHS = new Set(["/billing.html", "/offer.html", "/website-home.html"]);

  function explainStorePolicy() {
    window.alert(
      "This feature is not available in the iOS app. Approved users can use Portal Login.",
    );
  }

  function isUnavailableAppRoute(url) {
    return (
      BLOCKED_APP_PATHS.has(url.pathname) ||
      (url.pathname.endsWith("/index.html") && url.hash === "#get-access")
    );
  }

  function toAppPath(url) {
    if (
      url.hostname === "readyforreallife.github.io" &&
      url.pathname.startsWith("/mmmf-codex/")
    ) {
      const mappedPath = url.pathname.replace(
        /^\\/mmmf-codex\\//,
        "/mmmf-hub/",
      );
      return mappedPath + url.search + url.hash;
    }

    if (
      !KNOWN_APP_HOSTS.has(url.hostname) &&
      !(url.protocol === "capacitor:" && url.hostname === "localhost")
    ) {
      return "";
    }

    let pathname = url.pathname || "/";
    if (pathname === "/") pathname = "/index.html";
    if (pathname === "/admin/") pathname = "/admin/index.html";
    return pathname + url.search + url.hash;
  }

  function shouldIgnore(link) {
    if (link.hasAttribute("data-license-file")) return true;
    const rawHref = String(link.getAttribute("href") || "").trim();
    if (!rawHref) return true;
    if (
      rawHref.startsWith("#") ||
      rawHref.startsWith("mailto:") ||
      rawHref.startsWith("tel:") ||
      rawHref.startsWith("javascript:") ||
      rawHref.startsWith("data:")
    ) {
      return true;
    }
    return false;
  }

  function findPreferredInAppTarget(link) {
    if (!link.hasAttribute("download")) return link;
    const container = link.closest(".actions, .fallback-actions, .header-actions");
    const pairedOpen = container?.querySelector(
      'a[href]:not([download]):not([href^="#"]):not([href^="mailto:"]):not([href^="tel:"])',
    );
    return pairedOpen || link;
  }

  document.addEventListener(
    "click",
    (event) => {
      const link = event.target.closest("a[href]");
      if (!link) return;
      const targetLink = findPreferredInAppTarget(link);

      let url;
      try {
        url = new URL(targetLink.getAttribute("href"), window.location.href);
      } catch (_err) {
        return;
      }

      if (isUnavailableAppRoute(url)) {
        event.preventDefault();
        explainStorePolicy();
        return;
      }

      if (shouldIgnore(link)) return;

      const nextPath = toAppPath(url);
      if (!nextPath) return;

      event.preventDefault();
      window.location.href = nextPath;
    },
    true,
  );

  const originalOpen = window.open;
  window.open = function patchedOpen(url, target, features) {
    try {
      const parsed = new URL(String(url), window.location.href);
      if (isUnavailableAppRoute(parsed)) {
        explainStorePolicy();
        return null;
      }
      const nextPath = toAppPath(parsed);
      if (nextPath) {
        window.location.href = nextPath;
        return window;
      }
    } catch (_err) {}
    return originalOpen.call(window, url, target, features);
  };
})();
</script>`;

function injectAppRoutePatch(filePath) {
  const html = fs.readFileSync(filePath, "utf8");
  if (html.includes("data-capacitor-route-patch")) return;

  const updated = html.includes("</body>")
    ? html.replace("</body>", `${appRoutePatch}\n  </body>`)
    : `${html}\n${appRoutePatch}\n`;
  fs.writeFileSync(filePath, updated);
}

resetDir(outDir);
entries.forEach((entry) => copyFileOrDir(entry));
docMirrors.forEach(([from, to]) => copyFileOrDir(from, to));
if (hubRoot) {
  ["assets", "data", "docs", "web"].forEach((entry) => {
    copyFromExternalBase(hubRoot, entry, path.join("mmmf-hub", entry));
  });

  const hubDocsSource = path.join(hubRoot, "docs");
  const hubPreviewOut = path.join(outDir, "mmmf-hub/docs/previews");
  [
    "MMMF_Facilitator_Handbook.docx",
    "MMMF_Instructor_Guide.docx",
    "MMMF_Participant_Workbook.docx",
    "MMMF_CASEL_Survey.docx",
    "MMMF_Facilitator_Certification_Agreement.docx",
    "MMMF_Online_8Week_Syllabus.docx",
  ].forEach((filename) => {
    generateDocxPreview(
      path.join(hubDocsSource, filename),
      path.join(hubPreviewOut, `${path.parse(filename).name}.html`),
    );
  });
  generatePptxPreviewBundle(
    path.join(hubDocsSource, "MMMF_Teach_the_Teacher.pptx"),
    path.join(hubPreviewOut, "MMMF_Teach_the_Teacher.qlpreview"),
  );
}

sanitizeNativePages();

walkFiles(outDir)
  .filter((filePath) => filePath.endsWith(".html"))
  .forEach((filePath) => injectAppRoutePatch(filePath));

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
