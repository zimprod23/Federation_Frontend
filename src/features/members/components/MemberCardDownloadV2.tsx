import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { MemberResponseDTO, CardResponseDTO } from "@/types";
import FedLogo from "@/assets/fed-logo2.png";
import StartLogo from "@/assets/five.png";
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

    const frontQr = await QRCode.toDataURL(card.qrPayload, {
      width: 200,
      margin: 1,
      color: { dark: "#7a0000", light: "#ffffff" },
    });
    const backQr = await QRCode.toDataURL(
      `${member.fullName}\n${card.licenseNumber}\nSaison ${card.season}`,
      { width: 200, margin: 1, color: { dark: "#1e6b1e", light: "#ffffff" } },
    );

    const html = buildCardHtml(
      member,
      card,
      photoAbsolute,
      clubName,
      frontQr,
      backQr,
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

// import { Button } from "antd";
// import { DownloadOutlined } from "@ant-design/icons";
// import { MemberResponseDTO, CardResponseDTO } from "@/types";
// import QRCode from "qrcode";
// import dayjs from "dayjs";
// import FedLogo from "@/assets/fed-photo.png";
// import StartLogo from "@/assets/five.png";
// import { useRef, useState, useEffect } from "react";
// import * as htmlToImage from "html-to-image";
// import jsPDF from "jspdf";

// interface Props {
//   member: MemberResponseDTO;
//   card: CardResponseDTO;
//   clubName?: string;
// }

// export default function MemberCardDownloadV2({
//   member,
//   card,
//   clubName,
// }: Props) {
//   const handleDownload = async () => {
//     try {
//       // ✅ Fix photo URL
//       const photoAbsolute = member.photoUrl
//         ? `http://localhost:3000${new URL(member.photoUrl).pathname}`
//         : null;

//       // ✅ Generate QR codes
//       const frontQr = await QRCode.toDataURL(card.qrPayload, {
//         width: 200,
//         margin: 1,
//         color: { dark: "#7a0000", light: "#ffffff" },
//       });

//       const backQr = await QRCode.toDataURL(
//         `${member.fullName}\n${card.licenseNumber}\nSaison ${card.season}`,
//         {
//           width: 200,
//           margin: 1,
//           color: { dark: "#1e6b1e", light: "#ffffff" },
//         },
//       );

//       // ✅ Your original HTML
//       const html = buildCardHtml(
//         member,
//         card,
//         photoAbsolute,
//         clubName,
//         frontQr,
//         backQr,
//       );

//       // 🔥 CREATE IFRAME (isolated environment)
//       const iframe = document.createElement("iframe");
//       iframe.style.position = "fixed";
//       iframe.style.visibility = "hidden";
//       iframe.style.pointerEvents = "none";
//       iframe.style.width = "0";
//       iframe.style.height = "0";
//       iframe.style.border = "none";

//       document.body.appendChild(iframe);

//       const doc = iframe.contentDocument!;
//       doc.open();
//       doc.write(html);
//       doc.close();

//       // ⏳ Wait for iframe load
//       await new Promise<void>((resolve) => {
//         iframe.onload = () => resolve();
//       });

//       // ⏳ Wait for fonts (CRITICAL)
//       if (doc.fonts) {
//         await doc.fonts.ready;
//       }

//       // ⏳ Small delay for images
//       await new Promise((r) => setTimeout(r, 300));

//       const front = doc.querySelector(".front") as HTMLElement;
//       const back = doc.querySelector(".back") as HTMLElement;

//       if (!front || !back) {
//         throw new Error("Card elements not found");
//       }

//       // ✅ Convert to images
//       const frontImg = await htmlToImage.toPng(front, {
//         pixelRatio: 3,
//         cacheBust: true,
//       });

//       const backImg = await htmlToImage.toPng(back, {
//         pixelRatio: 3,
//         cacheBust: true,
//       });

//       // ✅ Create PDF
//       const pdf = new jsPDF({
//         orientation: "landscape",
//         unit: "mm",
//         format: [85.6, 54],
//       });

//       pdf.addImage(frontImg, "PNG", 0, 0, 85.6, 54);
//       pdf.addPage();
//       pdf.addImage(backImg, "PNG", 0, 0, 85.6, 54);

//       pdf.save(`card-${member.fullName}.pdf`);

//       // 🧹 Cleanup
//       document.body.removeChild(iframe);
//     } catch (err) {
//       console.error("Download failed:", err);
//     }
//   };

//   return (
//     <Button
//       type="primary"
//       icon={<DownloadOutlined />}
//       onClick={() => void handleDownload()}
//       block
//       style={{
//         background: "#8B0000",
//         borderColor: "#8B0000",
//         color: "#fff",
//         fontWeight: 700,
//         height: 40,
//         borderRadius: 8,
//         marginTop: 12,
//       }}
//     >
//       Télécharger la carte
//     </Button>
//   );
// }
const CAT: Record<string, string> = {
  junior: "Junior",
  u23: "U23",
  senior: "Senior",
};
const GEN: Record<string, string> = {
  male: "Masculin",
  female: "Féminin",
  other: "Autre",
};

// Inline SVG icons — simple, coherent
const ICO = {
  star: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2'/%3E%3C/svg%3E`,
  home: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'/%3E%3Cpolyline points='9 22 9 12 15 12 15 22'/%3E%3C/svg%3E`,
  cal: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2'/%3E%3Cline x1='16' y1='2' x2='16' y2='6'/%3E%3Cline x1='8' y1='2' x2='8' y2='6'/%3E%3Cline x1='3' y1='10' x2='21' y2='10'/%3E%3C/svg%3E`,
  user: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E`,
};

// Moroccan star SVG (centred in wave)
const STAR_SVG = `<svg width="32" height="32" viewBox="0 0 54 54" xmlns="http://www.w3.org/2000/svg"><polygon points="27,3 30.94,15.67 43.65,12.78 35.72,23.08 46.5,30.55 33.37,31.18 33.34,44.5 27,33.36 20.66,44.5 20.63,31.18 7.5,30.55 18.28,23.08 10.35,12.78 23.06,15.67" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.75)" stroke-width="1.8" stroke-linejoin="round"/></svg>`;

function buildCardHtml(
  member: MemberResponseDTO,
  card: CardResponseDTO,
  photoUrl: string | null,
  clubName: string | undefined,
  frontQrUrl: string,
  backQrUrl: string,
  logoUrl: string = FedLogo,
  starLogo: string = StartLogo,
): string {
  const validUntil = dayjs(card.validUntil).format("DD/MM/YYYY");
  const validFrom = dayjs(card.validFrom).format("DD/MM/YYYY");
  const dob = member.dateOfBirth
    ? dayjs(member.dateOfBirth).format("DD / MM / YYYY")
    : "—";
  const club = clubName ?? (member.clubId ? "—" : "Sans club");
  const gender = GEN[member.gender] ?? member.gender;
  const cat = CAT[member.category] ?? member.category;
  const parts = member.fullName.trim().split(" ");
  const first = parts[0] ?? "";
  const last = parts.slice(1).join(" ");

  const photo = photoUrl
    ? `<img src="${photoUrl}" style="width:100%;height:100%;object-fit:cover" crossorigin="anonymous"
         onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
       <div class="pfb" style="display:none">${first.charAt(0)}</div>`
    : `<div class="pfb">${first.charAt(0)}</div>`;

  // Simple Q-curve waves
  const FW = 856;
  const fw = (y0: number, y1: number, fill: string, close = false) =>
    `<path d="M0,${y0} Q${FW / 2},${y0 + (y1 - y0) * 2} ${FW},${y0} L${FW},${y1} Q${FW / 2},${y1 + (y1 - y0) * 2} 0,${y1} Z"${close ? ` L${FW},88 L0,88 Z` : ""} fill="${fill}"/>`;

  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"/><title>Carte — ${member.fullName}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>    
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,400;1,700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#1c1008;display:flex;flex-direction:column;align-items:center;min-height:100vh;padding:44px 24px;gap:44px;font-family:'Inter',Arial,sans-serif}
.lbl{font:500 8px/1 'Inter',sans-serif;letter-spacing:3px;color:rgba(255,255,255,0.25);align-self:flex-start;margin-left:calc(50% - 428px);margin-bottom:-30px;text-transform:uppercase}
.card{width:856px;height:540px;border-radius:20px;position:relative;overflow:hidden;box-shadow:0 2px 0 rgba(200,150,12,0.5),0 32px 80px rgba(0,0,0,0.8)}

/* FRONT */
.front{background:white}
.front::before{content:'';position:absolute;inset:0;z-index:0;
  background-image:repeating-linear-gradient(0deg,transparent,transparent 4px,rgba(100,30,0,0.014) 4px,rgba(100,30,0,0.014) 5px),
  repeating-linear-gradient(90deg,transparent,transparent 4px,rgba(100,30,0,0.014) 4px,rgba(100,30,0,0.014) 5px)}
// .fh{position:absolute;top:0;left:0;right:0;height:140px;background:#8B0000;clip-path:polygon(0 0,100% 0,100% 64%,0 100%);z-index:2}
.fh::after{content:'';position:absolute;inset:0;
  background:repeating-linear-gradient(45deg,transparent,transparent 14px,rgba(255,255,255,0.02) 14px,rgba(255,255,255,0.02) 15px)}
.gl{position:absolute;top:0;left:0;right:0;height:3px;z-index:10;
  background:linear-gradient(90deg,transparent,#c8960c 18%,#f0c840 50%,#c8960c 82%,transparent)}
.logo{position: absolute;
    z-index: 20;
    top: 3px;
    text-align: left;
    width: 100%;}
.logo img{width:26%;}
.logo-ph{font:600 8px/1.5 'Inter',sans-serif;color:rgba(255,255,255,0.72);text-align:center;text-transform:uppercase;letter-spacing:0.5px}
.photo{position:absolute;top:12px;right:48px;z-index:20;
  width:168px;height:168px;border-radius:50%;
  border:5px solid #fff;box-shadow:0 0 0 4px #8B0000;
  overflow:hidden;background:#e8d4c0;display:flex;align-items:center;justify-content:center}
.pfb{width:100%;height:100%;display:flex;align-items:center;justify-content:center;
  font:700 64px/1 'Cormorant Garamond',serif;color:#8B0000;background:#f0e2d4}
.name{position:absolute;top:154px;left:36px;z-index:5;white-space:nowrap}
.nf{font:700 italic 50px/1 'Cormorant Garamond',serif;color:#2a6b2a}
.nl{font:400 italic 50px/1 'Cormorant Garamond',serif;color:#7a0000;margin-left:10px}
.rule{position:absolute;top:213px;left:36px;z-index:5;display:flex;align-items:center;gap:7px;width:300px}
.rd{width:6px;height:6px;background:#b8860b;transform:rotate(45deg);flex-shrink:0}
.rl{flex:1;height:1px;background:linear-gradient(90deg,#b8860b,rgba(184,134,11,0))}
.fields{position:absolute;top:229px;left:36px;z-index:5;display:flex;flex-direction:column;gap:15px}
.field{display:flex;align-items:center;gap:11px}
.fi{width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.fi img{width:14px;height:14px;display:block}
.flb{font:400 14px/1 'Inter',sans-serif;color:#7a4a20;min-width:180px}
.fd{font:300 14px/1 'Inter',sans-serif;color:#c8a060;margin:0 3px}
.fv{font:600 14px/1 'Inter',sans-serif;color:#3d0000}
.lic{position:absolute;top:220px;right:48px;z-index:5;width:214px}
.lic-hd{font: 520 10px / 1 'Inter', sans-serif;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: #7a4a20;
    margin-bottom: 8px;
    margin-left: 6px;}
.lic-box{border:1.5px solid rgba(139,0,0,0.22);border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 4px 20px rgba(139,0,0,0.1)}
.lic-bar{height:5px;background:linear-gradient(90deg,#5a0000,#8B0000,#c0392b)}
.lic-body{padding:11px 15px}
.lic-s{font:600 8px/1 'Inter',sans-serif;letter-spacing:2.5px;text-transform:uppercase;color:#8B0000;margin-bottom:5px}
.lic-n{font:700 20px/1 'Inter',sans-serif;color:#111;letter-spacing:0.4px}
.lic-v{font:400 10px/1 'Inter',sans-serif;color:#aaa;margin-top:8px}
.lic-vd{font-weight:600;color:#7a0000}
.qr{position:absolute;bottom:90px;right:48px;z-index:5;
  width:105px;border-radius:12px;background:#fff;padding:5px;
  border:1px solid rgba(139,0,0,0.1);box-shadow:0 4px 16px rgba(0,0,0,0.09)}
.qr img{width:100%;height:100%;border-radius:8px;display:block}
.wave{position:absolute;bottom:0;left:0;right:0;height:88px;z-index:4}
.star-c{position:absolute;bottom:5px;left:50%;transform:translateX(-50%);z-index:8}

/* BACK */
.back{background:#0d380d;
  background-image:repeating-linear-gradient(60deg,transparent,transparent 22px,rgba(255,255,255,0.01) 22px,rgba(255,255,255,0.01) 23px),
  repeating-linear-gradient(-60deg,transparent,transparent 22px,rgba(255,255,255,0.01) 22px,rgba(255,255,255,0.01) 23px)}
.bglow{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
  width:600px;height:300px;border-radius:50%;
  background:radial-gradient(ellipse,rgba(50,140,50,0.22) 0%,transparent 70%);z-index:0;pointer-events:none}
.bwm{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-14deg);
  font:900 170px/1 'Cormorant Garamond',serif;letter-spacing:18px;
  color:rgba(255,255,255,0.036);white-space:nowrap;pointer-events:none;user-select:none;z-index:1}
.bgl{position:absolute;top:0;left:0;right:0;height:3px;z-index:10;
  background:linear-gradient(90deg,transparent,#c8960c 18%,#f0c840 50%,#c8960c 82%,transparent)}
.bheader{position:absolute;top:0;left:0;right:0;height:88px;background:rgba(0,0,0,0.32);
  border-bottom:1px solid rgba(200,150,12,0.18);display:flex;align-items:center;gap:16px;padding:0 34px;z-index:5}
.blogo{width:58px;height:58px;border-radius:50%;border:1.5px solid rgba(200,150,12,0.5);
  background:rgb(255, 255, 255);overflow:hidden;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.blogo img{width:100%;height:100%;object-fit:contain}
.blogo-ph{font:600 7px/1.4 'Inter',sans-serif;color:rgba(255,255,255,0.42);text-align:center;text-transform:uppercase}
.bfed1{font:500 9px/1 'Inter',sans-serif;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.4)}
.bfed2{font:700 italic 26px/1 'Cormorant Garamond',serif;color:#fff;letter-spacing:3px;margin-top:3px}
.bmag{ position:absolute;top:96px;left:0;right:0;height:44px;background:#040804;z-index:4}
.bsig{position:absolute;top:100px;left:34px;height:36px;width:250px;
  background:#ede9e0;border-radius:2px;z-index:5;display:none;align-items:center;padding:0 12px}
.bsig span{font:400 italic 17px/1 'Cormorant Garamond',serif;color:#555}
.btitle{position:absolute;top:154px;left:0;right:0;text-align:center;z-index:5;
  font:600 9px/1 'Inter',sans-serif;letter-spacing:5px;text-transform:uppercase;color:#c8960c}
.born{position:absolute;top:172px;left:32px;right:32px;z-index:5;display:flex;align-items:center;gap:9px}
.borl{flex:1;height:1px;background:rgba(200,150,12,0.25)}
.bord{width:5px;height:5px;background:#b8860b;transform:rotate(45deg);flex-shrink:0}
.bgrid{position:absolute;top:192px;left:34px;right:178px;display:grid;grid-template-columns:1fr 1fr;gap:20px 28px;z-index:5}
.bfl{font:500 8px/1 'Inter',sans-serif;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.35);margin-bottom:4px}
.bfv{font:600 15px/1 'Inter',sans-serif;color:#fff}
.bqr{position:absolute;top:186px;right:32px;z-index:5;
  width:126px;height:126px;border-radius:13px;background:rgba(255,255,255,0.96);padding:7px;
  box-shadow:0 8px 28px rgba(0,0,0,0.5);border:1px solid rgba(200,150,12,0.2)}
.bqr img{width:100%;height:100%;border-radius:8px;display:block}
.bwave{position:absolute;bottom:0;left:0;right:0;height:72px;z-index:5}
.bstar{position:absolute;bottom:5px;left:50%;transform:translateX(-50%);z-index:8}

/* PRINT */
@media print{
  body{background:white;padding:0;gap:0;display:block}
  .lbl{display:none}
  .card{width:85.6mm;height:54mm;border-radius:3.5mm;box-shadow:none;
    -webkit-print-color-adjust:exact;print-color-adjust:exact;
    page-break-after:always;page-break-inside:avoid;margin:0 auto;display:block}
  .fh{height:13.5mm}
  .logo{width:11.4mm;height:11.4mm;border-width:0.25mm;top:1.2mm;box-shadow:0 0 0 0.2mm rgba(200,150,12,0.5)}
  .logo-ph{font-size:3.5pt}
  .photo{width:16.8mm;height:16.8mm;border-width:0.5mm;box-shadow:0 0 0 0.4mm #8B0000;top:1.2mm;right:4.8mm}
  .pfb{font-size:17pt}
  .name{top:14.8mm;left:3.6mm}
  .nf,.nl{font-size:13pt}
  .nl{margin-left:2mm}
  .rule{top:20.8mm;left:3.6mm;width:28mm;gap:0.7mm}
  .rd{width:0.6mm;height:0.6mm}
  .rl{height:0.1mm}
  .fields{top:22.2mm;left:3.6mm;gap:1.4mm}
  .field{gap:1.1mm}
  .fi{width:2.6mm;height:2.6mm;border-radius:0.6mm}
  .fi img{width:1.5mm;height:1.5mm}
  .flb{font-size:5.2pt;min-width:18mm}
  .fd{font-size:5.2pt}
  .fv{font-size:5.2pt}
  .lic{top:20.4mm;right:4.8mm;width:21.4mm}
  .lic-hd{font-size:3.2pt;margin-bottom:0.8mm}
  .lic-box{border-radius:1.4mm;border-width:0.15mm}
  .lic-bar{height:0.5mm}
  .lic-body{padding:1mm 1.5mm}
  .lic-s{font-size:2.8pt;margin-bottom:0.5mm}
  .lic-n{font-size:6.5pt}
  .lic-v{font-size:3.2pt;margin-top:0.7mm}
  .qr{bottom:9.8mm;right:4.8mm;width:9.4mm;height:9.4mm;border-radius:1.2mm;padding:0.5mm}
  .wave{height:8.8mm}
  .star-c svg{width:3.2mm;height:3.2mm}
  .star-c{bottom:2.2mm}
  .bheader{height:8.8mm;padding:0 3.4mm;gap:1.6mm}
  .blogo{width:5.8mm;height:5.8mm;border-width:0.15mm}
  .blogo-ph{font-size:3.2pt}
  .bfed1{font-size:3.5pt;letter-spacing:1pt}
  .bfed2{font-size:8pt;letter-spacing:1.5pt;margin-top:0.3mm}
  .bmag{top:9.6mm;height:4.4mm}
  .bsig{top:9.9mm;left:3.4mm;height:3mm;width:25mm}
  .bsig span{font-size:7pt}
  .btitle{top:15.4mm;font-size:4pt;letter-spacing:2pt}
  .born{top:17.4mm;left:3.2mm;right:3.2mm;gap:0.9mm}
  .bord{width:0.5mm;height:0.5mm}
  .borl{height:0.1mm}
  .bgrid{top:18.8mm;left:3.4mm;right:15.8mm;gap:1.8mm 2.8mm}
  .bfl{font-size:3.2pt;margin-bottom:0.4mm}
  .bfv{font-size:5.4pt}
  .bqr{top:18.4mm;right:3.2mm;width:12.6mm;height:12.6mm;border-radius:1.3mm;padding:0.7mm}
  .bwave{height:7.2mm}
  .bwm{font-size:50pt}
  .bstar svg{width:2.8mm;height:2.8mm}
  .bstar{bottom:1.8mm}
  @page{size:85.6mm 54mm;margin:0}
}
</style></head><body>

<p class="lbl">◼ recto</p>
<div class="card front">

  <div class="fh"></div>
  <div class="gl"></div>

  <div class="logo">
    <img src=${logoUrl} alt="FRMA"
      onerror="this.outerHTML='<div class=\\'logo-ph\\'>Logo<br/>Féd.</div>'" />
  </div>

  <!--  <svg class="wave wave-front" viewBox="0 0 856 88" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0,4 Q428,36 856,4 L856,24 Q428,56 0,24 Z" fill="#8B0000"/>
    <path d="M0,26 Q428,58 856,26 L856,46 Q428,78 0,46 Z" fill="#1e6b1e"/>
    <path d="M0,48 Q428,78 856,48 L856,88 L0,88 Z" fill="#8B0000"/>
  </svg> -->


  <div class="photo">${photo}</div>

  <div class="name">
    <span class="nf">${first}</span><span class="nl">${last ? "&nbsp;" + last : ""}</span>
  </div>
  <div class="rule"><div class="rd"></div><div class="rl"></div></div>

  <div class="fields">
    <div class="field">
      <div class="fi" style="background:#8B0000"><img src="${ICO.star}" alt=""/></div>
      <span class="flb">Catégorie</span><span class="fd">—</span><span class="fv">${cat}</span>
    </div>
    <div class="field">
      <div class="fi" style="background:#1e6b1e"><img src="${ICO.home}" alt=""/></div>
      <span class="flb">Club</span><span class="fd">—</span><span class="fv">${club}</span>
    </div>
    <div class="field">
      <div class="fi" style="background:#7a5200"><img src="${ICO.cal}" alt=""/></div>
      <span class="flb">Date de naissance</span><span class="fd">—</span><span class="fv">${dob}</span>
    </div>
    <div class="field">
      <div class="fi" style="background:#3a2a1a"><img src="${ICO.user}" alt=""/></div>
      <span class="flb">Genre</span><span class="fd">—</span><span class="fv">${gender}</span>
    </div>
  </div>

  <div class="lic">
    <div class="lic-hd">Numéro de licence</div>
    <div class="lic-box">
      <div class="lic-bar"></div>
      <div class="lic-body">
        <div class="lic-s">Saison ${card.season}</div>
        <div class="lic-n">${card.licenseNumber}</div>
        <div class="lic-v">Valable jusqu'au <span class="lic-vd">${validUntil}</span></div>
      </div>
    </div>
  </div>

  <div class="qr"><img src="${frontQrUrl}" alt="QR"/></div>

  <svg class="wave" viewBox="0 0 856 88" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
  <!--  <line x1="0" y1="0.5" x2="856" y2="0.5" stroke="rgba(184,134,11,0.4)" stroke-width="1.5"/>  -->
    <path d="M0,4 Q428,36 856,4 L856,24 Q428,56 0,24 Z" fill="#8B0000"/>
    <path d="M0,26 Q428,58 856,26 L856,46 Q428,78 0,46 Z" fill="#1e6b1e"/>
    <path d="M0,48 Q428,78 856,48 L856,88 L0,88 Z" fill="#8B0000"/>
  </svg>
  <div class="star-c">
  <!-- <img src="${StartLogo}" alt="" style="width: 40px; height: 40px;"/> -->
  <svg version="1.0" xmlns="http://www.w3.org/2000/svg"  width="55px" height="55px" viewBox="0 0 348.000000 348.000000"  preserveAspectRatio="xMidYMid meet"> <g transform="translate(0.000000,348.000000) scale(0.100000,-0.100000)" fill="#ffffff" stroke="none"> <path d="M1570 2932 c-90 -296 -182 -592 -203 -659 l-38 -123 -661 -2 -660 -3 531 -405 c292 -223 531 -410 531 -416 0 -7 -90 -304 -200 -660 -110 -356 -198 -649 -196 -651 2 -3 252 186 969 735 l97 74 98 -75 c512 -392 966 -736 969 -733 2 2 -87 294 -197 650 -110 356 -200 652 -200 659 0 7 239 194 531 417 l530 405 -660 3 -659 2 -16 48 c-8 26 -99 319 -202 652 -102 333 -189 608 -193 612 -3 3 -80 -235 -171 -530z m234 -565 c32 -105 61 -198 63 -204 4 -10 -25 -13 -127 -13 -102 0 -131 3 -127 13 2 6 31 99 63 204 33 106 61 193 64 193 3 0 31 -87 64 -193z m-564 -503 c0 -8 -71 -237 -76 -246 -4 -6 -277 196 -324 238 -12 12 18 14 193 14 114 0 207 -3 207 -6z m724 -11 c3 -10 33 -108 66 -217 52 -169 60 -202 47 -210 -7 -6 -85 -65 -171 -131 -86 -66 -161 -120 -166 -120 -5 0 -80 54 -166 120 -86 66 -164 125 -171 131 -13 8 -5 41 47 210 34 109 63 207 66 217 5 15 24 17 224 17 200 0 219 -2 224 -17z m681 8 c-45 -40 -325 -249 -328 -243 -6 9 -77 238 -77 246 0 3 93 6 207 6 119 0 203 -4 198 -9z m-1234 -787 c55 -42 97 -79 94 -83 -19 -19 -321 -248 -324 -245 -2 2 9 43 23 91 83 269 97 313 102 313 3 0 50 -34 105 -76z m814 -71 c26 -82 55 -174 65 -206 11 -32 16 -57 12 -55 -31 13 -331 253 -325 259 19 19 189 148 195 149 4 0 28 -66 53 -147z"/> </g> </svg>
  </div>
</div>

<p class="lbl">◼ verso</p>
<div class="card back">
  <div class="bglow"></div>
  <div class="bgl"></div>
  <div class="bwm">FRMA</div>

  <div class="bheader">
      <div class="blogo">
    <img src=${logoUrl} alt="FRMA"
      onerror="this.outerHTML='<div class=\\'logo-ph\\'>Logo<br/>Féd.</div>'" />
  </div>
    <div>
      <div class="bfed1">Fédération Royale Marocaine</div>
      <div class="bfed2">D'Aviron</div>
    </div>  
  </div>

  <div class="bmag"></div>
  <div class="bsig"><span>${member.fullName}</span></div>

  <div class="btitle">Carte de membre officielle</div>
  <div class="born"><div class="borl"></div><div class="bord"></div><div class="borl"></div></div>

  <div class="bgrid">
    <div><div class="bfl">Nom complet</div><div class="bfv">${member.fullName}</div></div>
    <div><div class="bfl">N° Licence</div><div class="bfv">${card.licenseNumber}</div></div>
    <div><div class="bfl">Catégorie</div><div class="bfv">${cat}</div></div>
    <div><div class="bfl">Saison</div><div class="bfv">${card.season}</div></div>
    <div><div class="bfl">Valide du</div><div class="bfv">${validFrom}</div></div>
    <div><div class="bfl">Valide jusqu'au</div><div class="bfv">${validUntil}</div></div>
    <div><div class="bfl">Club</div><div class="bfv">${club}</div></div>
    <div><div class="bfl">Genre</div><div class="bfv">${gender}</div></div>
  </div>

  <div class="bqr"><img src="${backQrUrl}" alt="QR"/></div>

  <svg class="bwave" viewBox="0 0 856 72" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="0" y1="0.5" x2="856" y2="0.5" stroke="rgba(200,150,12,0.25)" stroke-width="1.5"/>
    <path d="M0,4 Q428,32 856,4 L856,22 Q428,50 0,22 Z" fill="#8B0000"/>
    <path d="M0,24 Q428,52 856,24 L856,42 Q428,70 0,42 Z" fill="rgba(255,255,255,0.06)"/>
    <path d="M0,44 Q428,68 856,44 L856,72 L0,72 Z" fill="#8B0000"/>
  </svg>
  <div class="bstar">
 <!-- <img src="${StartLogo}" alt="" style="width: 40px; height: 40px;"/> -->
  <svg version="1.0" xmlns="http://www.w3.org/2000/svg"  width="55px" height="55px" viewBox="0 0 348.000000 348.000000"  preserveAspectRatio="xMidYMid meet"> <g transform="translate(0.000000,348.000000) scale(0.100000,-0.100000)" fill="#ffffff" stroke="none"> <path d="M1570 2932 c-90 -296 -182 -592 -203 -659 l-38 -123 -661 -2 -660 -3 531 -405 c292 -223 531 -410 531 -416 0 -7 -90 -304 -200 -660 -110 -356 -198 -649 -196 -651 2 -3 252 186 969 735 l97 74 98 -75 c512 -392 966 -736 969 -733 2 2 -87 294 -197 650 -110 356 -200 652 -200 659 0 7 239 194 531 417 l530 405 -660 3 -659 2 -16 48 c-8 26 -99 319 -202 652 -102 333 -189 608 -193 612 -3 3 -80 -235 -171 -530z m234 -565 c32 -105 61 -198 63 -204 4 -10 -25 -13 -127 -13 -102 0 -131 3 -127 13 2 6 31 99 63 204 33 106 61 193 64 193 3 0 31 -87 64 -193z m-564 -503 c0 -8 -71 -237 -76 -246 -4 -6 -277 196 -324 238 -12 12 18 14 193 14 114 0 207 -3 207 -6z m724 -11 c3 -10 33 -108 66 -217 52 -169 60 -202 47 -210 -7 -6 -85 -65 -171 -131 -86 -66 -161 -120 -166 -120 -5 0 -80 54 -166 120 -86 66 -164 125 -171 131 -13 8 -5 41 47 210 34 109 63 207 66 217 5 15 24 17 224 17 200 0 219 -2 224 -17z m681 8 c-45 -40 -325 -249 -328 -243 -6 9 -77 238 -77 246 0 3 93 6 207 6 119 0 203 -4 198 -9z m-1234 -787 c55 -42 97 -79 94 -83 -19 -19 -321 -248 -324 -245 -2 2 9 43 23 91 83 269 97 313 102 313 3 0 50 -34 105 -76z m814 -71 c26 -82 55 -174 65 -206 11 -32 16 -57 12 -55 -31 13 -331 253 -325 259 19 19 189 148 195 149 4 0 28 -66 53 -147z"/> </g> </svg>
  
  </div>
</div>

<p style="color:rgba(255,255,255,0.2);font:400 11px/1 'Inter',Arial,sans-serif;text-align:center;margin-top:-24px">
  Ctrl + P → Enregistrer en PDF
</p>
</body></html>`;
}
