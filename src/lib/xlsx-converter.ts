import { read, utils } from 'xlsx';
import { format, parse } from 'date-fns';

// Types for our data structures
export interface XlsxRow {
  creditorDebtorFullName: string;
  jobInvoiceNumber: string;
  invoiceDate: string;
  jobNumber: string;
  dueDate: string;
  transAmount: number;
  outstandingAmount: number;
  taxAmount: number;
}

export interface CsvRow {
  ContactName: string;
  EmailAddress: string;
  POAddressLine1: string;
  POAddressLine2: string;
  POAddressLine3: string;
  POAddressLine4: string;
  POCity: string;
  PORegion: string;
  POPostalCode: string;
  POCountry: string;
  InvoiceNumber: string;
  Reference: string;
  InvoiceDate: string;
  DueDate: string;
  InventoryItemCode: string;
  Description: string;
  Quantity: string;
  UnitAmount: string;
  Discount: string;
  AccountCode: string;
  TaxType: string;
  TrackingName1: string;
  TrackingOption1: string;
  TrackingName2: string;
  TrackingOption2: string;
  Currency: string;
  BrandingTheme: string;
}

// Helper function to get transaction amount from row
function getTransactionAmount(row: any): number | null {
  const transAmount = parseFloat(row['Trans. Amount'] || row['Transaction Amount']);
  return isNaN(transAmount) ? null : transAmount;
}

// Required fields in the XLSX file
const REQUIRED_FIELDS = [
  'Creditor/Debtor Full Name',
  'Job Invoice Number',
  'Invoice Date',
  'Job Number',
  'Due Date',
  ['Trans. Amount', 'Transaction Amount'], // Allow either field name
  'Outstanding Amount',
  'Tax Amount'
];

// Helper function to parse and format dates
function parseAndFormatDate(dateStr: string): { success: boolean; formattedDate?: string; error?: string } {
  try {
    // Try different date formats
    let date: Date | null = null;
    const formats = [
      'dd/MM/yyyy HH:mm:ss',
      'dd/MM/yyyy',
      'MM/dd/yyyy HH:mm:ss',
      'MM/dd/yyyy',
      'yyyy-MM-dd HH:mm:ss',
      'yyyy-MM-dd'
    ];

    for (const fmt of formats) {
      try {
        date = parse(dateStr, fmt, new Date());
        if (date && !isNaN(date.getTime())) {
          break;
        }
      } catch {
        continue;
      }
    }

    // If no format worked, try parsing as Excel date number
    if (!date || isNaN(date.getTime())) {
      const excelDate = parseFloat(dateStr);
      if (!isNaN(excelDate)) {
        // Excel dates are number of days since 1900-01-01
        // But Excel incorrectly assumes 1900 was a leap year
        date = new Date((excelDate - 1) * 24 * 60 * 60 * 1000 + new Date('1900-01-01').getTime());
      }
    }

    if (!date || isNaN(date.getTime())) {
      return { 
        success: false, 
        error: 'Invalid date format' 
      };
    }

    return { 
      success: true, 
      formattedDate: format(date, 'dd/MM/yyyy')
    };
  } catch (e) {
    return { 
      success: false, 
      error: 'Invalid date format' 
    };
  }
}

// Validate the XLSX data
export function validateXlsxData(data: any[]): { valid: boolean; error?: string } {
  // Check if data is empty
  if (!data || data.length === 0) {
    return { valid: false, error: 'No data found in the file' };
  }

  // Check for required fields
  const firstRow = data[0];
  const missingFields = REQUIRED_FIELDS.filter(field => {
    if (Array.isArray(field)) {
      // For fields with alternative names, check if at least one exists
      return !field.some(f => f in firstRow);
    }
    return !(field in firstRow);
  });
  
  if (missingFields.length > 0) {
    return { 
      valid: false, 
      error: `Missing required fields: ${missingFields.map(f => Array.isArray(f) ? f[0] : f).join(', ')}` 
    };
  }

  // Validate each row
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    // Check if Trans. Amount equals Outstanding Amount
    const transAmount = getTransactionAmount(row);
    const outstandingAmount = parseFloat(row['Outstanding Amount']);
    
    if (transAmount === null || isNaN(outstandingAmount)) {
      return {
        valid: false,
        error: `Row ${i + 1}: Invalid amount format for Trans. Amount or Outstanding Amount`
      };
    }
    
    if (transAmount !== outstandingAmount) {
      return { 
        valid: false, 
        error: `Row ${i + 1}: Trans. Amount (${transAmount}) does not equal Outstanding Amount (${outstandingAmount})` 
      };
    }

    // Validate date formats
    const invoiceDateResult = parseAndFormatDate(row['Invoice Date']);
    if (!invoiceDateResult.success) {
      return {
        valid: false,
        error: `Row ${i + 1}: Invalid Invoice Date format. Expected date format like dd/mm/yyyy`
      };
    }

    const dueDateResult = parseAndFormatDate(row['Due Date']);
    if (!dueDateResult.success) {
      return {
        valid: false,
        error: `Row ${i + 1}: Invalid Due Date format. Expected date format like dd/mm/yyyy`
      };
    }
  }

  return { valid: true };
}

// Transform XLSX row to two CSV rows
export function transformToCsvRows(xlsxRow: any): [CsvRow, CsvRow] {
  // Helper function to create a base CSV row with all fields
  const createBaseCsvRow = (): CsvRow => ({
    ContactName: '',
    EmailAddress: '',
    POAddressLine1: '',
    POAddressLine2: '',
    POAddressLine3: '',
    POAddressLine4: '',
    POCity: '',
    PORegion: '',
    POPostalCode: '',
    POCountry: '',
    InvoiceNumber: '',
    Reference: '',
    InvoiceDate: '',
    DueDate: '',
    InventoryItemCode: '',
    Description: '',
    Quantity: '',
    UnitAmount: '',
    Discount: '',
    AccountCode: '',
    TaxType: '',
    TrackingName1: '',
    TrackingOption1: '',
    TrackingName2: '',
    TrackingOption2: '',
    Currency: '',
    BrandingTheme: ''
  });

  // Parse and format dates
  const invoiceDateResult = parseAndFormatDate(xlsxRow['Invoice Date']);
  const dueDateResult = parseAndFormatDate(xlsxRow['Due Date']);
  
  // Calculate UnitAmounts
  const taxAmount = parseFloat(xlsxRow['Tax Amount']);
  const transAmount = getTransactionAmount(xlsxRow) || 0;
  const firstLineUnitAmount = taxAmount / 0.1;
  const secondLineUnitAmount = transAmount - taxAmount - firstLineUnitAmount;

  // Create first row (GST On Income)
  const firstRow: CsvRow = {
    ...createBaseCsvRow(),
    ContactName: xlsxRow['Creditor/Debtor Full Name'],
    InvoiceNumber: xlsxRow['Job Invoice Number'],
    Reference: xlsxRow['Job Number'],
    InvoiceDate: invoiceDateResult.formattedDate || '',
    DueDate: dueDateResult.formattedDate || '',
    Description: 'Import Fees',
    Quantity: '1',
    UnitAmount: firstLineUnitAmount.toFixed(2),
    AccountCode: '200',
    TaxType: 'GST On Income'
  };

  // Create second row (GST Free Income)
  const secondRow: CsvRow = {
    ...createBaseCsvRow(),
    ContactName: xlsxRow['Creditor/Debtor Full Name'],
    InvoiceNumber: xlsxRow['Job Invoice Number'],
    Reference: xlsxRow['Job Number'],
    InvoiceDate: invoiceDateResult.formattedDate || '',
    DueDate: dueDateResult.formattedDate || '',
    Description: 'Disbursement',
    Quantity: '1',
    UnitAmount: secondLineUnitAmount.toFixed(2),
    AccountCode: '220',
    TaxType: 'GST Free Income'
  };

  return [firstRow, secondRow];
}

// Process XLSX file and return CSV rows
export async function processXlsxFile(file: File): Promise<{ success: boolean; data?: CsvRow[]; error?: string }> {
  try {
    // Read the file
    const data = await file.arrayBuffer();
    const workbook = read(data);
    
    // Get the first sheet
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = utils.sheet_to_json(firstSheet);

    // Validate the data
    const validation = validateXlsxData(rows);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Transform rows
    const csvRows: CsvRow[] = [];
    for (const row of rows) {
      const [firstRow, secondRow] = transformToCsvRows(row);
      csvRows.push(firstRow, secondRow);
    }

    return { success: true, data: csvRows };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An error occurred while processing the file' 
    };
  }
}

// Generate CSV string from rows
export function generateCsv(rows: CsvRow[]): string {
  const worksheet = utils.json_to_sheet(rows);
  const csvContent = utils.sheet_to_csv(worksheet);
  return csvContent;
}

// Download CSV file
export function downloadCsv(csvContent: string, filename: string = 'SalesInvoice.csv'): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
} 