// File parser for uploaded documents
// Supports: .xlsx, .csv, .docx, .txt, .pptx content extraction

import * as XLSX from 'xlsx';

export interface ParsedFileContent {
  text: string;
  type: string;
  metadata?: Record<string, string>;
  sections?: { title: string; content: string }[];
}

export async function parseUploadedFile(file: File): Promise<ParsedFileContent> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'xlsx':
    case 'xls':
    case 'csv':
      return parseSpreadsheet(file);
    case 'docx':
      return parseDocx(file);
    case 'txt':
    case 'md':
      return parseText(file);
    case 'pptx':
      return parsePptx(file);
    case 'json':
      return parseJson(file);
    default:
      return parseText(file);
  }
}

async function parseSpreadsheet(file: File): Promise<ParsedFileContent> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  let fullText = '';
  const sections: { title: string; content: string }[] = [];

  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { header: 1 });

    let sheetText = '';
    const headers = data[0] as string[];

    if (headers) {
      sheetText += `Headers: ${headers.join(', ')}\n\n`;
    }

    data.slice(1).forEach((row: any) => {
      if (Array.isArray(row)) {
        const rowText = row.map((cell: any, i: number) => {
          const header = headers?.[i] || `Column ${i + 1}`;
          return `${header}: ${cell}`;
        }).filter(Boolean).join(' | ');
        if (rowText.trim()) sheetText += rowText + '\n';
      }
    });

    sections.push({ title: sheetName, content: sheetText });
    fullText += `\n=== ${sheetName} ===\n${sheetText}\n`;
  });

  return {
    text: fullText.trim(),
    type: 'spreadsheet',
    metadata: { sheets: workbook.SheetNames.join(', '), fileName: file.name },
    sections,
  };
}

async function parseDocx(file: File): Promise<ParsedFileContent> {
  // Use mammoth for docx parsing (client-side)
  try {
    const mammoth = await import('mammoth');
    const buffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });

    const text = result.value;
    const paragraphs = text.split('\n\n').filter(p => p.trim());

    const sections = paragraphs.map((p, i) => ({
      title: i === 0 ? 'Introduction' : `Section ${i}`,
      content: p.trim(),
    }));

    return {
      text,
      type: 'document',
      metadata: { fileName: file.name },
      sections,
    };
  } catch (error) {
    // Fallback: read as text
    const text = await file.text();
    return { text, type: 'document', metadata: { fileName: file.name } };
  }
}

async function parseText(file: File): Promise<ParsedFileContent> {
  const text = await file.text();
  return {
    text,
    type: 'text',
    metadata: { fileName: file.name },
  };
}

async function parsePptx(file: File): Promise<ParsedFileContent> {
  try {
    const JSZip = (await import('jszip')).default;
    const buffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(buffer);

    let allText = '';
    const sections: { title: string; content: string }[] = [];
    const slideFiles = Object.keys(zip.files)
      .filter(name => name.match(/ppt\/slides\/slide\d+\.xml/))
      .sort((a, b) => {
        const numA = parseInt(a.match(/slide(\d+)/)?.[1] || '0');
        const numB = parseInt(b.match(/slide(\d+)/)?.[1] || '0');
        return numA - numB;
      });

    for (let idx = 0; idx < slideFiles.length; idx++) {
      const slidePath = slideFiles[idx];
      const content = await zip.files[slidePath].async('text');

      // Extract all text runs from XML
      const textMatches = content.match(/<a:t>([^<]+)<\/a:t>/g);
      if (textMatches) {
        const texts = textMatches.map(m => m.replace(/<\/?a:t>/g, '').trim()).filter(t => t.length > 0);
        if (texts.length > 0) {
          // First text is usually the slide title
          const slideTitle = texts[0];
          const slideBody = texts.slice(1).join('\n');
          sections.push({
            title: `Slide ${idx + 1}: ${slideTitle}`,
            content: slideBody || slideTitle,
          });
          allText += `\n--- Slide ${idx + 1}: ${slideTitle} ---\n${slideBody}\n`;
        }
      }
    }

    return {
      text: allText.trim() || 'No text content extracted from presentation',
      type: 'presentation',
      metadata: { fileName: file.name, slideCount: String(slideFiles.length) },
      sections,
    };
  } catch {
    return {
      text: 'Unable to parse PPTX file. Please try uploading as text or docx.',
      type: 'error',
      metadata: { fileName: file.name },
    };
  }
}

async function parseJson(file: File): Promise<ParsedFileContent> {
  const text = await file.text();
  try {
    const json = JSON.parse(text);
    const formatted = JSON.stringify(json, null, 2);
    return {
      text: formatted,
      type: 'json',
      metadata: { fileName: file.name },
    };
  } catch {
    return { text, type: 'text', metadata: { fileName: file.name } };
  }
}
