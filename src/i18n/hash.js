import { createHash } from "node:crypto";
// Kunci terjemahan otomatis = hash teks Indonesia. Jika teks Indonesia berubah, terjemahannya dibuat ulang.
export const h = (s) => createHash("sha1").update(String(s).trim()).digest("hex").slice(0, 12);
