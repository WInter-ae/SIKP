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
  mentorSignature?: string; // ← NEW: Base64 signature image from backend
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

export interface LogbookData {
  student: StudentData | null;
  internship: InternshipInfo | null;
  workPeriod: WorkPeriod;
  generatedDates: string[];
  entries: LogbookEntry[];
}

export const getLogbookDocxFileName = (): string =>
  `FORMULIR KEGIATAN HARIAN MAHASISWA_${new Date().toISOString().split("T")[0]}.docx`;

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

const getEntryForDate = (
  date: string,
  entries: LogbookEntry[],
): LogbookEntry | undefined => {
  return entries.find((entry) => entry.date === date);
};

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

type PizZipLike = {
  file: (
    path: string,
    content: string,
    options?: {
      base64?: boolean;
    },
  ) => void;
  folder: (path: string) => PizZipLike | null;
  generate: (
    options:
      | { type: "arraybuffer" }
      | {
          type: "blob";
          mimeType: string;
        },
  ) => ArrayBuffer | Blob;
};

type PizZipCtor = new (data?: ArrayBuffer) => PizZipLike;

const parseSignatureDataUri = (
  signature?: string,
): {
  base64: string;
  extension: "png" | "jpg" | "jpeg";
  contentType: string;
} | null => {
  if (!signature) return null;

  const trimmed = signature.trim();
  const match = trimmed.match(/^data:image\/(png|jpe?g);base64,(.+)$/i);
  if (!match) return null;

  const rawExt = match[1].toLowerCase();
  const extension =
    rawExt === "png" ? "png" : rawExt === "jpg" ? "jpg" : "jpeg";
  const contentType = extension === "png" ? "image/png" : "image/jpeg";

  return {
    base64: match[2],
    extension,
    contentType,
  };
};

export const createLogbookDOCXBlob = async (
  data: LogbookData,
): Promise<Blob> => {
  const PizZip = await import("pizzip").then((m) => m.default as PizZipCtor);

  try {
    const template = createLogbookDocxTemplate(data, PizZip);
    const zip = new PizZip(template);

    const blob = zip.generate({
      type: "blob",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }) as Blob;

    return blob;
  } catch (error) {
    console.error("Error generating DOCX blob:", error);
    throw error;
  }
};

export const generateLogbookDOCX = async (data: LogbookData) => {
  const [{ saveAs }, blob] = await Promise.all([
    import("file-saver"),
    createLogbookDOCXBlob(data),
  ]);

  try {
    const fileName = getLogbookDocxFileName();

    saveAs(blob, fileName);
  } catch (error) {
    console.error("Error generating DOCX:", error);
    throw error;
  }
};

export const convertLogbookDOCXBlobToHtml = async (
  blob: Blob,
): Promise<string> => {
  const mammothModule = await import("mammoth/mammoth.browser");
  const mammoth = mammothModule.default ?? mammothModule;
  const arrayBuffer = await blob.arrayBuffer();

  const result = await mammoth.convertToHtml({ arrayBuffer });
  return result.value as string;
};

function createLogbookDocxTemplate(
  data: LogbookData,
  PizZip: PizZipCtor,
): ArrayBuffer {
  const mentorSignatureImage = parseSignatureDataUri(
    data.internship?.mentorSignature,
  );

  // Generate table rows
  let tableRows = "";
  data.generatedDates.forEach((date, index) => {
    const entry = getEntryForDate(date, data.entries);
    const weekNum = getWeekNumber(date, data.workPeriod.startDate);
    const prevWeekNum =
      index > 0
        ? getWeekNumber(
            data.generatedDates[index - 1],
            data.workPeriod.startDate,
          )
        : 0;
    const showWeekNumber = weekNum !== prevWeekNum;
    const dateText = escapeXml(formatDate(date));
    const descriptionText = escapeXml(entry?.description || "");

    const parafCellContent =
      entry?.mentorSignature?.status === "approved" && mentorSignatureImage
        ? `<w:r>
          <w:drawing>
            <wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
              <wp:extent cx="952500" cy="714375"/>
              <wp:docPr id="${1000 + index}" name="ParafMentor${index}"/>
              <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
                <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                  <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                    <pic:nvPicPr>
                      <pic:cNvPr id="0" name="paraf-mentor"/>
                      <pic:cNvPicPr/>
                    </pic:nvPicPr>
                    <pic:blipFill>
                      <a:blip r:embed="rIdMentorSignature"/>
                      <a:stretch><a:fillRect/></a:stretch>
                    </pic:blipFill>
                    <pic:spPr>
                      <a:xfrm>
                        <a:off x="0" y="0"/>
                        <a:ext cx="952500" cy="714375"/>
                      </a:xfrm>
                      <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                    </pic:spPr>
                  </pic:pic>
                </a:graphicData>
              </a:graphic>
            </wp:inline>
          </w:drawing>
        </w:r>`
        : entry?.mentorSignature?.status === "revision"
          ? `<w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>REV</w:t></w:r>`
          : entry?.mentorSignature?.status === "rejected"
            ? `<w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>TOLAK</w:t></w:r>`
            : `<w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t></w:t></w:r>`;

    const weekCell = showWeekNumber
      ? `<w:tc>
        <w:tcPr>
          <w:tcW w:w="1300" w:type="dxa"/>
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
          <w:pPr><w:jc w:val="center"/><w:spacing w:line="240" w:lineRule="auto"/></w:pPr>
          <w:r><w:rPr><w:b/><w:sz w:val="24"/></w:rPr><w:t>${weekNum}</w:t></w:r>
        </w:p>
      </w:tc>`
      : `<w:tc>
        <w:tcPr>
          <w:tcW w:w="1300" w:type="dxa"/>
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
      </w:tc>`;

    tableRows += `
    <w:tr>
      <w:trPr>
        <w:trHeight w:val="600"/>
      </w:trPr>
      ${weekCell}
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
          <w:pPr><w:jc w:val="center"/><w:spacing w:line="240" w:lineRule="auto"/></w:pPr>
          <w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>${dateText}</w:t></w:r>
        </w:p>
      </w:tc>
      <w:tc>
        <w:tcPr>
          <w:tcW w:w="4600" w:type="dxa"/>
          <w:tcBorders>
            <w:top w:val="single" w:sz="8" w:color="000000"/>
            <w:left w:val="single" w:sz="8" w:color="000000"/>
            <w:bottom w:val="single" w:sz="8" w:color="000000"/>
            <w:right w:val="single" w:sz="8" w:color="000000"/>
          </w:tcBorders>
          <w:vAlign w:val="center"/>
        </w:tcPr>
        <w:p>
          <w:pPr><w:jc w:val="left"/><w:spacing w:line="240" w:lineRule="auto"/></w:pPr>
          <w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>${descriptionText}</w:t></w:r>
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
          <w:pPr><w:jc w:val="center"/><w:spacing w:line="240" w:lineRule="auto"/></w:pPr>
          ${parafCellContent}
        </w:p>
      </w:tc>
    </w:tr>`;
  });

  // Default values jika data kosong
  const studentName = escapeXml(data.student?.name || "");
  const studentNim = escapeXml(data.student?.nim || "");
  const studentProdi = escapeXml(data.student?.prodi || "");
  const companyName = escapeXml(data.internship?.company || "");
  const position = escapeXml(data.internship?.position || "");
  const mentorName = escapeXml(data.internship?.mentorName || "");
  const footerSignatureRun = mentorSignatureImage
    ? `<w:r>
      <w:drawing>
        <wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
          <wp:extent cx="1428750" cy="952500"/>
          <wp:docPr id="1" name="MentorSignature"/>
          <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
            <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
              <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:nvPicPr>
                  <pic:cNvPr id="0" name="mentor-signature"/>
                  <pic:cNvPicPr/>
                </pic:nvPicPr>
                <pic:blipFill>
                  <a:blip r:embed="rIdMentorSignature"/>
                  <a:stretch><a:fillRect/></a:stretch>
                </pic:blipFill>
                <pic:spPr>
                  <a:xfrm>
                    <a:off x="0" y="0"/>
                    <a:ext cx="1428750" cy="952500"/>
                  </a:xfrm>
                  <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                </pic:spPr>
              </pic:pic>
            </a:graphicData>
          </a:graphic>
        </wp:inline>
      </w:drawing>
    </w:r>`
    : `<w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t></w:t></w:r>`;

  const docxContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
            xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
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
        <w:tblW w:w="6000" w:type="dxa"/>
        <w:jc w:val="left"/>
        <w:tblInd w:w="2450" w:type="dxa"/>
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
            <w:tcW w:w="1800" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:pPr><w:spacing w:line="240" w:lineRule="auto"/></w:pPr>
            <w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>Nama</w:t></w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="4200" w:type="dxa"/>
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
            <w:tcW w:w="1800" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:pPr><w:spacing w:line="240" w:lineRule="auto"/></w:pPr>
            <w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>NIM</w:t></w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="4200" w:type="dxa"/>
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
            <w:tcW w:w="1800" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:pPr><w:spacing w:line="240" w:lineRule="auto"/></w:pPr>
            <w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>Program Studi</w:t></w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="4200" w:type="dxa"/>
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
            <w:tcW w:w="1800" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:pPr><w:spacing w:line="240" w:lineRule="auto"/></w:pPr>
            <w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>Tempat KP</w:t></w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="4200" w:type="dxa"/>
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
            <w:tcW w:w="1800" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:pPr><w:spacing w:line="240" w:lineRule="auto"/></w:pPr>
            <w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>Bagian/Bidang</w:t></w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="4200" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:pPr><w:spacing w:line="240" w:lineRule="auto"/></w:pPr>
            <w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>: ${position}</w:t></w:r>
          </w:p>
        </w:tc>
      </w:tr>
    </w:tbl>

    <w:p>
      <w:pPr><w:spacing w:before="120" w:after="100"/></w:pPr>
    </w:p>

    <!-- Logbook Table -->
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="9000" w:type="dxa"/>
        <w:jc w:val="center"/>
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
            <w:tcW w:w="1300" w:type="dxa"/>
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
            <w:r><w:rPr><w:b/><w:sz w:val="24"/></w:rPr><w:t>Minggu</w:t><w:br/><w:t>Ke</w:t></w:r>
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
            <w:tcW w:w="4600" w:type="dxa"/>
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
            <w:r><w:rPr><w:b/><w:sz w:val="24"/></w:rPr><w:t>Paraf</w:t><w:br/><w:t>Pembimbing</w:t><w:br/><w:t>Lapangan</w:t></w:r>
          </w:p>
        </w:tc>
      </w:tr>

      <!-- Data Rows -->
      ${tableRows}
    </w:tbl>

    <!-- Spacing before footer -->
    <w:p>
      <w:pPr><w:spacing w:before="120" w:after="40"/></w:pPr>
    </w:p>

    <!-- Footer with signature -->
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="3000" w:type="dxa"/>
        <w:jc w:val="right"/>
        <w:tblInd w:w="600" w:type="dxa"/>
        <w:tblBorders>
          <w:top w:val="none"/>
          <w:left w:val="none"/>
          <w:bottom w:val="none"/>
          <w:right w:val="none"/>
          <w:insideH w:val="none"/>
          <w:insideV w:val="none"/>
        </w:tblBorders>
      </w:tblPr>
      <w:tr>
        <w:tc>
          <w:tcPr><w:tcW w:w="3000" w:type="dxa"/></w:tcPr>
          <w:p>
            <w:pPr><w:jc w:val="left"/><w:spacing w:before="0" w:after="120"/></w:pPr>
            <w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>Palembang, ${new Date(data.workPeriod.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</w:t></w:r>
          </w:p>
        </w:tc>
      </w:tr>
      <w:tr>
        <w:tc>
          <w:tcPr><w:tcW w:w="3000" w:type="dxa"/></w:tcPr>
          <w:p>
            <w:pPr><w:jc w:val="left"/><w:spacing w:before="0" w:after="0"/></w:pPr>
            <w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>Pembimbing Lapangan,</w:t></w:r>
          </w:p>
        </w:tc>
      </w:tr>
      <w:tr>
        <w:tc>
          <w:tcPr><w:tcW w:w="3000" w:type="dxa"/></w:tcPr>
          <w:p>
            <w:pPr><w:jc w:val="left"/><w:spacing w:before="0" w:after="0"/></w:pPr>
            ${footerSignatureRun}
          </w:p>
        </w:tc>
      </w:tr>
      <w:tr>
        <w:tc>
          <w:tcPr><w:tcW w:w="3000" w:type="dxa"/></w:tcPr>
          <w:p>
            <w:pPr><w:jc w:val="left"/><w:spacing w:before="0" w:after="0"/></w:pPr>
            <w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>${mentorName}</w:t></w:r>
          </w:p>
        </w:tc>
      </w:tr>
      <w:tr>
        <w:tc>
          <w:tcPr><w:tcW w:w="3000" w:type="dxa"/></w:tcPr>
          <w:p>
            <w:pPr><w:jc w:val="left"/><w:spacing w:before="0" w:after="60"/></w:pPr>
            <w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>${position}</w:t></w:r>
          </w:p>
        </w:tc>
      </w:tr>
    </w:tbl>
  </w:body>
</w:document>`;

  // Create minimal DOCX structure
  const zip = new PizZip();

  // [Content_Types].xml
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Default Extension="jpg" ContentType="image/jpeg"/>
  <Default Extension="jpeg" ContentType="image/jpeg"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`,
  );

  // _rels/.rels
  zip.folder("_rels")?.file(
    ".rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
  );

  // word/document.xml
  zip.folder("word")?.file("document.xml", docxContent);

  // word/media/mentor-signature.(png|jpg|jpeg)
  if (mentorSignatureImage) {
    zip
      .folder("word")
      ?.folder("media")
      ?.file(
        `mentor-signature.${mentorSignatureImage.extension}`,
        mentorSignatureImage.base64,
        { base64: true },
      );
  }

  // word/_rels/document.xml.rels
  zip
    .folder("word")
    ?.folder("_rels")
    ?.file(
      "document.xml.rels",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${mentorSignatureImage ? `  <Relationship Id="rIdMentorSignature" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/mentor-signature.${mentorSignatureImage.extension}"/>` : ""}
</Relationships>`,
    );

  return zip.generate({ type: "arraybuffer" }) as ArrayBuffer;
}
