const fs = require('fs');
const path = require('path');

const dir = 'c:/laragon/www/SIKP/app/lib/services';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

function addSchema(content, serviceName, genericType, schemaName) {
  // Replace get<Generic>(endpoint) -> get<Generic>(endpoint, undefined, Schema)
  const regexGet1 = new RegExp('sikpClient\\\\.get<([^>]+' + genericType + '[^>]*)>\\\\(([^,]+)\\\\)', 'g');
  content = content.replace(regexGet1, 'sikpClient.get<$1>($2, undefined, ' + schemaName + ')');

  // Replace get<Generic>(endpoint, params) -> get<Generic>(endpoint, params, Schema)
  const regexGet2 = new RegExp('sikpClient\\\\.get<([^>]+' + genericType + '[^>]*)>\\\\(([^,]+),\\s*([^)]+)\\\\)', 'g');
  content = content.replace(regexGet2, 'sikpClient.get<$1>($2, $3, ' + schemaName + ')');

  // Replace post<Generic>(endpoint) -> post<Generic>(endpoint, undefined, Schema)
  const regexPost1 = new RegExp('sikpClient\\\\.post<([^>]+' + genericType + '[^>]*)>\\\\(([^,]+)\\\\)', 'g');
  content = content.replace(regexPost1, 'sikpClient.post<$1>($2, undefined, ' + schemaName + ')');

  // Replace post<Generic>(endpoint, body) -> post<Generic>(endpoint, body, Schema)
  const regexPost2 = new RegExp('sikpClient\\\\.post<([^>]+' + genericType + '[^>]*)>\\\\(([^,]+),\\s*([^)]+)\\\\)', 'g');
  content = content.replace(regexPost2, 'sikpClient.post<$1>($2, $3, ' + schemaName + ')');

  // Replace put<Generic>(endpoint, body) -> put<Generic>(endpoint, body, Schema)
  const regexPut = new RegExp('sikpClient\\\\.put<([^>]+' + genericType + '[^>]*)>\\\\(([^,]+),\\s*([^)]+)\\\\)', 'g');
  content = content.replace(regexPut, 'sikpClient.put<$1>($2, $3, ' + schemaName + ')');

  return content;
}

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  if (file === 'submission-api.service.ts' || file === 'submission.service.ts') {
    content = addSchema(content, file, 'Submission', 'SubmissionSchema');
    content = addSchema(content, file, 'SubmissionDocument', 'SubmissionDocumentSchema');
    if (content !== original) {
      content = 'import { SubmissionSchema, SubmissionDocumentSchema } from "~/lib/schemas/api-schemas";\nimport { z } from "zod";\n' + content;
    }
  } else if (file === 'team.service.ts') {
    content = addSchema(content, file, 'Team', 'TeamSchema');
    content = addSchema(content, file, 'TeamMember', 'TeamMemberSchema');
    if (content !== original) {
      content = 'import { TeamSchema, TeamMemberSchema } from "~/lib/schemas/api-schemas";\nimport { z } from "zod";\n' + content;
    }
  } else if (file === 'template.service.ts') {
    content = addSchema(content, file, 'TemplateResponse', 'TemplateSchema');
    if (content !== original) {
      content = 'import { TemplateSchema } from "~/lib/schemas/api-schemas";\nimport { z } from "zod";\n' + content;
    }
  } else if (file === 'dosen.service.ts') {
    content = addSchema(content, file, 'DosenProfile', 'DosenProfileSchema');
    if (content !== original) {
      content = 'import { DosenProfileSchema } from "~/lib/schemas/api-schemas";\nimport { z } from "zod";\n' + content;
    }
  } else if (file === 'mahasiswa.service.ts') {
    content = addSchema(content, file, 'MahasiswaProfile', 'MahasiswaProfileSchema');
    if (content !== original) {
      content = 'import { MahasiswaProfileSchema } from "~/lib/schemas/api-schemas";\nimport { z } from "zod";\n' + content;
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log('Updated ' + file);
  }
});
