#!/usr/bin/env node
/**
 * Copia el frontend a www/ para Capacitor (rutas relativas + API en Render).
 */
import { cpSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const staticDir = join(root, "backend", "static");
const wwwDir = join(root, "www");

const API_BASE = process.env.CEROMANCIA_API_BASE || "https://ceromancia-velas.onrender.com";

rmSync(wwwDir, { recursive: true, force: true });
mkdirSync(wwwDir, { recursive: true });
mkdirSync(join(wwwDir, "static"), { recursive: true });

cpSync(staticDir, join(wwwDir, "static"), { recursive: true });

for (const file of ["manifest.webmanifest", "sw.js"]) {
  cpSync(join(staticDir, file), join(wwwDir, file));
}

let html = readFileSync(join(staticDir, "index.html"), "utf8");
html = html
  .replace(/href="\/manifest\.webmanifest"/g, 'href="./manifest.webmanifest"')
  .replace(/href="\/static\//g, 'href="./static/')
  .replace(/src="\/static\//g, 'src="./static/')
  .replace(
    /<script src="\/static\/app\.js/,
    '<script src="./config.js"></script>\n  <script src="./static/app.js',
  );

writeFileSync(join(wwwDir, "index.html"), html, "utf8");

writeFileSync(
  join(wwwDir, "config.js"),
  `window.CEROMANCIA_API_BASE = ${JSON.stringify(API_BASE)};\n`,
  "utf8",
);

console.log(`www/ listo → API: ${API_BASE}`);
