interface LogbookEntry {
  id: string;
  date: string;
  description: string;
  mentorSignature?: {
    status: "approved" | "revision" | "rejected";
    signedAt: string;
    mentorName: string;
    notes?: string;
  };
}

interface StudentData {
  name: string;
  nim: string;
  prodi: string;
  fakultas?: string;
}

interface InternshipData {
  company: string;
  division?: string;
  position?: string;
  mentorName?: string;
  startDate: string;
  endDate: string;
}

interface WorkPeriod {
  startDate: string;
  endDate: string;
  startDay?: string;
  endDay?: string;
}

interface LogbookData {
  student: StudentData;
  internship: InternshipData;
  workPeriod: WorkPeriod;
  generatedDates: string[];
  entries: LogbookEntry[];
}

const getDayName = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", { weekday: "long" });
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getWeekNumber = (dateString: string, startDate: string): number => {
  const date = new Date(dateString);
  const start = new Date(startDate);
  const diffTime = date.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.ceil((diffDays + 1) / 7);
};

const getEntryForDate = (date: string, entries: LogbookEntry[]): LogbookEntry | undefined => {
  return entries.find(entry => entry.date === date);
};

const getStatusText = (entry: LogbookEntry | undefined): string => {
  if (!entry) return "Belum diisi";
  if (!entry.mentorSignature) return "Menunggu Paraf";
  
  switch (entry.mentorSignature.status) {
    case "approved":
      return "✓ Disetujui";
    case "revision":
      return "⚠ Perlu Revisi";
    case "rejected":
      return "✗ Ditolak";
    default:
      return "Menunggu Paraf";
  }
};

export const generateLogbookHTML = (data: LogbookData): string => {
  // Group dates by week
  const weekGroups: { [key: number]: string[] } = {};
  data.generatedDates.forEach(date => {
    const weekNum = getWeekNumber(date, data.workPeriod.startDate);
    if (!weekGroups[weekNum]) {
      weekGroups[weekNum] = [];
    }
    weekGroups[weekNum].push(date);
  });

  // Generate table rows
  const tableRows = data.generatedDates.map((date, index) => {
    const entry = getEntryForDate(date, data.entries);
    const weekNum = getWeekNumber(date, data.workPeriod.startDate);
    const prevWeekNum = index > 0 ? getWeekNumber(data.generatedDates[index - 1], data.workPeriod.startDate) : 0;
    const showWeekNumber = weekNum !== prevWeekNum;
    const weekRowSpan = weekGroups[weekNum]?.length || 1;

    return `
    <tr>
      ${showWeekNumber ? `<td rowspan="${weekRowSpan}" style="border: 1px solid black; padding: 8px; text-align: center; font-weight: bold;">${weekNum}</td>` : ''}
      <td style="border: 1px solid black; padding: 8px;">
        <div style="font-weight: 500;">${getDayName(date)}</div>
        <div style="font-size: 0.9em; color: #666;">${formatDate(date)}</div>
      </td>
      <td style="border: 1px solid black; padding: 8px;">
        ${entry?.description || '<em style="color: #999;">Belum diisi</em>'}
      </td>
      <td style="border: 1px solid black; padding: 8px; text-align: center;">
        <div style="font-weight: 500; margin-bottom: 4px;">${getStatusText(entry)}</div>
        ${entry?.mentorSignature?.signedAt ? `<div style="font-size: 0.85em; color: #666;">Ditandatangani: ${formatDate(entry.mentorSignature.signedAt)}</div>` : ''}
        ${entry?.mentorSignature?.notes ? `<div style="font-size: 0.85em; color: #666; margin-top: 4px; font-style: italic;">${entry.mentorSignature.notes}</div>` : ''}
      </td>
    </tr>`;
  }).join('');

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
      .no-print {
        display: none;
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
      font-size: 18pt;
      font-weight: bold;
      margin-bottom: 20px;
      text-transform: uppercase;
    }
    h2 {
      font-size: 14pt;
      font-weight: bold;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .info-table td {
      padding: 5px;
      border: none;
    }
    .info-table td:first-child {
      width: 180px;
      font-weight: 500;
    }
    .info-table td:nth-child(2) {
      width: 20px;
      text-align: center;
    }
    .logbook-table th {
      background-color: #f0f0f0;
      font-weight: bold;
      text-align: center;
      border: 1px solid black;
      padding: 10px;
    }
    .logbook-table td {
      border: 1px solid black;
      padding: 8px;
    }
    .footer {
      margin-top: 40px;
      text-align: right;
    }
    .signature-section {
      margin-top: 50px;
      text-align: center;
    }
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 20px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
    .print-button:hover {
      background-color: #0056b3;
    }
  </style>
  <title>Logbook Kerja Praktik - ${data.student.name}</title>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">🖨️ Print / Save as PDF</button>

  <h1>Logbook Kerja Praktik</h1>

  <h2>Data Mahasiswa</h2>
  <table class="info-table">
    <tr>
      <td>Nama</td>
      <td>:</td>
      <td><strong>${data.student.name}</strong></td>
    </tr>
    <tr>
      <td>NIM</td>
      <td>:</td>
      <td><strong>${data.student.nim}</strong></td>
    </tr>
    <tr>
      <td>Program Studi</td>
      <td>:</td>
      <td>${data.student.prodi}</td>
    </tr>
    ${data.student.fakultas ? `
    <tr>
      <td>Fakultas</td>
      <td>:</td>
      <td>${data.student.fakultas}</td>
    </tr>
    ` : ''}
  </table>

  <h2>Data Tempat Kerja Praktik</h2>
  <table class="info-table">
    <tr>
      <td>Nama Perusahaan/Instansi</td>
      <td>:</td>
      <td><strong>${data.internship.company}</strong></td>
    </tr>
    ${data.internship.division ? `
    <tr>
      <td>Bagian/Divisi</td>
      <td>:</td>
      <td>${data.internship.division}</td>
    </tr>
    ` : ''}
    ${data.internship.position ? `
    <tr>
      <td>Posisi</td>
      <td>:</td>
      <td>${data.internship.position}</td>
    </tr>
    ` : ''}
    ${data.internship.mentorName ? `
    <tr>
      <td>Pembimbing Lapangan</td>
      <td>:</td>
      <td>${data.internship.mentorName}</td>
    </tr>
    ` : ''}
    <tr>
      <td>Periode Kerja Praktik</td>
      <td>:</td>
      <td>${formatDate(data.workPeriod.startDate)} s/d ${formatDate(data.workPeriod.endDate)}</td>
    </tr>
  </table>

  <h2>Daftar Kegiatan</h2>
  <table class="logbook-table">
    <thead>
      <tr>
        <th style="width: 80px;">Minggu Ke</th>
        <th style="width: 150px;">Hari, Tanggal</th>
        <th>Deskripsi Kegiatan</th>
        <th style="width: 150px;">Status Paraf</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>

  <div class="footer">
    <p>Dicetak pada: ${new Date().toLocaleDateString("id-ID", { 
      day: "numeric", 
      month: "long", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })}</p>
  </div>

  ${data.internship.mentorName ? `
  <div class="signature-section">
    <p>Mengetahui,</p>
    <p style="margin-top: 10px;">Pembimbing Lapangan</p>
    <div style="height: 80px;"></div>
    <p style="font-weight: bold; text-decoration: underline;">${data.internship.mentorName}</p>
  </div>
  ` : ''}
</body>
</html>
  `;
};

export const downloadLogbookHTML = (data: LogbookData) => {
  const htmlContent = generateLogbookHTML(data);
  
  // Create a Blob and download
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  // Open in new window for printing
  const printWindow = window.open(url, '_blank');
  
  if (printWindow) {
    printWindow.addEventListener('load', () => {
      // Auto-print after a short delay
      setTimeout(() => {
        printWindow.focus();
        // Note: window.print() can be called here if desired
      }, 500);
    });
  } else {
    // Fallback: direct download if popup blocked
    const link = document.createElement('a');
    link.href = url;
    link.download = `Logbook_KP_${data.student.nim}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
