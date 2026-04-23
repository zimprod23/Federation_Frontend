import { Button } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import { MemberResponseDTO, CardResponseDTO } from "@/types";
import FedLogo from "@/assets/fed-photo.png";
import QRCode from "qrcode";
import dayjs from "dayjs";

interface Props {
  member: MemberResponseDTO;
  card: CardResponseDTO;
  clubName?: string;
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

export default function MemberAttestationDownload({
  member,
  card,
  clubName,
}: Props) {
  const handleDownload = async () => {
    // Dynamically get origin (handles localhost or production)
    const baseUrl = window.location.origin.includes("localhost")
      ? "http://localhost:3000"
      : window.location.origin;

    const photoAbsolute = member.photoUrl
      ? `${baseUrl}${new URL(member.photoUrl).pathname}`
      : null;

    // const qrDataUrl = await QRCode.toDataURL(card.qrPayload, {
    //   width: 180,
    //   margin: 1,
    //   color: { dark: "#8B0000", light: "#ffffff" },
    // });
    const qrDataUrl = await QRCode.toDataURL(
      `${member.fullName}\n${card.licenseNumber}\nSaison ${card.season}`,
      { width: 200, margin: 1, color: { dark: "#1e6b1e", light: "#ffffff" } },
    );

    const html = buildAttestationHtml(
      member,
      card,
      photoAbsolute,
      clubName,
      qrDataUrl,
    );
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();

    // Slight delay to ensure images/fonts are loaded before print dialog
    win.onload = () =>
      setTimeout(() => {
        win.print();
        // Optional: win.close();
      }, 500);
  };

  return (
    <Button
      icon={<FileTextOutlined />}
      onClick={() => void handleDownload()}
      block
      style={{
        background: "#fff",
        borderColor: "#8B0000",
        color: "#8B0000",
        fontWeight: 700,
        height: 40,
        borderRadius: 8,
        marginTop: 8,
      }}
    >
      Télécharger l'attestation
    </Button>
  );
}

function buildAttestationHtml(
  member: MemberResponseDTO,
  card: CardResponseDTO,
  photoUrl: string | null,
  clubName: string | undefined,
  qrDataUrl: string,
  logoUrl: string = FedLogo,
): string {
  const today = dayjs().format("DD MMMM YYYY");
  const validUntil = dayjs(card.validUntil).format("DD MMMM YYYY");
  const validFrom = dayjs(card.validFrom).format("DD MMMM YYYY");
  const dob = member.dateOfBirth
    ? dayjs(member.dateOfBirth).format("DD MMMM YYYY")
    : "—";
  const clubDisplay = clubName ?? "Sans club";
  const catLabel = CAT[member.category] ?? member.category;
  const genderLabel = GENDER_LABEL[member.gender] ?? member.gender;

  // Clean license number for reference ID
  const cleanLicense = card.licenseNumber.replace(/[^A-Z0-9]/gi, "");
  const attestNumber = `ATT-${card.season}-${cleanLicense}-${dayjs().format("MMDD")}`;

  const photoSection = photoUrl
    ? `<img src="${photoUrl}" class="member-photo" crossorigin="anonymous" onerror="this.style.display='none'" />`
    : `<div class="member-photo photo-placeholder">${member.firstName.charAt(0)}${member.lastName.charAt(0)}</div>`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<title>Attestation — ${member.fullName}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  * { margin:0; padding:0; box-sizing:border-box; }

  body {
    background: #e8e8e8;
    font-family: 'Inter', Arial, sans-serif;
    display: flex;
    justify-content: center;
    padding: 20px;
  }

  .page {
    width: 794px; /* A4 Width at 96 DPI */
    height: 1123px; /* A4 Height at 96 DPI */
    background: #ffffff;
    position: relative;
    box-shadow: 0 4px 32px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .top-stripe {
    height: 10px;
    background: linear-gradient(90deg, #8B0000 0%, #8B0000 33%, #1e6b1e 33%, #1e6b1e 66%, #8B0000 66%, #8B0000 100%);
  }

  .gold-line { height: 3px; background: #b8860b; }

  .header {
    display: flex;
    align-items: center;
    padding: 30px 48px 20px;
    gap: 24px;
    border-bottom: 1px solid #ece8e0;
  }

  .logo-circle {
    width: 100px; height: 100px;
    border-radius: 50%;
    border: 3px solid #8B0000;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
  }
  .logo-circle img { width: 100%; height: 100%; object-fit: contain; }

  .header-text { flex: 1; }
  .header-fed-line2 { font-size: 20px; font-weight: 700; color: #8B0000; }

  .header-right { text-align: right; font-size: 11px; color: #888; }
  .att-number { font-weight: 600; color: #8B0000; font-family: monospace; }

  .doc-title-wrap {
    text-align: center;
    padding: 20px;
    background: #faf8f4;
    border-bottom: 1px solid #ece8e0;
  }
  .doc-title { font-size: 24px; font-weight: 700; color: #8B0000; letter-spacing: 2px; }

  .body { padding: 30px 48px; flex: 1; }

  .opening { font-size: 14px; line-height: 1.6; margin-bottom: 25px; color: #333; }

  .member-card {
    display: flex; gap: 25px;
    background: #fdf9f0;
    border: 1px solid #e8d8a0;
    border-left: 5px solid #8B0000;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
  }

  .member-photo { width: 110px; height: 130px; object-fit: cover; border: 2px solid #8B0000; border-radius: 4px; }
  .photo-placeholder { display: flex; align-items: center; justify-content: center; background: #eee; font-size: 30px; color: #8B0000; }

  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
  .field-label { font-size: 10px; color: #999; text-transform: uppercase; }
  .field-value { font-size: 13px; font-weight: 600; }

  .validity-section {
    background: #f4f9f4;
    border: 1px solid #d4e4d4;
    border-left: 5px solid #1e6b1e;
    padding: 15px 20px;
    border-radius: 8px;
    margin-bottom: 20px;
  }

  .signature-section {
    display: flex; justify-content: space-between; align-items: flex-end;
    margin-top: 40px;
  }

  .qr-stamp-row {
    display: flex; justify-content: space-between; align-items: flex-end;
    margin-top: 30px; padding-top: 20px; border-top: 1px dashed #ddd;
  }

  .qr-block img { width: 90px; height: 90px; border: 1px solid #eee; }

  .stamp-circle {
    width: 100px; height: 100px; border-radius: 50%;
    border: 2px solid rgba(139, 0, 0, 0.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 9px; font-weight: 800; color: rgba(139, 0, 0, 0.2);
    text-align: center; transform: rotate(-15deg);
  }

  /* Footer Fixed at Bottom */
  .footer {
    width: 100%;
    margin-top: auto; /* Pushes to bottom */
  }

  .footer-band {
    background: linear-gradient(90deg, #8B0000 0%, #8B0000 33%, #1e6b1e 33%, #1e6b1e 66%, #8B0000 66%, #8B0000 100%);
    padding: 12px 48px;
    display: flex; justify-content: space-between;
    color: white; font-size: 10px;
  }

  @media print {
    @page { size: A4; margin: 0; }
    body { background: white; padding: 0; margin: 0; }
    .page { 
      width: 210mm; height: 297mm; 
      box-shadow: none; 
      -webkit-print-color-adjust: exact; 
      print-color-adjust: exact;
    }
    .footer { position: absolute; bottom: 0; left: 0; }
  }
</style>
</head>
<body>
<div class="page">
  <div class="top-stripe"></div>
  <div class="gold-line"></div>

  <div class="header">
    <div class="logo-circle">
      <img src=${logoUrl} alt="Logo FRMA" onerror="this.style.display='none'" />
    </div>
    <div class="header-text">
      <div style="font-size: 10px; color: #888; text-transform: uppercase;">Royaume du Maroc</div>
      <div class="header-fed-line2">Fédération Royale Marocaine d'Aviron</div>
    </div>
    <div class="header-right">
      <div>Réf : <span class="att-number">${attestNumber}</span></div>
      <div>Date : ${today}</div>
    </div>
  </div>

  <div class="doc-title-wrap">
    <div class="doc-title">ATTESTATION DE LICENCE</div>
  </div>

  <div class="body">
    <p class="opening">
      La <strong>FRMA</strong> certifie que le membre ci-dessous est titulaire d'une licence officielle 
      pour la saison <strong>${card.season}</strong>, l'autorisant à pratiquer l'aviron en compétition.
    </p>

    <div class="member-card">
      ${photoSection}
      <div style="flex:1">
        <div style="font-size: 18px; font-weight: 700; color: #8B0000;">${member.fullName}</div>
        <div style="font-family: monospace; background: #eee; padding: 2px 8px; display: inline-block; margin: 5px 0;">
          ${member.licenseNumber}
        </div>
        <div class="info-grid">
          <div class="info-field"><span class="field-label">Né(e) le</span><br/><span class="field-value">${dob}</span></div>
          <div class="info-field"><span class="field-label">Genre</span><br/><span class="field-value">${genderLabel}</span></div>
          <div class="info-field"><span class="field-label">Club</span><br/><span class="field-value">${clubDisplay}</span></div>
          <div class="info-field"><span class="field-label">Catégorie</span><br/><span class="field-value">${catLabel}</span></div>
        </div>
      </div>
    </div>

    <div class="validity-section">
      <div style="font-size: 10px; font-weight: 700; margin-bottom: 5px;">VALIDITÉ</div>
      <div style="display: flex; gap: 30px;">
        <div><span class="field-label">Du:</span> <span class="field-value">${validFrom}</span></div>
        <div><span class="field-label">Au:</span> <span class="field-value">${validUntil}</span></div>
      </div>
    </div>

    <div style="font-size: 12px; color: #555; line-height: 1.5;">
        Cette attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit, notamment pour la participation
aux compétitions nationales et internationales, ainsi que pour toute démarche administrative liée à la pratique
sportive de l'aviron au Maroc. La présente licence est strictement personnelle et non cessible.
    </div>

    <div class="signature-section">
      <div style="font-size: 12px;">Fait à Rabat, le ${today}</div>
      <div style="text-align: center; min-width: 200px;">
        <div style="font-size: 11px; margin-bottom: 40px;">Le Secrétaire Général</div>
        <div style="border-top: 1px solid #8B0000; padding-top: 5px; font-weight: 700; color: #8B0000;">Cachet de la Fédération</div>
      </div>
    </div>

    <div class="qr-stamp-row">
      <div class="qr-block">
        <img src="${qrDataUrl}" />
        <div style="font-size: 8px; color: #999; margin-top: 5px;">Vérifier l'authenticité</div>
      </div>
      <div class="stamp-circle">FRMA<br/>OFFICIEL<br/>${card.season}</div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-band">
      <span>Document généré par le système FRMA Digital</span>
      <span>© ${dayjs().year()} FRMA</span>
    </div>
  </div>
</div>
</body>
</html>`;
}
