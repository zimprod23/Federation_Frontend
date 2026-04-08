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

export default function MemberCardDownloadV2({
  member,
  card,
  clubName,
}: Props) {
  const handleDownload = async () => {
    const photoAbsolute = member.photoUrl
      ? `http://localhost:3000${new URL(member.photoUrl).pathname}`
      : null;

    const frontQrDataUrl = await QRCode.toDataURL(card.qrPayload, {
      width: 200,
      margin: 1,
      color: { dark: "#7a0000", light: "#ffffff" },
    });

    const backQrText = `${member.fullName}\n${card.licenseNumber}\nSaison ${card.season}`;
    const backQrDataUrl = await QRCode.toDataURL(backQrText, {
      width: 200,
      margin: 1,
      color: { dark: "#1e6b1e", light: "#ffffff" },
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
        background: "#8B0000",
        borderColor: "#8B0000",
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

const ICON = {
  trophy: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9H4a2 2 0 0 1-2-2V5h4M18 9h2a2 2 0 0 0 2-2V5h-4M8 21h8M12 17v4M6 9a6 6 0 0 0 12 0V3H6z'/%3E%3C/svg%3E`,
  users: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='9' cy='7' r='4'/%3E%3Cpath d='M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75'/%3E%3C/svg%3E`,
  cal: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2'/%3E%3Cline x1='16' y1='2' x2='16' y2='6'/%3E%3Cline x1='8' y1='2' x2='8' y2='6'/%3E%3Cline x1='3' y1='10' x2='21' y2='10'/%3E%3C/svg%3E`,
  id: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='2' y='5' width='20' height='14' rx='2'/%3E%3Ccircle cx='8' cy='12' r='2'/%3E%3Cline x1='12' y1='10' x2='18' y2='10'/%3E%3Cline x1='12' y1='14' x2='18' y2='14'/%3E%3C/svg%3E`,
};

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
    ? dayjs(member.dateOfBirth).format("DD / MM / YYYY")
    : "—";
  const clubDisplay = clubName ?? (member.clubId ? "—" : "Sans club");
  const genderDisplay = GENDER_LABEL[member.gender] ?? member.gender;
  const catDisplay = CAT[member.category] ?? member.category;
  const parts = member.fullName.trim().split(" ");
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ");

  const photoHtml = photoUrl
    ? `<img src="${photoUrl}" style="width:100%;height:100%;object-fit:cover" crossorigin="anonymous"
         onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
       <div class="ph-fb" style="display:none">${firstName.charAt(0)}</div>`
    : `<div class="ph-fb">${firstName.charAt(0)}</div>`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<title>Carte — ${member.fullName}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,400;1,700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{
  background:linear-gradient(160deg,#1a0a00 0%,#2d1200 40%,#1a2800 100%);
  display:flex;flex-direction:column;align-items:center;
  min-height:100vh;padding:44px 24px;gap:44px;
  font-family:'Inter',Arial,sans-serif}
.lbl{font:500 9px/1 'Inter',sans-serif;letter-spacing:3px;color:rgba(255,255,255,0.3);
  align-self:flex-start;margin-left:calc(50% - 428px);margin-bottom:-30px;text-transform:uppercase}

/* ── Card ── */
.card{
  width:856px;height:540px;border-radius:22px;position:relative;overflow:hidden;
  box-shadow:0 2px 0 rgba(200,150,12,0.55),0 32px 80px rgba(0,0,0,0.7),0 8px 24px rgba(0,0,0,0.4)}

/* ════ FRONT ════ */
.front{background:#f9f6f0}

.f-tex{position:absolute;inset:0;z-index:0;
  background-image:
    repeating-linear-gradient(0deg,transparent,transparent 4px,rgba(139,60,0,0.016) 4px,rgba(139,60,0,0.016) 5px),
    repeating-linear-gradient(90deg,transparent,transparent 4px,rgba(139,60,0,0.016) 4px,rgba(139,60,0,0.016) 5px)}

.f-header{
  position:absolute;top:0;left:0;right:0;height:148px;
  background:#8B0000;
  clip-path:polygon(0 0,100% 0,100% 66%,0 100%);z-index:2}
.f-header::before{content:'';position:absolute;inset:0;
  background-image:
    repeating-linear-gradient(45deg,transparent,transparent 14px,rgba(255,255,255,0.025) 14px,rgba(255,255,255,0.025) 15px),
    repeating-linear-gradient(-45deg,transparent,transparent 14px,rgba(255,255,255,0.025) 14px,rgba(255,255,255,0.025) 15px)}

.f-goldline{position:absolute;top:0;left:0;right:0;height:3px;z-index:10;
  background:linear-gradient(90deg,transparent,#c8960c 18%,#f5d060 50%,#c8960c 82%,transparent)}

/* Logo */
.f-logo{
  position:absolute;top:12px;left:50%;transform:translateX(-50%);z-index:20;
  width:120px;height:120px;border-radius:50%;
  background:rgba(255,255,255,0.12);
  border:3px solid rgba(255,255,255,0.88);
  box-shadow:0 0 0 2px rgba(200,150,12,0.5),0 8px 28px rgba(0,0,0,0.5);
  overflow:hidden;display:flex;align-items:center;justify-content:center}
.f-logo img{width:100%;height:100%;object-fit:contain}
.f-logo-ph{font:600 9px/1.5 'Inter',sans-serif;color:rgba(255,255,255,0.75);text-align:center;text-transform:uppercase;letter-spacing:0.5px}

/* Photo */
.f-photo{
  position:absolute;top:12px;right:48px;z-index:20;
  width:180px;height:180px;border-radius:50%;
  border:5px solid #fff;
  box-shadow:0 0 0 4px #8B0000,0 12px 36px rgba(0,0,0,0.55);
  overflow:hidden;background:#e8d8c8;
  display:flex;align-items:center;justify-content:center}
.ph-fb{width:100%;height:100%;display:flex;align-items:center;justify-content:center;
  font:700 68px/1 'Cormorant Garamond',serif;color:#8B0000;background:#f0e4d8}

/* Name */
.f-name{position:absolute;top:164px;left:38px;z-index:5;white-space:nowrap}
.f-name-first{font:900 italic 52px/1 'Cormorant Garamond',serif;color:#2a6b2a;letter-spacing:0.5px}
.f-name-last{font:700 italic 52px/1 'Cormorant Garamond',serif;color:#7a0000;margin-left:10px;letter-spacing:0.5px}

/* Rule */
.f-rule{position:absolute;top:224px;left:38px;z-index:5;
  width:360px;display:flex;align-items:center;gap:8px}
.f-rule-diamond{width:7px;height:7px;background:#b8860b;transform:rotate(45deg);flex-shrink:0}
.f-rule-line{flex:1;height:1px;background:linear-gradient(90deg,#b8860b,rgba(184,134,11,0))}

/* Fields */
.f-fields{position:absolute;top:240px;left:38px;z-index:5;display:flex;flex-direction:column;gap:15px}
.f-field{display:flex;align-items:center;gap:11px}
.f-icon{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.f-icon img{width:15px;height:15px;display:block}
.f-label{font:500 14px/1 'Inter',sans-serif;color:#5a3a1a;min-width:182px;letter-spacing:0.2px}
.f-dot{font:300 14px/1 'Inter',sans-serif;color:#bba080;margin:0 3px}
.f-val{font:600 14px/1 'Inter',sans-serif;color:#3d0000;letter-spacing:0.2px}

/* Licence */
.f-lic{position:absolute;top:162px;right:48px;z-index:5;width:214px}
.f-lic-label{font:500 9px/1 'Inter',sans-serif;letter-spacing:2.5px;text-transform:uppercase;
  color:#5a3a1a;text-align:right;margin-bottom:8px}
.f-lic-box{border:1.5px solid #8B0000;border-radius:14px;overflow:hidden;background:#fff;
  box-shadow:0 6px 24px rgba(139,0,0,0.14)}
.f-lic-bar{height:6px;background:linear-gradient(90deg,#5a0000,#8B0000,#c0392b)}
.f-lic-body{padding:12px 16px 12px}
.f-lic-season{font:600 8px/1 'Inter',sans-serif;letter-spacing:3px;text-transform:uppercase;color:#8B0000;margin-bottom:5px}
.f-lic-num{font:700 21px/1 'Inter',sans-serif;color:#1a0a0a;letter-spacing:0.5px}
.f-lic-valid{font:400 10px/1 'Inter',sans-serif;color:#999;margin-top:8px}
.f-lic-date{font-weight:600;color:#7a0000}

/* QR */
.f-qr{position:absolute;bottom:100px;right:48px;z-index:5;
  width:96px;height:96px;border-radius:12px;background:#fff;padding:6px;
  border:1px solid rgba(139,0,0,0.12);box-shadow:0 4px 18px rgba(0,0,0,0.1)}
.f-qr img{width:100%;height:100%;border-radius:8px;display:block}

/* Star */
.f-star{position:absolute;bottom:102px;left:38px;z-index:5}
.f-star img{width:56px;height:56px;object-fit:contain;display:block}

/* Wave */
.f-wave{position:absolute;bottom:0;left:0;right:0;height:88px;z-index:4}

/* ════ BACK ════ */
.back{background:#0d380d;
  background-image:
    repeating-linear-gradient(60deg,transparent,transparent 22px,rgba(255,255,255,0.01) 22px,rgba(255,255,255,0.01) 23px),
    repeating-linear-gradient(-60deg,transparent,transparent 22px,rgba(255,255,255,0.01) 22px,rgba(255,255,255,0.01) 23px)}

.b-glow{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
  width:580px;height:320px;border-radius:50%;
  background:radial-gradient(ellipse,rgba(40,120,40,0.28) 0%,transparent 70%);
  z-index:0;pointer-events:none}

.b-wm{position:absolute;top:50%;left:50%;
  transform:translate(-50%,-50%) rotate(-14deg);
  font:900 170px/1 'Cormorant Garamond',serif;
  letter-spacing:18px;color:rgba(255,255,255,0.035);
  white-space:nowrap;pointer-events:none;user-select:none;z-index:1}

.b-goldline{position:absolute;top:0;left:0;right:0;height:3px;z-index:10;
  background:linear-gradient(90deg,transparent,#c8960c 18%,#f5d060 50%,#c8960c 82%,transparent)}

.b-header{position:absolute;top:0;left:0;right:0;height:90px;
  background:rgba(0,0,0,0.35);border-bottom:1px solid rgba(200,150,12,0.2);
  display:flex;align-items:center;gap:16px;padding:0 34px;z-index:5}
.b-logo{width:60px;height:60px;border-radius:50%;
  border:1.5px solid rgba(200,150,12,0.55);background:rgba(255,255,255,0.07);
  overflow:hidden;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.b-logo img{width:100%;height:100%;object-fit:contain}
.b-logo-ph{font:600 7px/1.4 'Inter',sans-serif;color:rgba(255,255,255,0.45);text-align:center;text-transform:uppercase}
.b-fed-sub{font:500 9px/1 'Inter',sans-serif;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.45)}
.b-fed-name{font:700 italic 28px/1 'Cormorant Garamond',serif;color:#fff;letter-spacing:3px;margin-top:3px}

.b-mag{position:absolute;top:98px;left:0;right:0;height:44px;background:#040804;z-index:4}
.b-sig{position:absolute;top:102px;left:34px;height:36px;width:260px;
  background:#eee9e0;border-radius:2px;z-index:5;display:flex;align-items:center;padding:0 12px}
.b-sig-txt{font:400 italic 17px/1 'Cormorant Garamond',serif;color:#444}

.b-title{position:absolute;top:156px;left:0;right:0;text-align:center;z-index:5;
  font:600 10px/1 'Inter',sans-serif;letter-spacing:5px;text-transform:uppercase;color:#d4a820}
.b-orn{position:absolute;top:174px;left:32px;right:32px;z-index:5;display:flex;align-items:center;gap:9px}
.b-orn-line{flex:1;height:1px;background:rgba(200,150,12,0.28)}
.b-orn-d{width:6px;height:6px;background:#b8860b;transform:rotate(45deg);flex-shrink:0}

.b-grid{position:absolute;top:194px;left:34px;right:180px;
  display:grid;grid-template-columns:1fr 1fr;gap:20px 28px;z-index:5}
.b-fl{font:500 8px/1 'Inter',sans-serif;letter-spacing:1.5px;text-transform:uppercase;
  color:rgba(255,255,255,0.38);margin-bottom:4px}
.b-fv{font:600 15px/1 'Inter',sans-serif;color:#fff;letter-spacing:0.2px}

.b-qr{position:absolute;top:188px;right:32px;z-index:5;
  width:128px;height:128px;border-radius:14px;
  background:rgba(255,255,255,0.97);padding:7px;
  box-shadow:0 8px 28px rgba(0,0,0,0.5);border:1px solid rgba(200,150,12,0.2)}
.b-qr img{width:100%;height:100%;border-radius:8px;display:block}

.b-star{position:absolute;bottom:76px;left:34px;z-index:5;opacity:0.35}
.b-star img{width:48px;height:48px;object-fit:contain;display:block}
.b-wave{position:absolute;bottom:0;left:0;right:0;height:68px;z-index:5}

/* ════ PRINT ════ */
@media print{
  body{background:white;padding:0;gap:0;display:block}
  .lbl{display:none}
  .card{width:85.6mm;height:54mm;border-radius:3.5mm;box-shadow:none;
    -webkit-print-color-adjust:exact;print-color-adjust:exact;
    page-break-after:always;page-break-inside:avoid;margin:0 auto;display:block}

  .f-header{height:13.5mm}
  .f-logo{width:12mm;height:12mm;border-width:0.3mm;top:1.2mm;box-shadow:0 0 0 0.2mm rgba(200,150,12,0.5)}
  .f-photo{width:17.8mm;height:17.8mm;border-width:0.5mm;box-shadow:0 0 0 0.4mm #8B0000;top:1.2mm;right:4.8mm}
  .ph-fb{font-size:18pt}
  .f-name{top:15.4mm;left:3.8mm}
  .f-name-first,.f-name-last{font-size:13pt}
  .f-name-last{margin-left:2mm}
  .f-rule{top:21.4mm;left:3.8mm;width:36mm;gap:0.8mm}
  .f-rule-diamond{width:0.7mm;height:0.7mm}
  .f-rule-line{height:0.1mm}
  .f-fields{top:23mm;left:3.8mm;gap:1.4mm}
  .f-field{gap:1.1mm}
  .f-icon{width:2.8mm;height:2.8mm;border-radius:0.7mm}
  .f-icon img{width:1.6mm;height:1.6mm}
  .f-label{font-size:5.2pt;min-width:18.2mm}
  .f-dot{font-size:5.2pt}
  .f-val{font-size:5.2pt}
  .f-lic{top:21mm;right:4.8mm;width:21.4mm}
  .f-lic-label{font-size:3.5pt;margin-bottom:0.8mm}
  .f-lic-box{border-radius:1.4mm;border-width:0.15mm}
  .f-lic-bar{height:0.6mm}
  .f-lic-body{padding:1mm 1.6mm}
  .f-lic-season{font-size:2.8pt;margin-bottom:0.5mm}
  .f-lic-num{font-size:6.8pt}
  .f-lic-valid{font-size:3.2pt;margin-top:0.7mm}
  .f-qr{bottom:9.8mm;right:4.8mm;width:9.6mm;height:9.6mm;border-radius:1.2mm;padding:0.5mm}
  .f-star img{width:5.6mm;height:5.6mm}
  .f-star{bottom:9.8mm;left:3.8mm}
  .f-wave{height:8.8mm}

  .b-header{height:9mm;padding:0 3.4mm;gap:1.6mm}
  .b-logo{width:6mm;height:6mm;border-width:0.15mm}
  .b-logo-ph{font-size:3.5pt}
  .b-fed-sub{font-size:3.5pt;letter-spacing:1pt}
  .b-fed-name{font-size:8.5pt;letter-spacing:1.5pt;margin-top:0.3mm}
  .b-mag{top:9.8mm;height:4.4mm}
  .b-sig{top:10.1mm;left:3.4mm;height:3.2mm;width:26mm}
  .b-sig-txt{font-size:7.5pt}
  .b-title{top:15.8mm;font-size:4.5pt;letter-spacing:2pt}
  .b-orn{top:17.8mm;left:3.2mm;right:3.2mm;gap:0.9mm}
  .b-orn-d{width:0.6mm;height:0.6mm}
  .b-orn-line{height:0.1mm}
  .b-grid{top:19.4mm;left:3.4mm;right:16mm;gap:1.8mm 2.8mm}
  .b-fl{font-size:3.2pt;margin-bottom:0.4mm}
  .b-fv{font-size:5.4pt}
  .b-qr{top:18.8mm;right:3.2mm;width:12.8mm;height:12.8mm;border-radius:1.4mm;padding:0.7mm}
  .b-star img{width:4.8mm;height:4.8mm}
  .b-star{bottom:7.6mm;left:3.4mm}
  .b-wave{height:6.8mm}
  .b-wm{font-size:50pt}
  @page{size:85.6mm 54mm;margin:0}
}
</style>
</head>
<body>

<p class="lbl">◼ recto</p>

<!-- ══════════ FRONT ══════════ -->
<div class="card front">
  <div class="f-tex"></div>
  <div class="f-header"></div>
  <div class="f-goldline"></div>

  <div class="f-logo">
    <img src="/fed-photo.png" alt="FRMA"
      onerror="this.outerHTML='<div class=\\'f-logo-ph\\'>Logo<br/>Féd.</div>'" />
  </div>

  <div class="f-photo">${photoHtml}</div>

  <div class="f-name">
    <span class="f-name-first">${firstName}</span>
    <span class="f-name-last">${lastName ? "&nbsp;" + lastName : ""}</span>
  </div>

  <div class="f-rule">
    <div class="f-rule-diamond"></div>
    <div class="f-rule-line"></div>
  </div>

  <div class="f-fields">
    <div class="f-field">
      <div class="f-icon" style="background:#8B0000">
        <img src="${ICON.trophy}" alt="" />
      </div>
      <span class="f-label">Catégorie</span>
      <span class="f-dot">·</span>
      <span class="f-val">${catDisplay}</span>
    </div>
    <div class="f-field">
      <div class="f-icon" style="background:#1e6b1e">
        <img src="${ICON.users}" alt="" />
      </div>
      <span class="f-label">Club</span>
      <span class="f-dot">·</span>
      <span class="f-val">${clubDisplay}</span>
    </div>
    <div class="f-field">
      <div class="f-icon" style="background:#7a5a00">
        <img src="${ICON.cal}" alt="" />
      </div>
      <span class="f-label">Date de naissance</span>
      <span class="f-dot">·</span>
      <span class="f-val">${dob}</span>
    </div>
    <div class="f-field">
      <div class="f-icon" style="background:#4a3020">
        <img src="${ICON.id}" alt="" />
      </div>
      <span class="f-label">Type</span>
      <span class="f-dot">·</span>
      <span class="f-val">${genderDisplay}</span>
    </div>
  </div>

  <div class="f-lic">
    <div class="f-lic-label">Numéro de licence</div>
    <div class="f-lic-box">
      <div class="f-lic-bar"></div>
      <div class="f-lic-body">
        <div class="f-lic-season">Saison ${card.season}</div>
        <div class="f-lic-num">${card.licenseNumber}</div>
        <div class="f-lic-valid">Valable jusqu'au <span class="f-lic-date">${validUntil}</span></div>
      </div>
    </div>
  </div>

  <div class="f-qr"><img src="${frontQrUrl}" alt="QR" /></div>

  <div class="f-star">
    <img src="/moroccan-star.png" alt="★"
      onerror="this.outerHTML='<svg width=\\'56px\\" height=\\'56px\\" viewBox=\\'0 0 54 54\\" xmlns=\\'http://www.w3.org/2000/svg\\'><polygon points=\\'27,3 30.94,15.67 43.65,12.78 35.72,23.08 46.5,30.55 33.37,31.18 33.34,44.5 27,33.36 20.66,44.5 20.63,31.18 7.5,30.55 18.28,23.08 10.35,12.78 23.06,15.67\\' fill=\\'none\\" stroke=\\'%232a6b2a\\" stroke-width=\\'2\\" stroke-linejoin=\\'round\\'/></svg>'" />
  </div>

  <svg class="f-wave" viewBox="0 0 856 88" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="0" y1="1" x2="856" y2="1" stroke="rgba(184,134,11,0.45)" stroke-width="1.5"/>
    <path d="M0,5 Q428,38 856,5  L856,26 Q428,59 0,26 Z" fill="#8B0000"/>
    <path d="M0,28 Q428,61 856,28  L856,50 Q428,83 0,50 Z" fill="#1e6b1e"/>
    <path d="M0,52 Q428,82 856,52  L856,88 L0,88 Z" fill="#8B0000"/>
  </svg>
</div>

<p class="lbl">◼ verso</p>

<!-- ══════════ BACK ══════════ -->
<div class="card back">
  <div class="b-glow"></div>
  <div class="b-goldline"></div>
  <div class="b-wm">FRMA</div>

  <div class="b-header">
    <div class="b-logo">
      <img src="/fed-photo.png" alt="FRMA"
        onerror="this.outerHTML='<div class=\\'b-logo-ph\\'>Logo<br/>Féd.</div>'" />
    </div>
    <div>
      <div class="b-fed-sub">Fédération Royale Marocaine</div>
      <div class="b-fed-name">D'Aviron</div>
    </div>
  </div>

  <div class="b-mag"></div>
  <div class="b-sig"><span class="b-sig-txt">${member.fullName}</span></div>

  <div class="b-title">Carte de membre officielle</div>
  <div class="b-orn">
    <div class="b-orn-line"></div>
    <div class="b-orn-d"></div>
    <div class="b-orn-line"></div>
  </div>

  <div class="b-grid">
    <div><div class="b-fl">Nom complet</div><div class="b-fv">${member.fullName}</div></div>
    <div><div class="b-fl">N° Licence</div><div class="b-fv">${card.licenseNumber}</div></div>
    <div><div class="b-fl">Catégorie</div><div class="b-fv">${catDisplay}</div></div>
    <div><div class="b-fl">Saison</div><div class="b-fv">${card.season}</div></div>
    <div><div class="b-fl">Valide du</div><div class="b-fv">${validFrom}</div></div>
    <div><div class="b-fl">Valide jusqu'au</div><div class="b-fv">${validUntil}</div></div>
    <div><div class="b-fl">Club</div><div class="b-fv">${clubDisplay}</div></div>
    <div><div class="b-fl">Type</div><div class="b-fv">${genderDisplay}</div></div>
  </div>

  <div class="b-qr"><img src="${backQrUrl}" alt="QR" /></div>

  <div class="b-star">
    <img src="/moroccan-star.png" alt="★"
      onerror="this.outerHTML='<svg width=\\'48px\\" height=\\'48px\\" viewBox=\\'0 0 54 54\\" xmlns=\\'http://www.w3.org/2000/svg\\'><polygon points=\\'27,3 30.94,15.67 43.65,12.78 35.72,23.08 46.5,30.55 33.37,31.18 33.34,44.5 27,33.36 20.66,44.5 20.63,31.18 7.5,30.55 18.28,23.08 10.35,12.78 23.06,15.67\\' fill=\\'none\\" stroke=\\'rgba(255,255,255,0.45)\\" stroke-width=\\'2\\" stroke-linejoin=\\'round\\'/></svg>'" />
  </div>

  <svg class="b-wave" viewBox="0 0 856 68" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="0" y1="1" x2="856" y2="1" stroke="rgba(200,150,12,0.28)" stroke-width="1.5"/>
    <path d="M0,4 Q428,34 856,4  L856,22 Q428,52 0,22 Z" fill="#8B0000"/>
    <path d="M0,24 Q428,52 856,24  L856,68 L0,68 Z" fill="#8B0000" opacity="0.55"/>
  </svg>
</div>

<p style="color:rgba(255,255,255,0.25);font:400 11px/1 'Inter',Arial,sans-serif;text-align:center;margin-top:-24px">
  Ctrl + P → Enregistrer en PDF
</p>
</body>
</html>`;
}
