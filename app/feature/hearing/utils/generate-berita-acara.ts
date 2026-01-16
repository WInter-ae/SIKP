import type { BeritaAcara } from "../types";

interface MahasiswaData {
  nama: string;
  nim: string;
  programStudi: string;
}

export const generateBeritaAcaraDOCX = async (
  beritaAcara: BeritaAcara,
  mahasiswa: MahasiswaData
) => {
  // Dynamic import untuk menghindari SSR issues
  const [PizZip, { saveAs }] = await Promise.all([
    import("pizzip").then(m => m.default),
    import("file-saver")
  ]);

  try {
    // Buat template DOCX
    const template = createBeritaAcaraDocxTemplate(beritaAcara, mahasiswa, PizZip);
    
    const zip = new PizZip(template);
    
    const blob = zip.generate({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    saveAs(blob, `Berita_Acara_Ujian_KP_${mahasiswa.nim}.docx`);
  } catch (error) {
    console.error("Error generating DOCX:", error);
    throw error;
  }
};

function createBeritaAcaraDocxTemplate(
  beritaAcara: BeritaAcara,
  mahasiswa: MahasiswaData,
  PizZip: any
): ArrayBuffer {
  const tanggalObj = new Date(beritaAcara.tanggalSidang);
  const hari = tanggalObj.toLocaleDateString("id-ID", { weekday: "long" });
  const tanggal = tanggalObj.getDate();
  const bulan = tanggalObj.toLocaleDateString("id-ID", { month: "long" });
  const tahun = tanggalObj.getFullYear();

  // Load profil dosen untuk nama dan NIP
  let dosenProfile = null;
  if (typeof window !== 'undefined') {
    try {
      const savedProfile = localStorage.getItem("dosen-profile");
      if (savedProfile) {
        dosenProfile = JSON.parse(savedProfile);
      }
    } catch (e) {
      console.error("Error loading dosen profile:", e);
    }
  }

  // Generate table rows untuk penguji dari beritaAcara.dosenPenguji
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
        
        return `
    <w:tr>
      <w:tc>
        <w:tcPr>
          <w:tcBorders>
            <w:top w:val="single" w:sz="4"/>
            <w:left w:val="single" w:sz="4"/>
            <w:bottom w:val="single" w:sz="4"/>
            <w:right w:val="single" w:sz="4"/>
          </w:tcBorders>
        </w:tcPr>
        <w:p>
          <w:pPr><w:jc w:val="center"/></w:pPr>
          <w:r><w:t>${displayNumber}</w:t></w:r>
        </w:p>
      </w:tc>
      <w:tc>
        <w:tcPr>
          <w:tcBorders>
            <w:top w:val="single" w:sz="4"/>
            <w:left w:val="single" w:sz="4"/>
            <w:bottom w:val="single" w:sz="4"/>
            <w:right w:val="single" w:sz="4"/>
          </w:tcBorders>
        </w:tcPr>
        <w:p>
          <w:r><w:t>${dosenData.nama}</w:t></w:r>
        </w:p>
      </w:tc>
      <w:tc>
        <w:tcPr>
          <w:tcBorders>
            <w:top w:val="single" w:sz="4"/>
            <w:left w:val="single" w:sz="4"/>
            <w:bottom w:val="single" w:sz="4"/>
            <w:right w:val="single" w:sz="4"/>
          </w:tcBorders>
        </w:tcPr>
        <w:p>
          <w:pPr><w:jc w:val="center"/></w:pPr>
          <w:r><w:t>${displayStatus}</w:t></w:r>
        </w:p>
      </w:tc>
      <w:tc>
        <w:tcPr>
          <w:tcBorders>
            <w:top w:val="single" w:sz="4"/>
            <w:left w:val="single" w:sz="4"/>
            <w:bottom w:val="single" w:sz="4"/>
            <w:right w:val="single" w:sz="4"/>
          </w:tcBorders>
        </w:tcPr>
        <w:p><w:r><w:t></w:t></w:r></w:p>
      </w:tc>
    </w:tr>
  `;
      }
    )
    .join("");

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <!-- Title -->
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:spacing w:after="240"/>
      </w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="32"/></w:rPr>
        <w:t>BERITA ACARA UJIAN KP</w:t>
      </w:r>
    </w:p>

    <!-- Main content -->
    <w:p>
      <w:r>
        <w:t>Pada hari ini ${hari} tanggal ${tanggal} bulan ${bulan} tahun ${tahun}, telah dilaksanakan ujian KP mahasiswa :</w:t>
      </w:r>
    </w:p>

    <!-- Nama -->
    <w:p>
      <w:r><w:t>Nama</w:t></w:r>
      <w:r><w:tab/><w:tab/></w:r>
      <w:r><w:t>: ${mahasiswa.nama}</w:t></w:r>
    </w:p>

    <!-- NIM -->
    <w:p>
      <w:r><w:t>NIM</w:t></w:r>
      <w:r><w:tab/><w:tab/></w:r>
      <w:r><w:t>: ${mahasiswa.nim}</w:t></w:r>
    </w:p>

    <!-- Program Studi -->
    <w:p>
      <w:r><w:t>Program Studi</w:t></w:r>
      <w:r><w:tab/></w:r>
      <w:r><w:t>: ${mahasiswa.programStudi}</w:t></w:r>
    </w:p>

    <!-- Judul KP -->
    <w:p>
      <w:r><w:t>Judul KP</w:t></w:r>
      <w:r><w:tab/><w:tab/></w:r>
      <w:r><w:t>: ${beritaAcara.judulLaporan}</w:t></w:r>
    </w:p>

    <!-- Empty line -->
    <w:p><w:r><w:t></w:t></w:r></w:p>

    <!-- Dosen Pembimbing -->
    <w:p>
      <w:r><w:t>Dosen Pembimbing</w:t></w:r>
      <w:r><w:tab/></w:r>
      <w:r><w:t>: ${beritaAcara.dosenSignature?.nama || finalDosenList.find(d => d.jabatan === "pembimbing")?.nama || "-"}</w:t></w:r>
    </w:p>

    <!-- NIP Pembimbing -->
    <w:p>
      <w:r><w:t>NIP Pembimbing</w:t></w:r>
      <w:r><w:tab/></w:r>
      <w:r><w:t>: ${beritaAcara.dosenSignature?.nip || finalDosenList.find(d => d.jabatan === "pembimbing")?.nip || "-"}</w:t></w:r>
    </w:p>

    <!-- Pembimbing Lapangan -->
    <w:p>
      <w:r><w:t>Pembimbing Lapangan</w:t></w:r>
      <w:r><w:t> : ${beritaAcara.tempatPelaksanaan}</w:t></w:r>
    </w:p>

    <!-- Dengan penguji -->
    <w:p>
      <w:r><w:t>Dengan penguji</w:t></w:r>
      <w:r><w:tab/></w:r>
      <w:r><w:t>:</w:t></w:r>
    </w:p>

    <!-- Table -->
    <w:tbl>
      <w:tblPr>
        <w:tblStyle w:val="TableGrid"/>
        <w:tblW w:w="5000" w:type="pct"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="4"/>
          <w:left w:val="single" w:sz="4"/>
          <w:bottom w:val="single" w:sz="4"/>
          <w:right w:val="single" w:sz="4"/>
          <w:insideH w:val="single" w:sz="4"/>
          <w:insideV w:val="single" w:sz="4"/>
        </w:tblBorders>
      </w:tblPr>
      
      <!-- Table Header -->
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:tcBorders>
              <w:top w:val="single" w:sz="4"/>
              <w:left w:val="single" w:sz="4"/>
              <w:bottom w:val="single" w:sz="4"/>
              <w:right w:val="single" w:sz="4"/>
            </w:tcBorders>
            <w:shd w:fill="F0F0F0"/>
          </w:tcPr>
          <w:p>
            <w:pPr><w:jc w:val="center"/></w:pPr>
            <w:r><w:rPr><w:b/></w:rPr><w:t>No.</w:t></w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcBorders>
              <w:top w:val="single" w:sz="4"/>
              <w:left w:val="single" w:sz="4"/>
              <w:bottom w:val="single" w:sz="4"/>
              <w:right w:val="single" w:sz="4"/>
            </w:tcBorders>
            <w:shd w:fill="F0F0F0"/>
          </w:tcPr>
          <w:p>
            <w:pPr><w:jc w:val="center"/></w:pPr>
            <w:r><w:rPr><w:b/></w:rPr><w:t>Nama Penguji</w:t></w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcBorders>
              <w:top w:val="single" w:sz="4"/>
              <w:left w:val="single" w:sz="4"/>
              <w:bottom w:val="single" w:sz="4"/>
              <w:right w:val="single" w:sz="4"/>
            </w:tcBorders>
            <w:shd w:fill="F0F0F0"/>
          </w:tcPr>
          <w:p>
            <w:pPr><w:jc w:val="center"/></w:pPr>
            <w:r><w:rPr><w:b/></w:rPr><w:t>Status</w:t></w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcBorders>
              <w:top w:val="single" w:sz="4"/>
              <w:left w:val="single" w:sz="4"/>
              <w:bottom w:val="single" w:sz="4"/>
              <w:right w:val="single" w:sz="4"/>
            </w:tcBorders>
            <w:shd w:fill="F0F0F0"/>
          </w:tcPr>
          <w:p>
            <w:pPr><w:jc w:val="center"/></w:pPr>
            <w:r><w:rPr><w:b/></w:rPr><w:t>Tanda Tangan</w:t></w:r>
          </w:p>
        </w:tc>
      </w:tr>

      <!-- Table Rows -->
      ${pengujiRows}
    </w:tbl>

    <!-- Empty lines -->
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>

    <!-- Signature section -->
    <w:p>
      <w:pPr><w:jc w:val="right"/></w:pPr>
      <w:r>
        <w:t>Palembang, ${new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:pPr><w:jc w:val="right"/></w:pPr>
      <w:r><w:t>Dosen Pembimbing,</w:t></w:r>
    </w:p>

    <!-- Empty lines for signature -->
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>

    <!-- Nama dan NIP -->
    <w:p>
      <w:pPr><w:jc w:val="right"/></w:pPr>
      <w:r>
        <w:rPr><w:b/></w:rPr>
        <w:t>${beritaAcara.dosenSignature?.nama || finalDosenList.find(d => d.jabatan === "pembimbing")?.nama || "-"}</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:pPr><w:jc w:val="right"/></w:pPr>
      <w:r><w:t>NIP: ${beritaAcara.dosenSignature?.nip || finalDosenList.find(d => d.jabatan === "pembimbing")?.nip || "-"}</w:t></w:r>
    </w:p>

  </w:body>
</w:document>`;

  const zip = new PizZip();

  // Add document.xml
  zip.file("word/document.xml", documentXml);

  // Add _rels/.rels
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );

  // Add word/_rels/document.xml.rels
  zip.folder("word")?.folder("_rels")?.file(
    "document.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`
  );

  // Add [Content_Types].xml
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
  );

  return zip.generate({ type: "arraybuffer" });
}
