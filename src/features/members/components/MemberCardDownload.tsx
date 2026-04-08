import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { MemberResponseDTO, CardResponseDTO } from "@/types";
import QRCode from "qrcode";
import dayjs from "dayjs";

interface Props {
  member: MemberResponseDTO;
  card: CardResponseDTO;
  clubName?: string;
}

export default function MemberCardDownload({ member, card, clubName }: Props) {
  const handleDownload = async () => {
    const photoAbsolute = member.photoUrl
      ? `http://localhost:3000${new URL(member.photoUrl).pathname}`
      : null;

    // Generate front QR — verification payload (JWT token)
    const frontQrDataUrl = await QRCode.toDataURL(card.qrPayload, {
      width: 200,
      margin: 1,
      color: {
        dark: "#003f8a",
        light: "#ffffff",
      },
    });

    // Generate back QR — embedded plain text (name + license + season)
    const backQrText = `${member.fullName}\n${card.licenseNumber}\nSaison ${card.season}`;
    const backQrDataUrl = await QRCode.toDataURL(backQrText, {
      width: 200,
      margin: 1,
      color: {
        dark: "#ffffff",
        light: "#0077c8",
      },
    });

    const html = buildCardHtml(
      member,
      card,
      photoAbsolute,
      clubName,
      frontQrDataUrl,
      backQrDataUrl,
    );

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.onload = () => setTimeout(() => win.print(), 800);
  };

  return (
    <Button
      type="primary"
      icon={<DownloadOutlined />}
      onClick={() => void handleDownload()}
      block
      style={{
        background: "#0077c8",
        borderColor: "#0077c8",
        color: "#fff",
        fontWeight: 700,
        height: 40,
        borderRadius: 8,
        marginTop: 12,
      }}
    >
      Télécharger la carte
    </Button>
  );
}

// ─── Labels ───────────────────────────────────────────────────────────────────
const CAT: Record<string, string> = {
  junior: "Junior",
  u23: "U23",
  senior: "Senior",
};

const GENDER_LABEL: Record<string, string> = {
  male: "Masculin",
  female: "Féminin",
  other: "Autre",
};

// ─── HTML builder ─────────────────────────────────────────────────────────────
function buildCardHtml(
  member: MemberResponseDTO,
  card: CardResponseDTO,
  photoUrl: string | null,
  clubName: string | undefined,
  frontQrUrl: string,
  backQrUrl: string,
): string {
  const validUntil = dayjs(card.validUntil).format("DD/MM/YYYY");
  const validFrom = dayjs(card.validFrom).format("DD/MM/YYYY");
  const dob = member.dateOfBirth
    ? dayjs(member.dateOfBirth).format("DD/MM/YYYY")
    : "—";
  const clubDisplay = clubName ?? (member.clubId ? "—" : "Sans club");
  const typeDisplay = GENDER_LABEL[member.gender] ?? member.gender;

  const photoHtml = photoUrl
    ? `<img src="${photoUrl}" class="photo-img" crossorigin="anonymous"
         onerror="this.parentElement.innerHTML='<div class=\\'photo-fallback\\'>${member.firstName.charAt(0)}</div>'" />`
    : `<div class="photo-fallback">${member.firstName.charAt(0)}</div>`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<title>Carte — ${member.fullName}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }

  body {
    background: #ccc;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 24px;
    gap: 28px;
    font-family: Arial, sans-serif;
  }

  .card {
    width: 856px; height: 540px;
    border-radius: 16px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  }

  /* ══ FRONT ══ */
  .front { background: #ffffff; }

  .header-band {
    position: absolute;
    top:0; left:0; right:0; height:140px;
    background: linear-gradient(90deg,#003f8a 0%,#0077c8 60%,#00a3e0 100%);
    display: flex; align-items: center;
    padding: 0 28px; gap: 18px; z-index: 2;
  }

  .fed-logo {
    width:96px; height:96px; border-radius:50%;
    border:3px solid rgba(255,255,255,0.7);
    background:rgba(255,255,255,0.15);
    display:flex; align-items:center; justify-content:center;
    flex-shrink:0;
  }

  .fed-logo-text {
    display:flex; flex-direction:column;
    align-items:center; text-align:center;
  }

  .fed-logo-icon { font-size:28px; line-height:1; }

  .fed-logo-sub {
    font-size:8px; font-weight:700; color:#fff;
    text-transform:uppercase; letter-spacing:1px; margin-top:4px;
  }

  .fed-titles { display:flex; flex-direction:column; }

  .fed-line1 {
    font-size:14px; font-weight:400;
    color:rgba(255,255,255,0.9);
    text-transform:uppercase; letter-spacing:1.5px;
  }

  .fed-line2 {
    font-size:34px; font-weight:900; color:#fff;
    text-transform:uppercase; letter-spacing:3px;
    font-style:italic; line-height:1;
    text-shadow:0 2px 8px rgba(0,0,0,0.3);
  }

  .accent-lines {
    position:absolute; top:18px; right:20px; z-index:3;
    display:flex; flex-direction:column; gap:7px;
    transform:rotate(-8deg);
  }

  .accent-line {
    height:6px; border-radius:3px;
    background:rgba(255,255,255,0.55);
  }

  .wave {
    position:absolute; top:100px; left:0;
    width:860px; height:90px;
    background:linear-gradient(90deg,#0077c8 0%,#00a3e0 70%,transparent 100%);
    clip-path:polygon(0 0,78% 0,62% 100%,0 100%);
    z-index:1;
  }

  /* Name — white on blue wave */
  .member-name {
    position:absolute; top:140px; left:10px;
    font-size:30px; font-weight:900; font-style:italic;
    color:#ffffff; z-index:3; white-space:nowrap;
    text-shadow:0 2px 6px rgba(0,0,0,0.3);
  }

  .name-deco {
    position:absolute; top:198px; left:36px;
    width:340px; z-index:3;
    display:flex; align-items:center; gap:5px;
  }

  .tri {
    width:0; height:0;
    border-top:8px solid transparent;
    border-bottom:8px solid transparent;
    border-left:12px solid #0077c8;
    flex-shrink:0;
  }

  .tri-sm {
    border-top-width:5px; border-bottom-width:5px;
    border-left-width:8px; border-left-color:#00a3e0;
  }

  .deco-line {
    flex:1; height:3px;
    background:linear-gradient(90deg,#0077c8,rgba(0,119,200,0.1));
  }

  .info-block {
    position:absolute; top:220px; left:36px; z-index:3;
    display:flex; flex-direction:column; gap:15px;
  }

  .info-row {
    display:flex; align-items:flex-start; gap:10px;
    font-size:18px; color:#003f8a;
  }

  .arrow {
    width:0; height:0;
    border-top:9px solid transparent;
    border-bottom:9px solid transparent;
    border-left:13px solid #0077c8;
    margin-top:5px; flex-shrink:0;
  }

  .i-label { font-weight:700; min-width:130px; line-height:1.3; }
  .i-sep   { margin:0 4px; color:#003f8a; }
  .i-val   { font-weight:700; color:#0077c8; }

  .right-col {
    position:absolute; top:120px; right:36px;
    width:230px; z-index:3;
    display:flex; flex-direction:column;
    align-items:center; gap:16px;
  }

  .photo-circle {
    width:168px; height:168px; border-radius:50%;
    border:4px solid #0077c8; overflow:hidden;
    background:#e4eef8;
    display:flex; align-items:center; justify-content:center;
  }

  .photo-img  { width:100%; height:100%; object-fit:cover; }

  .photo-fallback {
    font-size:56px; font-weight:700; color:#0077c8;
  }

  .license-block { text-align:center; }
  .license-label { font-size:15px; font-weight:700; color:#333; }

  .license-num {
    font-size:24px; font-weight:900;
    color:#0077c8; letter-spacing:1px;
  }

  .validity { font-size:14px; color:#555; text-align:center; }

  .validity-date { font-weight:700; font-style:italic; color:#0077c8; }

  /* Front QR */
  .front-qr {
    position:absolute; bottom:18px; right:18px;
    width:104px; height:104px;
    border:2px solid #e0e0e0; border-radius:8px;
    padding:4px; background:#fff; z-index:3;
  }

  .front-qr img { width:100%; height:100%; }

  .bottom-stripe {
    position:absolute; bottom:0; right:0;
    width:320px; height:84px;
    background:linear-gradient(135deg,transparent 38%,#0077c8 38%);
    z-index:1;
  }

  /* ══ BACK ══ */
  .back {
    background:linear-gradient(160deg,#003f8a 0%,#0077c8 50%,#00a3e0 100%);
  }

  .back-magstripe {
    position:absolute; top:84px; left:0; right:0;
    height:72px; background:#1a1a1a;
  }

  .back-wm {
    position:absolute; top:50%; left:50%;
    transform:translate(-50%,-50%);
    font-size:130px; font-weight:900;
    color:rgba(255,255,255,0.04);
    letter-spacing:10px; white-space:nowrap;
    pointer-events:none; user-select:none;
  }

  .back-body {
    position:absolute; top:172px;
    left:36px; right:36px;
  }

  .back-title {
    font-size:19px; font-weight:900;
    text-transform:uppercase; letter-spacing:3px;
    color:#D9AE40; text-align:center;
    margin-bottom:16px;
  }

  .back-hr {
    height:1px; background:rgba(255,255,255,0.2);
    margin-bottom:20px;
  }

  .back-grid {
    display:grid; grid-template-columns:1fr 1fr;
    gap:18px 40px;
  }

  .bf-label {
    font-size:11px; color:rgba(255,255,255,0.6);
    text-transform:uppercase; letter-spacing:1px;
    margin-bottom:4px;
  }

  .bf-val { font-size:16px; font-weight:700; color:#fff; }

  .back-foot {
    position:absolute; bottom:20px;
    left:36px; right:36px;
    display:flex; justify-content:flex-end; align-items:center;
  }

  /* Back QR — white on blue */
  .back-qr {
    width:88px; height:88px;
    background:#0077c8; border-radius:8px;
    padding:4px;
  }

  .back-qr img { width:100%; height:100%; }

  /* ══ PRINT ══ */
  @media print {
    body { background:white; padding:0; gap:12mm; }
    .no-print { display:none !important; }

    .card {
      width:85.6mm; height:54mm;
      box-shadow:none; border-radius:4mm;
      -webkit-print-color-adjust:exact;
      print-color-adjust:exact;
      page-break-inside:avoid;
    }

    .header-band  { height:14mm; padding:0 3mm; gap:2mm; }
    .fed-logo     { width:9.6mm; height:9.6mm; border-width:0.3mm; }
    .fed-logo-icon{ font-size:8pt; }
    .fed-logo-sub { font-size:4pt; margin-top:0.5mm; }
    .fed-line1    { font-size:5pt; letter-spacing:0.5pt; }
    .fed-line2    { font-size:10pt; letter-spacing:1pt; }

    .accent-lines { top:2mm; right:2mm; gap:0.7mm; }
    .accent-line  { height:0.6mm; }

    .wave         { top:10mm; height:10mm; width:82mm; }
    .member-name  { top:15mm; left:2.6mm; font-size:8pt; }
    .name-deco    { top:20mm; left:3.6mm; width:34mm; gap:0.5mm; }
    .tri          { border-top-width:1mm; border-bottom-width:1mm; border-left-width:1.5mm; }
    .tri-sm       { border-top-width:0.7mm; border-bottom-width:0.7mm; border-left-width:1mm; }
    .deco-line    { height:0.3mm; }

    .info-block   { top:22mm; left:3.6mm; gap:1.5mm; }
    .info-row     { font-size:5.5pt; gap:1mm; }
    .arrow        { border-top-width:1mm; border-bottom-width:1mm; border-left-width:1.3mm; margin-top:0.5mm; }
    .i-label      { min-width:13mm; }

    .right-col    { top:12mm; right:3.6mm; width:23mm; gap:1.5mm; }
    .photo-circle { width:17mm; height:17mm; border-width:0.4mm; }
    .photo-fallback { font-size:16pt; }
    .license-label{ font-size:5pt; }
    .license-num  { font-size:7.5pt; letter-spacing:0.5pt; }
    .validity     { font-size:4.5pt; }

    .front-qr     { bottom:1.8mm; right:1.8mm; width:11mm; height:11mm; border-radius:1mm; padding:0.5mm; border-width:0.2mm; }
    .bottom-stripe{ width:32mm; height:8.4mm; }

    .back-magstripe{ top:8.4mm; height:7.2mm; }
    .back-wm      { font-size:40pt; letter-spacing:3pt; }
    .back-body    { top:17mm; left:3.6mm; right:3.6mm; }
    .back-title   { font-size:6pt; letter-spacing:1pt; margin-bottom:1.5mm; }
    .back-hr      { margin-bottom:2mm; }
    .back-grid    { gap:1.8mm 4mm; }
    .bf-label     { font-size:3.5pt; margin-bottom:0.5mm; }
    .bf-val       { font-size:5.5pt; }
    .back-foot    { bottom:2mm; left:3.6mm; right:3.6mm; }
    .back-qr      { width:10mm; height:10mm; border-radius:1mm; padding:0.5mm; }

    @page { size:A4; margin:15mm; }
  }
</style>
</head>
<body>

<p class="no-print" style="color:#555;font-size:12px;font-weight:700;letter-spacing:2px;margin-bottom:-12px">◼ RECTO</p>

<!-- FRONT -->
<div class="card front">
  <div class="header-band">
    <div class="fed-logo">
      <div class="fed-logo-text">
        <div class="fed-logo-icon">🚣</div>
        <div class="fed-logo-sub">FRM AVIRON</div>
      </div>
    </div>
    <div class="fed-titles">
      <span class="fed-line1">Fédération Royale Marocaine</span>
      <span class="fed-line2">D'AVIRON</span>
    </div>
  </div>

  <div class="accent-lines">
    <div class="accent-line" style="width:190px"></div>
    <div class="accent-line" style="width:130px;opacity:0.6"></div>
    <div class="accent-line" style="width:75px;opacity:0.3"></div>
  </div>

  <div class="wave"></div>

  <div class="member-name">${member.fullName}</div>

  <div class="name-deco" style="display:none">
    <div class="tri"></div>
    <div class="tri tri-sm"></div>
    <div class="deco-line"></div>
  </div>

  <div class="info-block">
    <div class="info-row">
      <div class="arrow"></div>
      <span class="i-label">Catégorie</span>
      <span class="i-sep">:</span>
      <span class="i-val">${CAT[member.category] ?? member.category}</span>
    </div>
    <div class="info-row">
      <div class="arrow"></div>
      <span class="i-label">Club</span>
      <span class="i-sep">:</span>
      <span class="i-val">${clubDisplay}</span>
    </div>
    <div class="info-row">
      <div class="arrow"></div>
      <div style="display:flex;flex-direction:column;gap:1px">
        <span class="i-label">Date</span>
        <span class="i-label">de Naissance</span>
      </div>
      <span class="i-sep">:</span>
      <span class="i-val">${dob}</span>
    </div>
    <div class="info-row">
      <div class="arrow"></div>
      <span class="i-label">Type</span>
      <span class="i-sep">:</span>
      <span class="i-val">${typeDisplay}</span>
    </div>
  </div>

  <div class="right-col">
    <div class="photo-circle">${photoHtml}</div>
    <div class="license-block">
      <div class="license-label">Numéro de Licence :</div>
      <div class="license-num">${card.licenseNumber}</div>
    </div>
    <div class="validity">
      Valable jusqu'au <span class="validity-date">${validUntil}</span>
    </div>
  </div>

  <!-- Front QR — JWT verification token -->
  <div class="front-qr">
    <img src="${backQrUrl}" alt="QR Vérification" />
  </div>

  <div class="bottom-stripe"></div>
</div>

<p class="no-print" style="color:#555;font-size:12px;font-weight:700;letter-spacing:2px;margin-bottom:-12px">◼ VERSO</p>

<!-- BACK -->
<div class="card back">
  <div class="back-magstripe"></div>
  <div class="back-wm">FNSM</div>
  <div class="back-body">
    <div class="back-title">Carte de Membre Officielle</div>
    <div class="back-hr"></div>
    <div class="back-grid">
      <div>
        <div class="bf-label">Nom complet</div>
        <div class="bf-val">${member.fullName}</div>
      </div>
      <div>
        <div class="bf-label">N° Licence</div>
        <div class="bf-val">${card.licenseNumber}</div>
      </div>
      <div>
        <div class="bf-label">Catégorie</div>
        <div class="bf-val">${CAT[member.category] ?? member.category}</div>
      </div>
      <div>
        <div class="bf-label">Saison</div>
        <div class="bf-val">${card.season}</div>
      </div>
      <div>
        <div class="bf-label">Valide du</div>
        <div class="bf-val">${validFrom}</div>
      </div>
      <div>
        <div class="bf-label">Valide jusqu'au</div>
        <div class="bf-val">${validUntil}</div>
      </div>
      <div>
        <div class="bf-label">Club</div>
        <div class="bf-val">${clubDisplay}</div>
      </div>
      <div>
        <div class="bf-label">Type</div>
        <div class="bf-val">${typeDisplay}</div>
      </div>
    </div>
  </div>
  <div class="back-foot">
    <!-- Back QR — plain text (name + license) -->
    <div class="back-qr">
      <img src="${backQrUrl}" alt="QR Info" />
    </div>
  </div>
</div>

<p class="no-print" style="color:#666;font-size:13px;text-align:center">
  Ctrl+P → Enregistrer en PDF
</p>
</body>
</html>`;
}
