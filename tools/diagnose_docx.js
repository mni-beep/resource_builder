// tools/diagnose_docx.js
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

async function main() {
  const docxPath = process.argv[2] || './output/atomic-theory-activities.docx';
  const fullPath = path.resolve(docxPath);
  console.log(`Diagnosing: ${fullPath}`);
  
  const data = fs.readFileSync(fullPath);
  const zip = await JSZip.loadAsync(data);
  
  // Check all files in the zip
  console.log('\n=== ZIP contents ===');
  Object.keys(zip.files).forEach(name => {
    const f = zip.files[name];
    console.log(`  ${f.dir ? 'DIR ' : 'FILE'} ${name} (${f._data.uncompressedSize || 0} bytes)`);
  });
  
  // Parse document.xml
  const docXml = await zip.file('word/document.xml').async('string');
  console.log(`\n=== document.xml ===`);
  console.log(`Length: ${docXml.length} chars`);
  
  // Check for invalid XML chars
  const invalidChars = [];
  for (let i = 0; i < docXml.length; i++) {
    const code = docXml.charCodeAt(i);
    if (code < 0x20 && code !== 0x09 && code !== 0x0A && code !== 0x0D) {
      invalidChars.push({pos: i, code});
    }
  }
  console.log(`Invalid XML control chars: ${invalidChars.length}`);
  if (invalidChars.length > 0) {
    invalidChars.slice(0, 20).forEach(c => {
      console.log(`  Position ${c.pos}: char code ${c.code}`);
    });
  }
  
  // Check for common problems
  // 1. Check relationships match
  const docRelsXml = await zip.file('word/_rels/document.xml.rels').async('string');
  const relTargets = [...docRelsXml.matchAll(/Target="([^"]+)"/g)].map(m => m[1]);
  console.log('\n=== Document relationships ===');
  relTargets.forEach(t => console.log(`  Target: ${t}`));
  
  // Check those targets exist
  console.log('\n=== Missing targets ===');
  relTargets.forEach(t => {
    const fullTarget = `word/${t}`;
    if (!zip.files[fullTarget]) {
      console.log(`  MISSING: ${fullTarget}`);
    }
  });
  
  // Check content types
  const ctXml = await zip.file('[Content_Types].xml').async('string');
  const parts = [...ctXml.matchAll(/PartName="([^"]+)"/g)].map(m => m[1]);
  console.log('\n=== Parts declared in [Content_Types].xml ===');
  parts.forEach(p => console.log(`  ${p}`));
  
  // Check that all word/ files have content types
  console.log('\n=== Files without content type ===');
  Object.keys(zip.files).forEach(name => {
    if (!name.endsWith('/') && name.startsWith('word/') && !name.startsWith('word/_rels/') && !name.startsWith('word/media/')) {
      const partName = '/' + name;
      if (!parts.includes(partName)) {
        console.log(`  NO CT: ${name}`);
      }
    }
  });
  
  // Check for empty elements
  console.log('\n=== Quick XML sanity ===');
  const openBody = (docXml.match(/<w:body/g) || []).length;
  const closeBody = (docXml.match(/<\/w:body/g) || []).length;
  console.log(`  <w:body>: ${openBody}, </w:body>: ${closeBody}`);
  
  // Check numbering.xml references
  const numIds = [...docXml.matchAll(/w:numId w:val="(\d+)"/g)].map(m => m[1]);
  console.log(`\n=== Numbering IDs referenced in document ===`);
  const uniqueNumIds = [...new Set(numIds)].sort((a,b) => a-b);
  console.log(`  Unique IDs: ${uniqueNumIds.join(', ')} (${uniqueNumIds.length} total)`);
}

main().catch(e => console.error(e));
