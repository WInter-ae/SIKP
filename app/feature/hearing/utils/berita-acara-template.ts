import type { BeritaAcara } from "../types";

interface MahasiswaData {
  nama: string;
  nim: string;
  programStudi: string;
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
  tempat: string;
  tanggalPenandatanganan: string;
  namaDosen: string;
  nipDosen: string;
}

export const generateBeritaAcaraHTML = (
  beritaAcara: BeritaAcara,
  mahasiswa: MahasiswaData
): string => {
  const tanggalObj = new Date(beritaAcara.tanggalSidang);
  const hari = tanggalObj.toLocaleDateString("id-ID", { weekday: "long" });
  const tanggal = tanggalObj.getDate();
  const bulan = tanggalObj.toLocaleDateString("id-ID", { month: "long" });
  const tahun = tanggalObj.getFullYear();

  // Load e-signature dosen dari localStorage (dari profil dosen)
  let dosenESignature = null;
  let dosenProfile = null;
  if (typeof window !== 'undefined') {
    try {
      const savedSignature = localStorage.getItem("dosen-esignature");
      if (savedSignature) {
        dosenESignature = JSON.parse(savedSignature);
      }
      
      // Load profil dosen untuk nama dan NIP
      const savedProfile = localStorage.getItem("dosen-profile");
      if (savedProfile) {
        dosenProfile = JSON.parse(savedProfile);
      }
    } catch (e) {
      console.error("Error loading dosen data:", e);
    }
  }

  // Generate table rows untuk penguji dengan tanda tangan
  // Fallback ke array kosong jika dosenPenguji tidak ada (data lama)
  const dosenPengujiList = beritaAcara.dosenPenguji || [];
  
  // Jika tidak ada data dosen (data lama), gunakan data dari profil dosen
  const finalDosenList = dosenPengujiList.length > 0 
    ? dosenPengujiList 
    : [
        {
          id: '1',
          nama: dosenProfile?.nama || 'Dosen Pembimbing',
          nip: dosenProfile?.nip || '-',
          jabatan: 'pembimbing' as const
        }
      ];
  
  const pengujiRows = finalDosenList
    .map(
      (dosenData, index) => {
        // Hitung nomor urut berdasarkan jabatan
        let displayNumber = index + 1;
        let displayStatus = '';
        
        if (dosenData.jabatan === 'pembimbing') {
          displayNumber = 1;
          displayStatus = 'Dosen Pembimbing KP';
        } else {
          // Hitung berapa banyak penguji sebelum dosen ini
          const previousPengujiCount = finalDosenList
            .slice(0, index)
            .filter(d => d.jabatan === 'penguji').length;
          displayNumber = index + 1;
          displayStatus = `Penguji ${previousPengujiCount + 1}`;
        }
        
        // Cari e-signature untuk dosen ini
        let signatureImage = '';
        
        // Untuk dosen pembimbing, gunakan signature yang tersedia
        if (dosenData.jabatan === 'pembimbing') {
          // Prioritas: gunakan signature dari beritaAcara.dosenSignature (hasil approve)
          if (beritaAcara.dosenSignature?.signatureImage) {
            signatureImage = `<img src="${beritaAcara.dosenSignature.signatureImage}" alt="Signature" style="max-width: 120px; max-height: 60px; display: block; margin: 5px auto;"/>`;
          } 
          // Jika belum ada, gunakan dari profil dosen (localStorage)
          else if (dosenESignature?.signatureImage) {
            signatureImage = `<img src="${dosenESignature.signatureImage}" alt="Signature" style="max-width: 120px; max-height: 60px; display: block; margin: 5px auto;"/>`;
          }
        }
        // Untuk penguji lain, kosongkan dulu (akan diisi setelah mereka approve)
        // Di masa depan bisa ditambahkan logic untuk load signature penguji dari database
        
        return `
    <tr>
      <td style="border: 1px solid black; padding: 8px; text-align: center;">${displayNumber}</td>
      <td style="border: 1px solid black; padding: 8px;">${dosenData.nama}</td>
      <td style="border: 1px solid black; padding: 8px; text-align: center;">${displayStatus}</td>
      <td style="border: 1px solid black; padding: 8px; text-align: center; min-height: 80px;">
        ${signatureImage || '<div style="height: 60px;"></div>'}
      </td>
    </tr>
  `;
      }
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
      <span class="field-label">Dosen Pembimbing</span> : ${beritaAcara.dosenSignature?.nama || finalDosenList.find(d => d.jabatan === "pembimbing")?.nama || "-"}
    </div>
    <div class="field">
      <span class="field-label">NIP Pembimbing</span> : ${beritaAcara.dosenSignature?.nip || finalDosenList.find(d => d.jabatan === "pembimbing")?.nip || "-"}
    </div>
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
            : (dosenESignature?.signatureImage 
                ? `<img src="${dosenESignature.signatureImage}" alt="Signature" style="max-width: 200px; max-height: 100px; margin-bottom: 5px;"/>`
                : '<div class="signature-line"></div>')
        }
        <p style="margin-top: ${beritaAcara.dosenSignature?.signatureImage || dosenESignature?.signatureImage ? '5px' : '10px'};">
          <strong>${beritaAcara.dosenSignature?.nama || finalDosenList.find(d => d.jabatan === "pembimbing")?.nama || "-"}</strong><br>
          NIP: ${beritaAcara.dosenSignature?.nip || finalDosenList.find(d => d.jabatan === "pembimbing")?.nip || "-"}
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
  mahasiswa: MahasiswaData
) => {
  const html = generateBeritaAcaraHTML(beritaAcara, mahasiswa);
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
