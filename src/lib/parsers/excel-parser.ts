import * as XLSX from 'xlsx';
import { extractFinancialDataFromText } from '@/lib/api/openai';

export interface ParsedExcelResult {
  sheets: {
    name: string;
    data: any[][];
    jsonData: any[];
  }[];
  metadata: {
    sheetCount: number;
    fileName?: string;
    fileSize?: number;
  };
  extractedFinancialData?: any;
}

export async function parseExcel(buffer: Buffer): Promise<ParsedExcelResult> {
  try {
    // Read the workbook
    const workbook = XLSX.read(buffer, {
      type: 'buffer',
      cellDates: true,
      cellNF: true,
      cellStyles: true,
      cellText: false
    });
    
    const sheets = workbook.SheetNames.map(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to array of arrays
      const data = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: null,
        raw: false
      }) as any[][];
      
      // Convert to JSON with headers
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        defval: null,
        raw: false
      });
      
      return {
        name: sheetName,
        data,
        jsonData
      };
    });
    
    return {
      sheets,
      metadata: {
        sheetCount: workbook.SheetNames.length
      }
    };
  } catch (error) {
    console.error('Excel parsing error:', error);
    throw new Error('Failed to parse Excel file');
  }
}

export async function extractFinancialDataFromExcel(
  buffer: Buffer,
  useAI: boolean = true
): Promise<any> {
  try {
    const parsedExcel = await parseExcel(buffer);
