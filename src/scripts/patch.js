// Menyamakan isi elemen `a` (halaman sekarang) dengan `b` (halaman bahasa lain)
// TANPA membuat ulang elemen, sehingga animasi, posisi scroll, dan isian form tetap utuh.
const ATTRS = ["href", "src", "alt", "aria-label", "title"];

export function patch(a, b) {
  if (a.nodeType !== b.nodeType || a.nodeName !== b.nodeName) {
    a.replaceWith(a.ownerDocument.importNode(b, true));
    return;
  }
  if (a.nodeType === 3) {
    if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue;
    return;
  }
  if (a.nodeType !== 1) return;
  for (const n of ATTRS) {
    const v = b.getAttribute(n);
    if (v === null) a.removeAttribute(n);
    else if (a.getAttribute(n) !== v) a.setAttribute(n, v);
  }
  if (a.hasAttribute("data-n")) return; // angka yang sedang dianimasikan: jangan disentuh
  const ac = [...a.childNodes], bc = [...b.childNodes];
  if (ac.length !== bc.length) {
    a.replaceChildren(...bc.map((n) => a.ownerDocument.importNode(n, true)));
    return;
  }
  ac.forEach((x, i) => patch(x, bc[i]));
}
