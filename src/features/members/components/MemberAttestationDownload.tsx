import { Button } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import { MemberResponseDTO, CardResponseDTO } from "@/types";
import QRCode from "qrcode";
import dayjs from "dayjs";
// import { FedPhoto } from "@/assets/";

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
    const photoAbsolute = member.photoUrl
      ? `http://localhost:3000${new URL(member.photoUrl).pathname}`
      : null;

    // QR — verification payload
    const qrDataUrl = await QRCode.toDataURL(card.qrPayload, {
      width: 180,
      margin: 1,
      color: { dark: "#003f8a", light: "#ffffff" },
    });

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
    win.onload = () => setTimeout(() => win.print(), 800);
  };

  return (
    <Button
      icon={<FileTextOutlined />}
      onClick={() => void handleDownload()}
      block
      style={{
        background: "#fff",
        borderColor: "#0077c8",
        color: "#0077c8",
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
  const attestNumber = `ATT-${card.season}-${card.licenseNumber.replace(/\//g, "")}-${dayjs().format("MMDD")}`;

  const photoSection = photoUrl
    ? `<img src="${photoUrl}" class="member-photo" crossorigin="anonymous"
         onerror="this.style.display='none'" />`
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
    background:  #e8e8e8;
    font-family: 'Inter', Arial, sans-serif;
    display:     flex;
    align-items: flex-start;
    justify-content: center;
    min-height:  100vh;
    padding:     32px 16px;
  }

  /* ══ A4 page ══════════════════════════════════════ */
  .page {
    width:       794px;
    min-height:  1123px;
    background:  #ffffff;
    position:    relative;
    overflow:    hidden;
    box-shadow:  0 4px 32px rgba(0,0,0,0.18);
  }

  /* ── Top border stripe ── */
  .top-stripe {
    height:     10px;
    background: linear-gradient(90deg, #003f8a 0%, #0077c8 50%, #00a3e0 100%);
  }

  /* ── Gold accent line below stripe ── */
  .gold-line {
    height:     3px;
    background: #D9AE40;
  }

  /* ── Header ── */
  .header {
    display:     flex;
    align-items: center;
    padding:     28px 48px 24px;
    gap:         24px;
    border-bottom: 1px solid #e8e8e8;
  }

  .logo-circle {
    width:         80px;
    height:        80px;
    border-radius: 50%;
    border:        3px solid #0077c8;
    background:    #f0f6ff;
    display:       flex;
    align-items:   center;
    justify-content: center;
    flex-shrink:   0;
    font-size:     28px;
  }

  .header-text { flex: 1; }

  .header-fed-line1 {
    font-size:      11px;
    font-weight:    500;
    color:          #666;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom:  4px;
  }

  .header-fed-line2 {
    font-size:   26px;
    font-weight: 700;
    color:       #003f8a;
    letter-spacing: 1px;
    line-height: 1;
  }

  .header-fed-line3 {
    font-size:  12px;
    color:      #888;
    margin-top: 4px;
  }

  .header-right {
    text-align: right;
    font-size:  11px;
    color:      #888;
    line-height: 1.7;
  }

  .header-right .att-number {
    font-size:   12px;
    font-weight: 600;
    color:       #003f8a;
    font-family: monospace;
  }

  /* ── Document title ── */
  .doc-title-wrap {
    text-align: center;
    padding:    32px 48px 24px;
    position:   relative;
  }

  .doc-title-label {
    font-size:      10px;
    font-weight:    600;
    color:          #0077c8;
    text-transform: uppercase;
    letter-spacing: 4px;
    margin-bottom:  8px;
  }

  .doc-title {
    font-size:   28px;
    font-weight: 700;
    color:       #003f8a;
    text-transform: uppercase;
    letter-spacing: 3px;
  }

  .doc-title-under {
    width:      80px;
    height:     3px;
    background: #D9AE40;
    margin:     12px auto 0;
    border-radius: 2px;
  }

  /* ── Body ── */
  .body {
    padding: 0 48px 32px;
  }

  /* Opening paragraph */
  .opening {
    font-size:   14px;
    color:       #444;
    line-height: 1.8;
    margin-bottom: 32px;
    text-align:  justify;
  }

  .opening strong { color: #003f8a; font-weight: 600; }

  /* Member info card */
  .member-card {
    display:       flex;
    gap:           28px;
    background:    #f5f8ff;
    border:        1px solid #d0e0f5;
    border-left:   5px solid #0077c8;
    border-radius: 8px;
    padding:       24px;
    margin-bottom: 32px;
  }

  .member-photo {
    width:         120px;
    height:        140px;
    object-fit:    cover;
    border-radius: 6px;
    border:        2px solid #0077c8;
    flex-shrink:   0;
  }

  .photo-placeholder {
    display:         flex;
    align-items:     center;
    justify-content: center;
    background:      #dce8f8;
    font-size:       36px;
    font-weight:     700;
    color:           #0077c8;
  }

  .member-info { flex: 1; }

  .member-full-name {
    font-size:   22px;
    font-weight: 700;
    color:       #003f8a;
    margin-bottom: 4px;
  }

  .member-license {
    display:       inline-block;
    font-size:     13px;
    font-weight:   600;
    color:         #0077c8;
    background:    #e0eeff;
    padding:       3px 10px;
    border-radius: 4px;
    font-family:   monospace;
    margin-bottom: 16px;
  }

  .info-grid {
    display:               grid;
    grid-template-columns: 1fr 1fr;
    gap:                   10px 24px;
  }

  .info-field { display: flex; flex-direction: column; gap: 2px; }

  .field-label {
    font-size:      10px;
    font-weight:    600;
    color:          #888;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .field-value {
    font-size:   14px;
    font-weight: 500;
    color:       #222;
  }

  /* Validity section */
  .validity-section {
    background:    #fff8e6;
    border:        1px solid #f0d080;
    border-left:   5px solid #D9AE40;
    border-radius: 8px;
    padding:       20px 24px;
    margin-bottom: 32px;
  }

  .validity-title {
    font-size:   12px;
    font-weight: 700;
    color:       #8a6000;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 12px;
  }

  .validity-dates {
    display: flex;
    gap:     48px;
  }

  .validity-field { display: flex; flex-direction: column; gap: 3px; }

  .validity-label {
    font-size:  11px;
    color:      #888;
    font-weight: 500;
  }

  .validity-value {
    font-size:   16px;
    font-weight: 700;
    color:       #003f8a;
  }

  /* Closing text */
  .closing {
    font-size:   13.5px;
    color:       #444;
    line-height: 1.9;
    text-align:  justify;
    margin-bottom: 40px;
  }

  /* Signature section */
  .signature-section {
    display:         flex;
    justify-content: space-between;
    align-items:     flex-end;
    margin-bottom:   32px;
    gap:             24px;
  }

  .sig-left {
    font-size:  13px;
    color:      #555;
    line-height: 1.8;
  }

  .sig-right { text-align: right; }

  .sig-title {
    font-size:  12px;
    color:      #888;
    margin-bottom: 48px;
  }

  .sig-name {
    font-size:   14px;
    font-weight: 700;
    color:       #003f8a;
    border-top:  1.5px solid #003f8a;
    padding-top: 8px;
    min-width:   200px;
    text-align:  center;
  }

  .sig-role {
    font-size: 11px;
    color:     #888;
    text-align: center;
  }

  /* QR + stamp row */
  .qr-stamp-row {
    display:         flex;
    justify-content: space-between;
    align-items:     flex-end;
    padding:         24px 0 0;
    border-top:      1px dashed #ccc;
  }

  .qr-block { display: flex; flex-direction: column; align-items: center; gap: 6px; }

  .qr-block img {
    width:         90px;
    height:        90px;
    border:        1px solid #ccc;
    border-radius: 4px;
    padding:       4px;
  }

  .qr-label {
    font-size:  10px;
    color:      #aaa;
    text-align: center;
    max-width:  100px;
  }

  .stamp-circle {
    width:         120px;
    height:        120px;
    border-radius: 50%;
    border:        3px solid #0077c8;
    display:       flex;
    align-items:   center;
    justify-content: center;
    opacity:       0.25;
    flex-direction: column;
    text-align:    center;
  }

  .stamp-inner {
    font-size:      10px;
    font-weight:    700;
    color:          #003f8a;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    line-height:    1.4;
  }

  .att-ref {
    font-size:  11px;
    color:      #bbb;
    font-family: monospace;
    text-align: right;
  }

  /* ── Footer ── */
  .footer {
    position:   absolute;
    bottom:     0; left:0; right:0;
  }

  .footer-gold {
    height:     2px;
    background: #D9AE40;
  }

  .footer-band {
    background: linear-gradient(90deg, #003f8a 0%, #0077c8 100%);
    padding:    10px 48px;
    display:    flex;
    justify-content: space-between;
    align-items: center;
  }

  .footer-text {
    font-size: 10px;
    color:     rgba(255,255,255,0.7);
  }

  .footer-right {
    font-size:  10px;
    color:      rgba(255,255,255,0.5);
    font-style: italic;
  }

  /* ══ Print ══════════════════════════════════════ */
  @media print {
    body { background: white; padding: 0; }

    .page {
      width:      210mm;
      min-height: 297mm;
      box-shadow: none;
    }

    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;

    @page { size: A4; margin: 0; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- Top stripe -->
  <div class="top-stripe"></div>
  <div class="gold-line"></div>

  <!-- Header -->
  <div class="header">
    <div class="logo-circle">
      <img src="https://federation-front.vercel.app/logo192.png" alt="Logo FRMA" style="width:60%; height:60%;" />
    </div>
    <div class="header-text">
      <div class="header-fed-line1">Royaume du Maroc</div>
      <div class="header-fed-line2">Fédération Royale Marocaine d'Aviron</div>
      <div class="header-fed-line3">Membre de la Fédération Internationale de Sociétés d'Aviron (FISA)</div>
    </div>
    <div class="header-right">
      <div>Réf. : <span class="att-number">${attestNumber}</span></div>
      <div>Date : ${today}</div>
      <div>Saison sportive : ${card.season}</div>
    </div>
  </div>

  <!-- Document title -->
  <div class="doc-title-wrap">
    <div class="doc-title-label">Document officiel</div>
    <div class="doc-title">Attestation de Licence</div>
    <div class="doc-title-under"></div>
  </div>

  <!-- Body -->
  <div class="body">

    <!-- Opening -->
    <div class="opening">
      La <strong>Fédération Royale Marocaine d'Aviron (FRMA)</strong> atteste par la présente
      que le membre dont l'identité figure ci-dessous est dûment licencié(e) pour la saison
      sportive <strong>${card.season}</strong> et est autorisé(e) à participer à toutes les
      compétitions et activités officielles organisées sous l'égide de la fédération.
    </div>

    <!-- Member card -->
    <div class="member-card">
      ${photoSection}
      <div class="member-info">
        <div class="member-full-name">${member.fullName}</div>
        <div class="member-license">${member.licenseNumber}</div>
        <div class="info-grid">
          <div class="info-field">
            <span class="field-label">Date de naissance</span>
            <span class="field-value">${dob}</span>
          </div>
          <div class="info-field">
            <span class="field-label">Genre</span>
            <span class="field-value">${genderLabel}</span>
          </div>
          <div class="info-field">
            <span class="field-label">Catégorie</span>
            <span class="field-value">${catLabel}</span>
          </div>
          <div class="info-field">
            <span class="field-label">Club affilié</span>
            <span class="field-value">${clubDisplay}</span>
          </div>
          ${
            member.cin
              ? `
          <div class="info-field">
            <span class="field-label">CIN</span>
            <span class="field-value">${member.cin}</span>
          </div>`
              : ""
          }
          <div class="info-field">
            <span class="field-label">N° de carte</span>
            <span class="field-value">${card.cardNumber}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Validity -->
    <div class="validity-section">
      <div class="validity-title">⏱ Période de validité de la licence</div>
      <div class="validity-dates">
        <div class="validity-field">
          <span class="validity-label">Valide à partir du</span>
          <span class="validity-value">${validFrom}</span>
        </div>
        <div class="validity-field">
          <span class="validity-label">Valide jusqu'au</span>
          <span class="validity-value">${validUntil}</span>
        </div>
        <div class="validity-field">
          <span class="validity-label">Saison</span>
          <span class="validity-value">${card.season}</span>
        </div>
      </div>
    </div>

    <!-- Closing -->
    <div class="closing">
      Cette attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit,
      notamment pour la participation aux compétitions nationales et internationales,
      ainsi que pour toute démarche administrative liée à la pratique sportive de l'aviron
      au Maroc. La présente licence est strictement personnelle et non cessible.
      <br /><br />
      La vérification de l'authenticité de ce document peut être effectuée en scannant
      le code QR ci-dessous ou en contactant la fédération.
    </div>

    <!-- Signature -->
    <div class="signature-section">
      <div class="sig-left">
        Fait à Rabat, le ${today}<br />
        Pour la Fédération Royale Marocaine d'Aviron
      </div>
      <div class="sig-right">
        <div class="sig-title">Le Secrétaire Général</div>
        <div class="sig-name">Fédération Royale Marocaine d'Aviron</div>
        <div class="sig-role">Signature et cachet</div>
      </div>
    </div>

    <!-- QR + stamp row -->
    <div class="qr-stamp-row">
      <div class="qr-block">
        <img src="${qrDataUrl}" alt="QR de vérification" />
        <div class="qr-label">Scanner pour vérifier l'authenticité</div>
      </div>

      <div class="att-ref">${attestNumber}</div>

      <div class="stamp-circle">
        <div class="stamp-inner">
          FRMA<br/>OFFICIEL<br/>${card.season}
        </div>
      </div>
    </div>

  </div><!-- /body -->

  <!-- Footer -->
  <div class="footer">
    <div class="footer-gold"></div>
    <div class="footer-band">
      <span class="footer-text">Fédération Royale Marocaine d'Aviron — Document officiel</span>
      <span class="footer-right">Ce document est généré électroniquement et est valable sans signature manuscrite</span>
    </div>
  </div>

</div><!-- /page -->
</body>
</html>`;
}
