// Type declaration for html2pdf library loaded from CDN
declare global {
  interface Window {
    html2pdf: any;
  }
  const html2pdf: any;
}

// Utility untuk generate Form Nilai KP PDF menggunakan jsPDF
// Data untuk form nilai
export interface NilaiKPData {
  // Data Mahasiswa
  namaMahasiswa: string;
  nim: string;
  programStudi: string;
  tempatKP: string;
  judulLaporan: string;
  
  // Data KP
  waktuPelaksanaan: string;
  dosenPembimbing: string;
  pembimbingLapangan: string;
  
  // Nilai
  kesesuaianLaporan: number; // 30%
  penguasaanMateri: number;  // 30%
  analisisPerancangan: number; // 30%
  sikapEtika: number; // 10%
  
  // Metadata
  tanggalPenilaian: string;
  dosenPenguji: string;
  nipDosen: string;
  eSignatureUrl?: string; // URL e-signature dari profil dosen
}

export function generateFormNilaiPDF(data: NilaiKPData) {
  // Hitung bobot nilai
  const bobotKesesuaian = (data.kesesuaianLaporan * 30) / 100;
  const bobotPenguasaan = (data.penguasaanMateri * 30) / 100;
  const bobotAnalisis = (data.analisisPerancangan * 30) / 100;
  const bobotSikap = (data.sikapEtika * 10) / 100;
  
  const nilaiAkhir = bobotKesesuaian + bobotPenguasaan + bobotAnalisis + bobotSikap;
  
  // Konversi nilai huruf
  let nilaiHuruf = '';
  if (nilaiAkhir >= 85) nilaiHuruf = 'A';
  else if (nilaiAkhir >= 80) nilaiHuruf = 'A-';
  else if (nilaiAkhir >= 75) nilaiHuruf = 'B+';
  else if (nilaiAkhir >= 70) nilaiHuruf = 'B';
  else if (nilaiAkhir >= 65) nilaiHuruf = 'B-';
  else if (nilaiAkhir >= 60) nilaiHuruf = 'C+';
  else if (nilaiAkhir >= 55) nilaiHuruf = 'C';
  else if (nilaiAkhir >= 50) nilaiHuruf = 'D';
  else nilaiHuruf = 'E';
  
  // Create HTML content for PDF
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Form Nilai KP - ${data.namaMahasiswa}</title>
  <style>
    /* Reset all CSS to avoid inheritance issues */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      border: 0;
      font-size: 100%;
      font: inherit;
      vertical-align: baseline;
      background: transparent;
      color: inherit;
    }
    
    @page {
      size: A4;
      margin: 2cm;
    }
    
    @media print {
      @page {
        size: A4;
        margin: 2cm 2cm 2cm 2cm;
      }
      
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      html {
        margin: 0 !important;
        padding: 0 !important;
      }
      
      /* Force hide browser's default header and footer */
      @page {
        margin-top: 2cm;
        margin-bottom: 2cm;
        margin-left: 2cm;
        margin-right: 2cm;
      }
    }
    
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #000000;
      background-color: #ffffff;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background-color: #ffffff;
      color: #000000;
    }
    
    h1 {
      text-align: center;
      font-size: 14pt;
      font-weight: bold;
      margin-bottom: 30px;
      text-decoration: underline;
    }
    
    .info-section {
      margin-bottom: 20px;
    }
    
    .info-row {
      display: flex;
      margin-bottom: 8px;
    }
    
    .info-label {
      width: 200px;
      flex-shrink: 0;
    }
    
    .info-separator {
      width: 20px;
      text-align: center;
      flex-shrink: 0;
    }
    
    .info-value {
      flex: 1;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    
    table, th, td {
      border: 1px solid #000;
    }
    
    th, td {
      padding: 8px;
      text-align: left;
    }
    
    th {
      background-color: #f0f0f0 !important;
      color: #000000 !important;
      font-weight: bold;
      text-align: center;
    }
    
    td {
      background-color: #ffffff !important;
      color: #000000 !important;
    }
    
    td:nth-child(1) {
      width: 50px;
      text-align: center;
    }
    
    td:nth-child(2) {
      width: 300px;
    }
    
    td:nth-child(3), td:nth-child(4), td:nth-child(5) {
      width: 80px;
      text-align: center;
    }
    
    .signature-section {
      margin-top: 50px;
      text-align: right;
    }
    
    .signature-box {
      display: inline-block;
      text-align: center;
      min-width: 250px;
    }
    
    .signature-line {
      margin-top: 80px;
      border-top: 1px solid #000;
      padding-top: 5px;
    }
    
    .signature-image {
      max-width: 150px;
      max-height: 60px;
      margin: 10px auto;
      display: block;
    }
    
    .signature-space {
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  </style>
  <script>
    // Remove browser's default header and footer when printing
    window.onload = function() {
      if (window.matchMedia) {
        var mediaQueryList = window.matchMedia('print');
        mediaQueryList.addListener(function(mql) {
          if (mql.matches) {
            // before print
          } else {
            // after print
          }
        });
      }
    }
  </script>
</head>
<body>
  <div class="container">
    <h1>FORM NILAI KERJA PRAKTEK (KP)</h1>
    
    <div class="info-section">
      <div class="info-row">
        <div class="info-label">Nama Mahasiswa</div>
        <div class="info-separator">:</div>
        <div class="info-value">${data.namaMahasiswa}</div>
      </div>
      <div class="info-row">
        <div class="info-label">NIM</div>
        <div class="info-separator">:</div>
        <div class="info-value">${data.nim}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Program Studi</div>
        <div class="info-separator">:</div>
        <div class="info-value">${data.programStudi}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Tempat KP</div>
        <div class="info-separator">:</div>
        <div class="info-value">${data.tempatKP}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Judul Laporan KP</div>
        <div class="info-separator">:</div>
        <div class="info-value">${data.judulLaporan}</div>
      </div>
    </div>
    
    <div class="info-section">
      <div class="info-row">
        <div class="info-label">Waktu Pelaksanaan KP</div>
        <div class="info-separator">:</div>
        <div class="info-value">${data.waktuPelaksanaan}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Dosen Pembimbing</div>
        <div class="info-separator">:</div>
        <div class="info-value">${data.dosenPembimbing}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Pembimbing Lapangan</div>
        <div class="info-separator">:</div>
        <div class="info-value">${data.pembimbingLapangan}</div>
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>No.</th>
          <th>Penilaian</th>
          <th>Bobot(B)</th>
          <th>Nilai(N)</th>
          <th>BxN</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1.</td>
          <td>Kesesuaian Laporan dengan Format</td>
          <td>30 %</td>
          <td>${data.kesesuaianLaporan}</td>
          <td>${bobotKesesuaian.toFixed(2)}</td>
        </tr>
        <tr>
          <td>2.</td>
          <td>Penguasaan Materi KP</td>
          <td>30 %</td>
          <td>${data.penguasaanMateri}</td>
          <td>${bobotPenguasaan.toFixed(2)}</td>
        </tr>
        <tr>
          <td>3.</td>
          <td>Analisis dan Perancangan</td>
          <td>30 %</td>
          <td>${data.analisisPerancangan}</td>
          <td>${bobotAnalisis.toFixed(2)}</td>
        </tr>
        <tr>
          <td>3.</td>
          <td>Sikap dan Etika</td>
          <td>10 %</td>
          <td>${data.sikapEtika}</td>
          <td>${bobotSikap.toFixed(2)}</td>
        </tr>
        <tr>
          <td colspan="4" style="text-align: center; font-weight: bold;">Rata-rata</td>
          <td style="font-weight: bold;">${nilaiAkhir.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
    
    <div style="margin-top: 20px;">
      <strong>Nilai Akhir: ${nilaiAkhir.toFixed(2)} (${nilaiHuruf})</strong>
    </div>
    
    <div class="signature-section">
      <div class="signature-box">
        <div>Palembang, ${data.tanggalPenilaian}</div>
        <div>Dosen Penguji,</div>
        ${data.eSignatureUrl ? `
        <div class="signature-space">
          <img src="${data.eSignatureUrl}" alt="E-Signature" class="signature-image" />
        </div>
        <div style="border-top: 1px solid #000; padding-top: 5px;">
          <div>${data.dosenPenguji}</div>
          <div>NIP. ${data.nipDosen}</div>
        </div>
        ` : `
        <div class="signature-line">
          <div>${data.dosenPenguji}</div>
          <div>NIP. ${data.nipDosen}</div>
        </div>
        `}
      </div>
    </div>
  </div>
</body>
</html>
  `;
  
  return htmlContent;
}

// Function to download as HTML (can be printed to PDF)
export function downloadFormNilaiHTML(data: NilaiKPData) {
  const htmlContent = generateFormNilaiPDF(data);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Form_Nilai_KP_${data.namaMahasiswa.replace(/\s+/g, '_')}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Helper function to convert oklch and other modern colors to rgb
function convertModernColorsToRGB(element: HTMLElement) {
  // Get all elements including the root
  const allElements = [element, ...Array.from(element.querySelectorAll('*'))];
  
  allElements.forEach((el) => {
    if (el instanceof HTMLElement) {
      const computedStyle = window.getComputedStyle(el);
      
      // List of all color-related properties
      const colorProps = [
        'color', 
        'backgroundColor', 
        'borderColor', 
        'borderTopColor', 
        'borderRightColor', 
        'borderBottomColor', 
        'borderLeftColor',
        'outlineColor',
        'textDecorationColor',
        'fill',
        'stroke'
      ];
      
      colorProps.forEach(prop => {
        const value = computedStyle.getPropertyValue(prop);
        if (value && value.trim() && value !== 'none' && value !== 'transparent') {
          // Get the computed color value (browser will convert oklch to rgb automatically)
          const computedColor = computedStyle[prop as any];
          if (computedColor) {
            // Set it explicitly as inline style to override any oklch
            el.style.setProperty(prop, computedColor, 'important');
          }
        }
      });
      
      // Also remove any CSS variables that might contain oklch
      el.style.cssText = el.style.cssText.replace(/oklch\([^)]+\)/g, 'rgb(0, 0, 0)');
    }
  });
}

// Function to open in new window for printing
export function printFormNilai(data: NilaiKPData) {
  console.log('printFormNilai called with data:', data);
  
  // Validate data first
  if (!data.namaMahasiswa || !data.nim) {
    alert('Data mahasiswa tidak lengkap. Pastikan dosen sudah memberikan nilai.');
    return;
  }
  
  const htmlContent = generateFormNilaiPDF(data);
  console.log('HTML content generated, length:', htmlContent.length);
  
  // Use simple window.print approach - more reliable
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    console.log('Opening print window...');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    printWindow.onload = () => {
      console.log('Print window loaded');
      printWindow.focus();
      
      // Add small delay to ensure content is fully rendered
      setTimeout(() => {
        console.log('Triggering print dialog...');
        printWindow.print();
        
        // Close window after print dialog closes
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      }, 500);
    };
  } else {
    console.error('Failed to open print window. Pop-up might be blocked.');
    alert('Gagal membuka jendela print. Pastikan pop-up tidak diblokir oleh browser.');
  }
}