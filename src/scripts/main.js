import { patch } from "./patch.js";
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

/* reveal saat scroll + hitung angka */
function count(el) {
  const t = +el.dataset.n, s = el.dataset.s || "", t0 = performance.now();
  (function f(now) {
    const k = Math.min((now - t0) / 1400, 1);
    el.textContent = Math.round(t * (1 - Math.pow(1 - k, 3))) + s;
    if (k < 1) requestAnimationFrame(f);
  })(t0);
}
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  e.target.classList.add("in");
  io.unobserve(e.target);
  e.target.querySelectorAll("[data-n]").forEach(count);
}), { threshold: 0.15 });
const observe = () => $$(".rv:not(.in)").forEach((el) => io.observe(el));
observe();

/* navbar: indikator, link aktif, menyempit, sembunyi */
const nav = $("#nav"), bar = $("#bar"), nul = $("#nav ul");
const ni = document.createElement("span");
ni.className = "nind";
nul.prepend(ni);
let hov = false, ly = 0;
const away = /^\/(en\/)?work/.test(location.pathname);
function place(a) {
  if (!a) { ni.style.opacity = 0; return; }
  ni.style.opacity = 1;
  ni.style.left = a.offsetLeft + "px";
  ni.style.width = a.offsetWidth + "px";
}
nul.addEventListener("pointerover", (e) => { const a = e.target.closest("a"); if (a) { hov = true; place(a); } });
nul.addEventListener("pointerleave", () => { hov = false; place($("#nav a.on")); });
addEventListener("langchange", () => requestAnimationFrame(() => { if (!hov) place($("#nav a.on")); }));

function updateTL() {
  const tl = $(".tl");
  if (!tl) return;
  const r = tl.getBoundingClientRect(), p = Math.max(0, Math.min(r.height, innerHeight * 0.62 - r.top));
  tl.querySelector(".fill").style.height = p + "px";
  tl.querySelectorAll(".st").forEach((st) => st.classList.toggle("on", st.offsetTop + 12 < p));
}
function onScroll() {
  const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  nav.classList.toggle("hide", y > ly && y > 200);
  ly = y;
  nav.classList.toggle("sm", y > 40);
  ["about", "work", "contact"].forEach((id) => {
    const a = $(`nav [data-nav="${id}"]`), sec = document.getElementById(id);
    let on = false;
    if (away) on = id === "work";
    else if (sec) { const r = sec.getBoundingClientRect(); on = r.top < innerHeight / 2 && r.bottom > innerHeight / 2; }
    a.classList.toggle("on", on);
  });
  if (!hov) place($("#nav a.on"));
  updateTL();
}
addEventListener("scroll", onScroll, { passive: true });
addEventListener("load", onScroll);
onScroll();

/* foto: tilt mengikuti kursor */
const st = $("#stage"), pt = $("#portrait");
if (st) {
  st.addEventListener("pointermove", (e) => {
    const r = st.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    pt.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
  });
  st.addEventListener("pointerleave", () => (pt.style.transform = ""));
}

/* tombol magnetik */
$$(".mag").forEach((b) => {
  b.addEventListener("pointermove", (e) => {
    const r = b.getBoundingClientRect();
    b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.15}px,${(e.clientY - r.top - r.height / 2) * 0.25}px)`;
  });
  b.addEventListener("pointerleave", () => (b.style.transform = ""));
});

/* halaman karya: tab filter */
const tabs = $("#tabs");
if (tabs) {
  const moveInd = () => {
    const b = $("#tabs .on"), i = $("#ind");
    if (!b) return;
    i.style.left = b.offsetLeft + "px";
    i.style.width = b.offsetWidth + "px";
  };
  const pick = (c, push) => {
    const b = $(`#tabs [data-c="${c}"]`) || $('#tabs [data-c="all"]');
    c = b.dataset.c;
    $$("#tabs button").forEach((x) => x.classList.toggle("on", x === b));
    moveInd();
    $$(".group").forEach((g) => {
      const show = c === "all" || g.dataset.g === c;
      g.classList.toggle("gone", !show);
      if (show) g.querySelectorAll(".rv").forEach((el, i) => {
        el.classList.remove("in"); void el.offsetWidth;
        setTimeout(() => el.classList.add("in"), 60 + i * 70);
      });
    });
    if (push) history.replaceState(null, "", c === "all" ? location.pathname : `${location.pathname}?c=${c}`);
  };
  tabs.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) pick(b.dataset.c, true); });
  addEventListener("resize", moveInd);
  addEventListener("langchange", () => requestAnimationFrame(moveInd));
  pick(new URLSearchParams(location.search).get("c") || "all", false);
  requestAnimationFrame(() => requestAnimationFrame(moveInd));
}

/* form kontak (membuka aplikasi email) */
const form = $("#form");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    ["nm", "em", "ms"].forEach((id) => {
      const el = $("#" + id), f = el.parentElement;
      const bad = !el.value.trim() || (id === "em" && !/^\S+@\S+\.\S+$/.test(el.value));
      f.classList.remove("err"); void f.offsetWidth; f.classList.toggle("err", bad);
      if (bad) ok = false;
    });
    if (!ok) return;
    const body = `${$("#ms").value}\n\n— ${$("#nm").value} (${$("#em").value})`;
    form.classList.add("sent");
    location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent($("#tp").value)}&body=${encodeURIComponent(body)}`;
    setTimeout(() => { form.classList.remove("sent"); form.reset(); }, 5000);
  });
}

/* ganti bahasa seketika (tanpa memuat ulang halaman) */
const cache = new Map();
const pathOf = (l) => $(`.lang a[data-lang="${l}"]`).getAttribute("href");
async function load(path) {
  if (cache.has(path)) return cache.get(path);
  const r = await fetch(path);
  if (!r.ok) throw new Error("gagal memuat");
  const doc = new DOMParser().parseFromString(await r.text(), "text/html");
  cache.set(path, doc);
  return doc;
}
async function switchLang(l, push) {
  try {
    const path = pathOf(l), doc = await load(path);
    patch($("main"), doc.querySelector("main"));
    patch($("footer"), doc.querySelector("footer"));
    $$("#nav [data-nav]").forEach((a) => { const n = doc.querySelector(`[data-nav="${a.dataset.nav}"]`); if (n) patch(a, n); });
    const lg = $(".logo"), nl = doc.querySelector(".logo");
    if (lg && nl) patch(lg, nl);
    document.documentElement.lang = l;
    document.title = doc.title;
    const md = doc.querySelector('meta[name="description"]');
    if (md) $('meta[name="description"]').content = md.content;
    $$(".lang a").forEach((a) => a.classList.toggle("on", a.dataset.lang === l));
    if (push) history.pushState({ lang: l }, "", path + location.search + location.hash);
    observe();
    dispatchEvent(new Event("langchange"));
    try { localStorage.setItem("lang", l); } catch (e) {}
  } catch (e) {
    location.href = pathOf(l);
  }
}
$$(".lang a").forEach((a) => {
  a.addEventListener("click", (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (a.dataset.lang !== document.documentElement.lang) switchLang(a.dataset.lang, true);
  });
  const warm = () => load(a.getAttribute("href")).catch(() => {});
  a.addEventListener("pointerenter", warm);
  a.addEventListener("focus", warm);
});
addEventListener("popstate", () => {
  const l = /^\/en(\/|$)/.test(location.pathname) ? "en" : "id";
  if (l !== document.documentElement.lang) switchLang(l, false);
});
// siapkan halaman bahasa lain di latar belakang agar pergantian terasa instan
(window.requestIdleCallback || ((f) => setTimeout(f, 800)))(() => {
  const other = document.documentElement.lang === "en" ? "id" : "en";
  load(pathOf(other)).catch(() => {});
});
