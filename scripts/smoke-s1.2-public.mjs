/**
 * S1.2 — public smoke for production app (no auth).
 * Usage: node scripts/smoke-s1.2-public.mjs
 * Optional: SITE_URL=https://citabella-eight.vercel.app
 */

const base = (process.env.SITE_URL || "https://citabella-eight.vercel.app").replace(
  /\/$/,
  ""
);

const paths = [
  "/login",
  "/reservar/salon-tutis",
  "/reservar/galaxy-barberia-infantil",
];

async function check(path) {
  const url = `${base}${path}`;
  const res = await fetch(url, { redirect: "follow" });
  const text = await res.text();
  const titleMatch = text.match(/<title>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "(no title)";
  const ok = res.status === 200;
  console.log(`${ok ? "OK" : "FAIL"} ${res.status} ${url}`);
  console.log(`     title: ${title}`);
  return ok;
}

let allOk = true;
for (const path of paths) {
  try {
    const ok = await check(path);
    if (!ok) allOk = false;
  } catch (err) {
    allOk = false;
    console.log(`FAIL ${base}${path}`);
    console.log(`     ${err instanceof Error ? err.message : err}`);
  }
}

console.log(allOk ? "\nSmoke público: PASS" : "\nSmoke público: FAIL");
process.exit(allOk ? 0 : 1);
