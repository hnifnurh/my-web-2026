// Menerjemahkan teks Indonesia -> English untuk bagian yang BELUM kamu isi manual di "en".
// - English manual tidak pernah disentuh.
// - Hasil disimpan di src/data/translations.auto.json (bisa dibuka dan dikoreksi lewat "en").
// - Tanpa ANTHROPIC_API_KEY, skrip berhenti tenang dan situs memakai teks Indonesia sebagai cadangan.
import fs from "node:fs";
import { h } from "../src/i18n/hash.js";

const read = (p) => JSON.parse(fs.readFileSync(new URL(p, import.meta.url), "utf8"));
const site = read("../src/data/site.json");
const cats = read("../src/data/categories.json");
const projects = read("../src/data/projects.json");
const autoUrl = new URL("../src/data/translations.auto.json", import.meta.url);
const auto = fs.existsSync(autoUrl) ? JSON.parse(fs.readFileSync(autoUrl, "utf8")) : {};

const all = new Map();   // semua teks Indonesia saat ini
const need = new Map();  // teks yang butuh terjemahan (tidak ada English manual)
function walk(idv, env) {
  if (typeof idv === "string") {
    if (!/[A-Za-zÀ-ÿ]/.test(idv)) return;
    all.set(h(idv), idv);
    if (!(typeof env === "string" && env.trim())) need.set(h(idv), idv);
  } else if (Array.isArray(idv)) idv.forEach((x, i) => walk(x, Array.isArray(env) ? env[i] : undefined));
  else if (idv && typeof idv === "object") for (const k in idv) walk(idv[k], env && typeof env === "object" ? env[k] : undefined);
}
walk(site.i18n.id, site.i18n.en);
cats.forEach((c) => walk(c.i18n.id, c.i18n.en));
projects.forEach((p) => walk(p.i18n.id, p.i18n.en));

// buang terjemahan otomatis yang teks aslinya sudah tidak ada
for (const k of Object.keys(auto)) if (!all.has(k)) delete auto[k];
const todo = [...need].filter(([k]) => !(k in auto));
const save = () => fs.writeFileSync(autoUrl, JSON.stringify(Object.fromEntries(Object.entries(auto).sort()), null, 2) + "\n");

const key = process.env.ANTHROPIC_API_KEY;
if (!todo.length) { save(); console.log("[translate] tidak ada teks baru yang perlu diterjemahkan."); process.exit(0); }
if (!key) {
  save();
  console.log(`[translate] ${todo.length} teks belum punya English. Set ANTHROPIC_API_KEY untuk menerjemahkan otomatis; sementara dipakai teks Indonesia.`);
  process.exit(0);
}

const API = (process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com") + "/v1/messages";
const MODEL = process.env.TRANSLATE_MODEL || "claude-sonnet-5-5";
const SYSTEM = "You translate Indonesian portfolio website copy into natural, concise English. Keep proper nouns, brand and product names, tool names, numbers, and HTML tags (such as <strong>) unchanged. Return ONLY a JSON array of strings with the same length and order as the input, with no extra text.";

async function translate(batch) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: MODEL, max_tokens: 4096, system: SYSTEM, messages: [{ role: "user", content: JSON.stringify(batch) }] }),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const text = data.content.map((c) => c.text || "").join("").replace(/^```(?:json)?|```$/gm, "").trim();
  const out = JSON.parse(text);
  if (!Array.isArray(out) || out.length !== batch.length) throw new Error("jumlah hasil terjemahan tidak sesuai");
  return out;
}

try {
  for (let i = 0; i < todo.length; i += 30) {
    const part = todo.slice(i, i + 30);
    const out = await translate(part.map(([, s]) => s));
    part.forEach(([k], j) => (auto[k] = String(out[j])));
    save();
    console.log(`[translate] ${Math.min(i + 30, todo.length)}/${todo.length}`);
  }
  console.log("[translate] selesai.");
} catch (e) {
  save();
  console.warn("[translate] dilewati karena error:", e.message, "\nSitus tetap dibangun dengan teks Indonesia sebagai cadangan.");
}
