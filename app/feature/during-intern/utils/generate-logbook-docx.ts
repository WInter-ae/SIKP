// Simplified interfaces for DOCX generation - only includes needed properties
interface StudentData {
  name: string;
  nim: string;
  prodi: string;
  fakultas?: string;
}

interface InternshipInfo {
  company: string;
  division?: string;
  position: string;
  mentorName?: string;
  startDate?: string;
  endDate?: string;
}

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

interface WorkPeriod {
  startDate: string;
  endDate: string;
  startDay?: string;
  endDay?: string;
}

interface LogbookData {
  student: StudentData | null;
  internship: InternshipInfo | null;
  workPeriod: WorkPeriod;
  generatedDates: string[];
  entries: LogbookEntry[];
}

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

export const generateLogbookDOCX = async (data: LogbookData) => {
  // Dynamic import untuk menghindari SSR issues
  const [PizZip, { saveAs }] = await Promise.all([
    import("pizzip").then(m => m.default),
    import("file-saver")
  ]);

  try {
    // Buat template DOCX
    const template = createLogbookDocxTemplate(data, PizZip);
    
    const zip = new PizZip(template);
    
    const blob = zip.generate({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    const fileName = data.student?.nim 
      ? `LogBook_KP_${data.student.nim}_${new Date().toISOString().split('T')[0]}.docx`
      : `LogBook_KP_${new Date().toISOString().split('T')[0]}.docx`;

    saveAs(blob, fileName);
  } catch (error) {
    console.error("Error generating DOCX:", error);
    throw error;
  }
};

function createLogbookDocxTemplate(data: LogbookData, PizZip: any): ArrayBuffer {
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
  let tableRows = '';
  data.generatedDates.forEach((date, index) => {
    const entry = getEntryForDate(date, data.entries);
    const weekNum = getWeekNumber(date, data.workPeriod.startDate);
    const prevWeekNum = index > 0 ? getWeekNumber(data.generatedDates[index - 1], data.workPeriod.startDate) : 0;
    const showWeekNumber = weekNum !== prevWeekNum;

    if (showWeekNumber) {
      tableRows += `
    <w:tr>
      <w:trPr>
        <w:trHeight w:val="600"/>
      </w:trPr>
      <w:tc>
        <w:tcPr>
          <w:tcW w:w="800" w:type="dxa"/>
          <w:vMerge w:val="restart"/>
          <w:tcBorders>
            <w:top w:val="single" w:sz="8" w:color="000000"/>
            <w:left w:val="single" w:sz="8" w:color="000000"/>
            <w:bottom w:val="single" w:sz="8" w:color="000000"/>
            <w:right w:val="single" w:sz="8" w:color="000000"/>
          </w:tcBorders>
          <w:vAlign w:val="center"/>
        </w:tcPr>
        <w:p>
          <w:pPr>
            <w:jc w:val="center"/>
            <w:spacing w:line="240" w:lineRule="auto"/>
          </w:pPr>
          <w:r><w:rPr><w:b/><w:sz w:val="24"/></w:rPr><w:t>${weekNum}</w:t></w:r>
        </w:p>
      </w:tc>
      <w:tc>
        <w:tcPr>
          <w:tcW w:w="1500" w:type="dxa"/>
          <w:tcBorders>
            <w:top w:val="single" w:sz="8" w:color="000000"/>
            <w:left w:val="single" w:sz="8" w:color="000000"/>
            <w:bottom w:val="single" w:sz="8" w:color="000000"/>
            <w:right w:val="single" w:sz="8" w:color="000000"/>
          </w:tcBorders>
          <w:vAlign w:val="center"/>
        </w:tcPr>
        <w:p>
          <w:pPr>
            <w:jc w:val="center"/>
            <w:spacing w:line="240" w:lineRule="auto"/>
          </w:pPr>
          <w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>${formatDate(date)}</w:t></w:r>
        </w:p>
      </w:tc>
      <w:tc>
        <w:tcPr>
          <w:tcW w:w="5000" w:type="dxa"/>
          <w:tcBorders>
            <w:top w:val="single" w:sz="8" w:color="000000"/>
            <w:left w:val="single" w:sz="8" w:color="000000"/>
            <w:bottom w:val="single" w:sz="8" w:color="000000"/>
            <w:right w:val="single" w:sz="8" w:color="000000"/>
          </w:tcBorders>
          <w:vAlign w:val="top"/>
        </w:tcPr>
        <w:p>
          <w:pPr><w:spacing w:line="240" w:lineRule="auto"/></w:pPr>
          <w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>${entry?.description || ''}</w:t></w:r>
        </w:p>
      </w:tc>
      <w:tc>
        <w:tcPr>
          <w:tcW w:w="1700" w:type="dxa"/>
          <w:tcBorders>
            <w:top w:val="single" w:sz="8" w:color="000000"/>
            <w:left w:val="single" w:sz="8" w:color="000000"/>
            <w:bottom w:val="single" w:sz="8" w:color="000000"/>
            <w:right w:val="single" w:sz="8" w:color="000000"/>
          </w:tcBorders>
          <w:vAlign w:val="center"/>
        </w:tcPr>
        <w:p>
          <w:pPr>
            <w:jc w:val="center"/>
            <w:spacing w:line="240" w:lineRule="auto"/>
          </w:pPr>
          <w:r><w:t></w:t></w:r>
        </w:p>
      </w:tc>
    </w:tr>`;
    } else {
      tableRows += `
    <w:tr>
      <w:trPr>
        <w:trHeight w:val="600"/>
      </w:trPr>
      <w:tc>
        <w:tcPr>
          <w:tcW w:w="800" w:type="dxa"/>
          <w:vMerge/>
          <w:tcBorders>
            <w:top w:val="single" w:sz="8" w:color="000000"/>
            <w:left w:val="single" w:sz="8" w:color="000000"/>
            <w:bottom w:val="single" w:sz="8" w:color="000000"/>
            <w:right w:val="single" w:sz="8" w:color="000000"/>
          </w:tcBorders>
          <w:vAlign w:val="center"/>
        </w:tcPr>
        <w:p><w:r><w:t></w:t></w:r></w:p>
      </w:tc>
      <w:tc>
        <w:tcPr>
          <w:tcW w:w="1500" w:type="dxa"/>
          <w:tcBorders>
            <w:top w:val="single" w:sz="8" w:color="000000"/>
            <w:left w:val="single" w:sz="8" w:color="000000"/>
            <w:bottom w:val="single" w:sz="8" w:color="000000"/>
            <w:right w:val="single" w:sz="8" w:color="000000"/>
          </w:tcBorders>
          <w:vAlign w:val="center"/>
        </w:tcPr>
        <w:p>
          <w:pPr>
            <w:jc w:val="center"/>
            <w:spacing w:line="240" w:lineRule="auto"/>
          </w:pPr>
          <w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>${formatDate(date)}</w:t></w:r>
        </w:p>
      </w:tc>
      <w:tc>
        <w:tcPr>
          <w:tcW w:w="5000" w:type="dxa"/>
          <w:tcBorders>
            <w:top w:val="single" w:sz="8" w:color="000000"/>
            <w:left w:val="single" w:sz="8" w:color="000000"/>
            <w:bottom w:val="single" w:sz="8" w:color="000000"/>
            <w:right w:val="single" w:sz="8" w:color="000000"/>
          </w:tcBorders>
          <w:vAlign w:val="top"/>
        </w:tcPr>
        <w:p>
          <w:pPr><w:spacing w:line="240" w:lineRule="auto"/></w:pPr>
          <w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>${entry?.description || ''}</w:t></w:r>
        </w:p>
      </w:tc>
      <w:tc>
        <w:tcPr>
          <w:tcW w:w="1700" w:type="dxa"/>
          <w:tcBorders>
            <w:top w:val="single" w:sz="8" w:color="000000"/>
            <w:left w:val="single" w:sz="8" w:color="000000"/>
            <w:bottom w:val="single" w:sz="8" w:color="000000"/>
            <w:right w:val="single" w:sz="8" w:color="000000"/>
          </w:tcBorders>
          <w:vAlign w:val="center"/>
        </w:tcPr>
        <w:p>
          <w:pPr>
            <w:jc w:val="center"/>
            <w:spacing w:line="240" w:lineRule="auto"/>
          </w:pPr>
          <w:r><w:t></w:t></w:r>
        </w:p>
      </w:tc>
    </w:tr>`;
    }
  });

  // Default values jika data kosong
  const studentName = data.student?.name || '';
  const studentNim = data.student?.nim || '';
  const studentProdi = data.student?.prodi || '';
  const companyName = data.internship?.company || '';
  const position = data.internship?.position || '';

  const docxContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <!-- Header with Title -->
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:spacing w:before="240" w:after="360"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="32"/>
        </w:rPr>
        <w:t>FORMULIR KEGIATAN HARIAN MAHASISWA</w:t>
      </w:r>
    </w:p>

    <!-- Student Info List -->
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="9000" w:type="dxa"/>
        <w:jc w:val="left"/>
        <w:tblInd w:w="2160" w:type="dxa"/>
        <w:tblBorders>
          <w:top w:val="none"/>
          <w:left w:val="none"/>
          <w:bottom w:val="none"/>
          <w:right w:val="none"/>
          <w:insideH w:val="none"/>
          <w:insideV w:val="none"/>
        </w:tblBorders>
        <w:tblCellMar>
          <w:top w:w="0" w:type="dxa"/>
          <w:left w:w="100" w:type="dxa"/>
          <w:bottom w:w="60" w:type="dxa"/>
          <w:right w:w="100" w:type="dxa"/>
        </w:tblCellMar>
      </w:tblPr>
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="2400" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:pPr><w:spacing w:line="240" w:lineRule="auto"/></w:pPr>
            <w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>Nama</w:t></w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="6600" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:pPr><w:spacing w:line="240" w:lineRule="auto"/></w:pPr>
            <w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>: ${studentName}</w:t></w:r>
          </w:p>
        </w:tc>
      </w:tr>
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="2400" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:pPr><w:spacing w:line="240" w:lineRule="auto"/></w:pPr>
            <w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>NIM</w:t></w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="6600" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:pPr><w:spacing w:line="240" w:lineRule="auto"/></w:pPr>
            <w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>: ${studentNim}</w:t></w:r>
          </w:p>
        </w:tc>
      </w:tr>
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="2400" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:pPr><w:spacing w:line="240" w:lineRule="auto"/></w:pPr>
            <w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>Program Studi</w:t></w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="6600" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:pPr><w:spacing w:line="240" w:lineRule="auto"/></w:pPr>
            <w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>: ${studentProdi}</w:t></w:r>
          </w:p>
        </w:tc>
      </w:tr>
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="2400" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:pPr><w:spacing w:line="240" w:lineRule="auto"/></w:pPr>
            <w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>Tempat KP</w:t></w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="6600" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:pPr><w:spacing w:line="240" w:lineRule="auto"/></w:pPr>
            <w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>: ${companyName}</w:t></w:r>
          </w:p>
        </w:tc>
      </w:tr>
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="2400" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:pPr><w:spacing w:line="240" w:lineRule="auto"/></w:pPr>
            <w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>Bagian/Bidang</w:t></w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="6600" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:pPr><w:spacing w:line="240" w:lineRule="auto"/></w:pPr>
            <w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>: ${position}</w:t></w:r>
          </w:p>
        </w:tc>
      </w:tr>
    </w:tbl>

    <w:p>
      <w:pPr><w:spacing w:before="240" w:after="120"/></w:pPr>
    </w:p>

    <!-- Logbook Table -->
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="9000" w:type="dxa"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="8" w:color="000000"/>
          <w:left w:val="single" w:sz="8" w:color="000000"/>
          <w:bottom w:val="single" w:sz="8" w:color="000000"/>
          <w:right w:val="single" w:sz="8" w:color="000000"/>
          <w:insideH w:val="single" w:sz="8" w:color="000000"/>
          <w:insideV w:val="single" w:sz="8" w:color="000000"/>
        </w:tblBorders>
        <w:tblCellMar>
          <w:top w:w="60" w:type="dxa"/>
          <w:left w:w="80" w:type="dxa"/>
          <w:bottom w:w="60" w:type="dxa"/>
          <w:right w:w="80" w:type="dxa"/>
        </w:tblCellMar>
      </w:tblPr>
      
      <!-- Header Row -->
      <w:tr>
        <w:trPr>
          <w:trHeight w:val="600"/>
        </w:trPr>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="800" w:type="dxa"/>
            <w:tcBorders>
              <w:top w:val="single" w:sz="8" w:color="000000"/>
              <w:left w:val="single" w:sz="8" w:color="000000"/>
              <w:bottom w:val="single" w:sz="8" w:color="000000"/>
              <w:right w:val="single" w:sz="8" w:color="000000"/>
            </w:tcBorders>
            <w:vAlign w:val="center"/>
          </w:tcPr>
          <w:p>
            <w:pPr>
              <w:jc w:val="center"/>
              <w:spacing w:line="240" w:lineRule="auto"/>
            </w:pPr>
            <w:r><w:rPr><w:b/><w:sz w:val="24"/></w:rPr><w:t>Minggu Ke</w:t></w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="1500" w:type="dxa"/>
            <w:tcBorders>
              <w:top w:val="single" w:sz="8" w:color="000000"/>
              <w:left w:val="single" w:sz="8" w:color="000000"/>
              <w:bottom w:val="single" w:sz="8" w:color="000000"/>
              <w:right w:val="single" w:sz="8" w:color="000000"/>
            </w:tcBorders>
            <w:vAlign w:val="center"/>
          </w:tcPr>
          <w:p>
            <w:pPr>
              <w:jc w:val="center"/>
              <w:spacing w:line="240" w:lineRule="auto"/>
            </w:pPr>
            <w:r><w:rPr><w:b/><w:sz w:val="24"/></w:rPr><w:t>Tanggal</w:t></w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="5000" w:type="dxa"/>
            <w:tcBorders>
              <w:top w:val="single" w:sz="8" w:color="000000"/>
              <w:left w:val="single" w:sz="8" w:color="000000"/>
              <w:bottom w:val="single" w:sz="8" w:color="000000"/>
              <w:right w:val="single" w:sz="8" w:color="000000"/>
            </w:tcBorders>
            <w:vAlign w:val="center"/>
          </w:tcPr>
          <w:p>
            <w:pPr>
              <w:jc w:val="center"/>
              <w:spacing w:line="240" w:lineRule="auto"/>
            </w:pPr>
            <w:r><w:rPr><w:b/><w:sz w:val="24"/></w:rPr><w:t>Jenis Kegiatan</w:t></w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="1700" w:type="dxa"/>
            <w:tcBorders>
              <w:top w:val="single" w:sz="8" w:color="000000"/>
              <w:left w:val="single" w:sz="8" w:color="000000"/>
              <w:bottom w:val="single" w:sz="8" w:color="000000"/>
              <w:right w:val="single" w:sz="8" w:color="000000"/>
            </w:tcBorders>
            <w:vAlign w:val="center"/>
          </w:tcPr>
          <w:p>
            <w:pPr>
              <w:jc w:val="center"/>
              <w:spacing w:line="240" w:lineRule="auto"/>
            </w:pPr>
            <w:r><w:rPr><w:b/><w:sz w:val="24"/></w:rPr><w:t>Paraf Pembimbing Lapangan</w:t></w:r>
          </w:p>
        </w:tc>
      </w:tr>

      <!-- Data Rows -->
      ${tableRows}
    </w:tbl>

    <!-- Spacing before footer -->
    <w:p>
      <w:pPr><w:spacing w:before="480" w:after="120"/></w:pPr>
    </w:p>

    <!-- Footer with signature -->
    <w:p>
      <w:pPr>
        <w:jc w:val="right"/>
        <w:spacing w:before="0" w:after="120"/>
      </w:pPr>
      <w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>Palembang, ${new Date(data.workPeriod.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:jc w:val="right"/>
        <w:spacing w:before="0" w:after="1200"/>
      </w:pPr>
      <w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>Pembimbing Lapangan,</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:jc w:val="right"/>
        <w:spacing w:before="0" w:after="0"/>
      </w:pPr>
      <w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>Nama</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:jc w:val="right"/>
        <w:spacing w:before="0" w:after="60"/>
      </w:pPr>
      <w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>Jabatan</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;

  // Create minimal DOCX structure
  const zip = new PizZip();
  
  // [Content_Types].xml
  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);

  // _rels/.rels
  zip.folder("_rels")?.file(".rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

  // word/document.xml
  zip.folder("word")?.file("document.xml", docxContent);

  // word/_rels/document.xml.rels
  zip.folder("word")?.folder("_rels")?.file("document.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`);

  return zip.generate({ type: "arraybuffer" });
}
