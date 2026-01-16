import type { BeritaAcara } from "../types";

interface MahasiswaData {
  nama: string;
  nim: string;
  programStudi: string;
}

interface DosenPengujiData {
  no: number;
  nama: string;
  status: string;
  tandaTangan?: string;
}

export interface BeritaAcaraTemplateData {
  hari: string;
  tanggal: string;
  bulan: string;
  tahun: string;
  nama: string;
  nim: string;
  programStudi: string;
  judulKP: string;
  dosenPembimbing: string;
  nipPembimbing: string;
  pembimbingLapangan: string;
  penguji: DosenPengujiData[];
  tempat: string;
  tanggalPenandatanganan: string;
  namaDosen: string;
  nipDosen: string;
}

export const generateBeritaAcaraHTML = (
  beritaAcara: BeritaAcara,
  mahasiswa: MahasiswaData,
  dosenPenguji: DosenPengujiData[]
): string => {
  const tanggalObj = new Date(beritaAcara.tanggalSidang);
  const hari = tanggalObj.toLocaleDateString("id-ID", { weekday: "long" });
  const tanggal = tanggalObj.getDate();
  const bulan = tanggalObj.toLocaleDateString("id-ID", { month: "long" });
  const tahun = tanggalObj.getFullYear();

  const pengujiRows = dosenPenguji
    .map(
      (penguji) => `
    <tr>
      <td style="border: 1px solid black; padding: 8px; text-align: center;">${penguji.no}</td>
      <td style="border: 1px solid black; padding: 8px;">${penguji.nama}</td>
      <td style="border: 1px solid black; padding: 8px; text-align: center;">${penguji.status}</td>
      <td style="border: 1px solid black; padding: 8px;"></td>
    </tr>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      margin: 0;
      size: A4;
    }
    @media print {
      @page {
        margin: 0;
      }
      body {
        margin: 1.5cm;
      }
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      line-height: 1.6;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 {
      text-align: center;
      font-size: 16pt;
      font-weight: bold;
      margin-bottom: 30px;
    }
    .content {
      font-size: 12pt;
      text-align: justify;
    }
    .field {
      margin: 5px 0;
    }
    .field-label {
      display: inline-block;
      width: 180px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid black;
      padding: 8px;
    }
    th {
      background-color: #f0f0f0;
      font-weight: bold;
      text-align: center;
    }
    .signature-section {
      margin-top: 50px;
      text-align: right;
    }
    .signature-box {
      display: inline-block;
      text-align: center;
      margin-top: 20px;
    }
    .signature-line {
      margin-top: 60px;
      border-bottom: 1px solid black;
      width: 200px;
    }
  </style>
</head>
<body>
  <h1>BERITA ACARA UJIAN KP</h1>
  
  <div class="content">
    <p>
      Pada hari ini <strong>${hari}</strong> tanggal <strong>${tanggal}</strong> 
      bulan <strong>${bulan}</strong> tahun <strong>${tahun}</strong>, 
      telah dilaksanakan ujian KP mahasiswa :
    </p>
    
    <div class="field">
      <span class="field-label">Nama</span> : ${mahasiswa.nama}
    </div>
    <div class="field">
      <span class="field-label">NIM</span> : ${mahasiswa.nim}
    </div>
    <div class="field">
      <span class="field-label">Program Studi</span> : ${mahasiswa.programStudi}
    </div>
    <div class="field">
      <span class="field-label">Judul KP</span> : ${beritaAcara.judulLaporan}
    </div>
    <br>
    <div class="field">
      <span class="field-label">Dosen Pembimbing</span> : ${beritaAcara.dosenSignature?.nama || dosenPenguji.find(d => d.status === "Dosen Pembimbing KP")?.nama || "-"}
    </div>
    ${beritaAcara.dosenSignature?.nip ? `<div class="field">
      <span class="field-label">NIP Pembimbing</span> : ${beritaAcara.dosenSignature.nip}
    </div>` : ''}
    <div class="field">
      <span class="field-label">Pembimbing Lapangan</span> : ${beritaAcara.tempatPelaksanaan}
    </div>
    <div class="field">
      <span class="field-label">Dengan penguji</span> :
    </div>
    
    <table>
      <thead>
        <tr>
          <th style="width: 10%;">No.</th>
          <th style="width: 40%;">Nama Penguji</th>
          <th style="width: 25%;">Status</th>
          <th style="width: 25%;">Tanda Tangan</th>
        </tr>
      </thead>
      <tbody>
        ${pengujiRows}
      </tbody>
    </table>
    
    <div class="signature-section">
      <p>Palembang, ${new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}</p>
      <p>Dosen Pembimbing,</p>
      <div class="signature-box">
        ${
          beritaAcara.dosenSignature?.signatureImage
            ? `<img src="${beritaAcara.dosenSignature.signatureImage}" alt="Signature" style="max-width: 200px; max-height: 100px; margin-bottom: 5px;"/>`
            : '<div class="signature-line"></div>'
        }
        <p style="margin-top: ${beritaAcara.dosenSignature?.signatureImage ? '5px' : '10px'};">
          <strong>${beritaAcara.dosenSignature?.nama || dosenPenguji.find(d => d.status === "Dosen Pembimbing KP")?.nama || "-"}</strong><br>
          NIP: ${beritaAcara.dosenSignature?.nip || "-"}
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

// Fungsi untuk download sebagai HTML (untuk preview atau print to PDF)
export const downloadBeritaAcaraHTML = (
  beritaAcara: BeritaAcara,
  mahasiswa: MahasiswaData,
  dosenPenguji: DosenPengujiData[]
) => {
  const html = generateBeritaAcaraHTML(beritaAcara, mahasiswa, dosenPenguji);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  
  // Buka di window baru untuk print
  const printWindow = window.open(url, "_blank");
  if (printWindow) {
    printWindow.onload = () => {
      // User bisa print to PDF dari browser
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  }
};
