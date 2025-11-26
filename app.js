document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("saveBtn");
  if (!saveBtn) return;

  saveBtn.addEventListener("click", () => {
    const c = extractContact();

    if (!c.fn && !c.tel && !c.email) {
      alert("Non trovo dati contatto nella pagina.");
      return;
    }

    const vcf = buildVCard(c);
    downloadVcf(vcf, (c.fn || "contatto") + ".vcf");
  });
});

function extractContact() {
  const wrap = document.querySelector(".wrap") || document.body;

  const fn = textOf(wrap.querySelector("h1"));
  const title = textOf(wrap.querySelector("h2"));
  const org = textOf(wrap.querySelector(".mediate-logo h3"));

  const rows = [...wrap.querySelectorAll(".card .row")];

  const map = {};
  rows.forEach(row => {
    const label = textOf(row.querySelector(".label")).toLowerCase();
    const valueEl = row.querySelector(".value");
    let valueText = textOf(valueEl);

    // se c'è un link dentro value, preferisci l'href
    const a = valueEl ? valueEl.querySelector("a") : null;
    if (a && a.getAttribute("href")) {
      valueText = a.getAttribute("href");
    }

    map[label] = valueText;
  });

  const email = cleanMail(map["email"] || "");
  const tel = cleanTel(map["phone"] || "");
  const url = cleanUrl(map["web site"] || "");
  const linkedin = cleanUrl(map["linkedin"] || "");
  const address = (map["address"] || "").trim();

  return { fn, title, org, email, tel, url, linkedin, address };
}

function buildVCard(c) {
  // vCard 3.0 (iOS/Android)
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    c.fn ? `FN:${escapeVCard(c.fn)}` : "",
    c.org ? `ORG:${escapeVCard(c.org)}` : "",
    c.title ? `TITLE:${escapeVCard(c.title)}` : "",
    c.tel ? `TEL;TYPE=CELL:${escapeVCard(c.tel)}` : "",
    c.email ? `EMAIL:${escapeVCard(c.email)}` : "",
    c.url ? `URL:${escapeVCard(c.url)}` : "",
    // Address: formato ADR;TYPE=WORK:;;street;city;region;postal;country
    c.address ? `ADR;TYPE=WORK:;;${escapeVCard(c.address)};;;;` : "",
    // LinkedIn come nota extra
    c.linkedin ? `NOTE:LinkedIn ${escapeVCard(c.linkedin)}` : "",
    "END:VCARD"
  ];

  return lines.filter(Boolean).join("\n");
}

function downloadVcf(text, filename) {
  const blob = new Blob([text], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

// Helpers
function textOf(el) {
  return el ? el.textContent.trim() : "";
}

function cleanTel(tel) {
  if (!tel) return "";
  return tel.replace(/^tel:/i, "").replace(/\s+/g, "").trim();
}

function cleanMail(mail) {
  if (!mail) return "";
  return mail.replace(/^mailto:/i, "").trim();
}

function cleanUrl(url) {
  if (!url) return "";
  return url.replace(/^https?:\/\//i, m => m.toLowerCase()).trim();
}

function escapeVCard(str = "") {
  return String(str)
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}
