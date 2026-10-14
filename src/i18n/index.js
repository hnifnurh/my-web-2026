import ui from "./ui.json";
import site from "../data/site.json";
import categories from "../data/categories.json";
import projects from "../data/projects.json";
import auto from "../data/translations.auto.json";
import { h } from "./hash.js";

/*
 Urutan sumber teks untuk bahasa English, per kolom/teks:
   1. English yang kamu tulis manual di "en"  (selalu menang, tidak pernah ditimpa)
   2. Terjemahan otomatis dari teks Indonesia (src/data/translations.auto.json)
   3. Teks Indonesia (cadangan, tidak pernah error)
*/
function L(idv, env, lang) {
  if (lang === "id") return idv;
  if (typeof idv === "string") {
    if (typeof env === "string" && env.trim()) return env;
    return auto[h(idv)] ?? idv;
  }
  if (Array.isArray(idv)) return idv.map((x, i) => L(x, Array.isArray(env) ? env[i] : undefined, lang));
  if (idv && typeof idv === "object") {
    const o = {};
    for (const k in idv) o[k] = L(idv[k], env && typeof env === "object" ? env[k] : undefined, lang);
    return o;
  }
  return idv;
}

export const base = (l) => (l === "en" ? "/en" : "");
export const home = (l) => (l === "en" ? "/en/" : "/");
export const getUI = (l) => ui[l];
export const getSite = (l) => ({ ...site, ...L(site.i18n.id, site.i18n.en, l), cv: site.cv[l] || site.cv.id });
export const getCats = (l) => categories.map((c) => ({ id: c.id, ...L(c.i18n.id, c.i18n.en, l) }));
export const getProjects = (l) => projects.map((p) => ({ ...p, ...L(p.i18n.id, p.i18n.en, l) }));
export const projectIds = projects.map((p) => p.id);
