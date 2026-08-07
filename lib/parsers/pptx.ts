const officeParser = require('officeparser');
import type { ParserResult } from './pdf';

export async function parsePPTX(buffer: Buffer): Promise<ParserResult> {
  let text = '';
  try {
    const rawResult = await officeParser.parseOffice(buffer);
    if (typeof rawResult === 'string') {
      text = rawResult;
    } else if (rawResult && typeof rawResult === 'object') {
      text = rawResult.text || rawResult.data || JSON.stringify(rawResult);
    } else if (rawResult != null) {
      text = String(rawResult);
    }
  } catch (err) {
    console.error("OfficeParser PPTX Error:", err);
    text = '';
  }
  
  return {
    text: String(text || ''),
    pageCount: 1,
    metadata: {},
    isScanned: false
  };
}
