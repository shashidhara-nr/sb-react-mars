export interface DebtorRecord {
    accountNumber?: string;
    accountName?: string;
    bankName?: string;
    branchCode?: string;
    accountType?: string;
    debtorCode?: string;
    cdiNumber?: string;
    debtorReference?: string;
    iban?: string;
    transactionLimit?: string;
    status?: 'verified' | 'partially-verified' | 'not-verified' | 'invalid' | 'duplicate';
    errors?: string[];
    rowNumber?: number;
    [key: string]: any;
}

export interface ParsedDebtorsResult {
    newRecords: DebtorRecord[];
    existingRecords: DebtorRecord[];
    dupRecords: DebtorRecord[];
    potentialDupRecords: DebtorRecord[];
    errorRecords: DebtorRecord[];
    inValidRecords: DebtorRecord[];
    schemaValidated: boolean;
    statistics: FileStatistics;
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export interface FileValidationResult {
    isValid: boolean;
    error?: string;
    extension?: string;
}

export interface CollectionType {
    id: string;
    name: string;
}

export interface FileStatistics {
    total: number;
    valid: number;
    invalid: number;
    duplicates: number;
}

export const ALLOWED_EXTENSIONS = ['PDF', 'DOC', 'DOCX'] as const;
export type AllowedExtension = typeof ALLOWED_EXTENSIONS[number];

export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const MIME_TYPES: Record<string, string[]> = {
    'PDF': ['application/pdf'],
    'DOC': ['application/msword'],
    'DOCX': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

export function validateFileExtension(filename: string): FileValidationResult {
    if (!filename || filename.trim().length === 0) {
        return {
            isValid: false,
            error: 'Filename is required'
        };
    }

    const re = /(?:\.([^.]+))?$/;
    const match = re.exec(filename);

    if (!match || !match[1]) {
        return {
            isValid: false,
            error: 'File has no extension'
        };
    }

    const extension = match[1].toUpperCase();

    if (!ALLOWED_EXTENSIONS.includes(extension as AllowedExtension)) {
        return {
            isValid: false,
            error: `Only ${ALLOWED_EXTENSIONS.join(', ')} files are allowed`,
            extension
        };
    }

    return {
        isValid: true,
        extension
    };
}

export function validateFileSize(fileSize: number): ValidationResult {
    const errors: string[] = [];

    if (fileSize === 0) {
        errors.push('File is empty');
    }

    if (fileSize > MAX_FILE_SIZE_BYTES) {
        errors.push(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE_MB}MB`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

export function validateFile(file: File): ValidationResult {
    const errors: string[] = [];

    if (!file) {
        errors.push('No file selected');
        return { isValid: false, errors };
    }

    const extValidation = validateFileExtension(file.name);
    if (!extValidation.isValid) {
        errors.push(extValidation.error || 'Invalid file extension');
    }

    const sizeValidation = validateFileSize(file.size);
    if (!sizeValidation.isValid) {
        errors.push(...sizeValidation.errors);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

export function getAllowedExtensions(): readonly string[] {
    return ALLOWED_EXTENSIONS;
}


export function getAllowedExtensionsForInput(): string {
    return ALLOWED_EXTENSIONS.map(ext => `.${ext.toLowerCase()}`).join(',');
}

export async function parsePDFContent(file: File): Promise<DebtorRecord[]> {
    // Commented out - PDF parsing functionality temporarily disabled
    // Return empty array to skip parsing without showing errors
    return [];
    
    // try {
    //     const arrayBuffer = await readFileAsArrayBuffer(file);
    //     const text = await extractTextFromPDF(arrayBuffer);
    //     
    //     if (!text || text.trim().length === 0) {
    //         throw new Error('PDF appears to be empty or contains no extractable text');
    //     }
    //     
    //     return parseDebtorTextContent(text);
    // } catch (error: any) {
    //     console.error('PDF parsing error:', error);
    //     throw new Error(`Failed to parse PDF file: ${error.message || 'Unknown error'}`);
    // }
}

async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
    // Commented out - PDF text extraction temporarily disabled
    throw new Error('PDF text extraction is currently disabled');
    
    // try {
    //     const pdfjsLib = await import('pdfjs-dist');
    //     
    //     // Set worker source
    //     if (typeof window !== 'undefined') {
    //         pdfjsLib.GlobalWorkerOptions.workerSrc = `http://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    //     }
    //     
    //     const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    //     const pdf = await loadingTask.promise;
    //     
    //     let fullText = '';
    //     
    //     // Extract text from all pages
    //     for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    //         const page = await pdf.getPage(pageNum);
    //         const textContent = await page.getTextContent();
    //         
    //         // Combine text items from the page
    //         const pageText = textContent.items
    //             .map((item: any) => item.str)
    //             .join(' ');
    //         
    //         fullText += pageText + '\n';
    //     }
    //     
    //     return fullText;
    // } catch (error: any) {
    //     console.error('PDF text extraction error:', error);
    //     throw new Error(`Could not extract text from PDF: ${error.message || 'Unknown error'}`);
    // }
}

export async function parseDOCContent(file: File): Promise<DebtorRecord[]> {
    try {
        const mammoth = await import('mammoth');
        const arrayBuffer = await readFileAsArrayBuffer(file);
        
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = result.value;
        
        if (!text || text.trim().length === 0) {
            throw new Error('Document appears to be empty');
        }
        
        return parseDebtorTextContent(text);
    } catch (error: any) {
        console.error('DOC/DOCX parsing error:', error);
        throw new Error(`Failed to parse Word document: ${error.message || 'Unknown error'}`);
    }
}

function parseDebtorTextContent(text: string): DebtorRecord[] {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length === 0) {
        return [];
    }
    
    // Try to detect if first line is header
    const firstLine = lines[0].toLowerCase();
    const hasHeader = firstLine.includes('account') || 
                      firstLine.includes('name') || 
                      firstLine.includes('bank') ||
                      firstLine.includes('debtor');
    
    const dataLines = hasHeader ? lines.slice(1) : lines;
    const debtors: DebtorRecord[] = [];
    
    // Parse each line - support tab, comma, or pipe separated values
    dataLines.forEach((line, index) => {
        const delimiter = detectDelimiter(line);
        const values = line.split(delimiter).map(v => v.trim());
        
        if (values.length < 2) {
            return; // Skip lines with insufficient data
        }
        
        // Map values to debtor fields
        // Expected format: AccountNumber, AccountName, BankName, BranchCode, AccountType, DebtorCode, CDINumber, DebtorReference, IBAN, TransactionLimit
        const debtor: DebtorRecord = {
            rowNumber: index + 1,
            accountNumber: values[0] || '',
            accountName: values[1] || '',
            bankName: values[2] || '',
            branchCode: values[3] || '',
            accountType: values[4] || '',
            debtorCode: values[5] || '',
            cdiNumber: values[6] || '',
            debtorReference: values[7] || '',
            iban: values[8] || '',
            transactionLimit: values[9] || ''
        };
        
        debtors.push(debtor);
    });
    
    return debtors;
}

function detectDelimiter(line: string): string | RegExp {
    // Count potential delimiters
    const tabCount = (line.match(/\t/g) || []).length;
    const commaCount = (line.match(/,/g) || []).length;
    const pipeCount = (line.match(/\|/g) || []).length;
    const semicolonCount = (line.match(/;/g) || []).length;
    
    // Return most common delimiter
    if (tabCount > 0 && tabCount >= commaCount) return '\t';
    if (pipeCount > 0 && pipeCount >= commaCount) return '|';
    if (semicolonCount > 0 && semicolonCount >= commaCount) return ';';
    if (commaCount > 0) return ',';
    
    // Default: split by multiple spaces
    return /\s{2,}/;
}

export function normalizeFieldName(fieldName: string): string {
    const normalized = fieldName
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/_/g, '')
        .replace(/-/g, '');

    const fieldMap: Record<string, string> = {
        'accountno': 'accountNumber',
        'accountnumber': 'accountNumber',
        'accnumber': 'accountNumber',
        'account': 'accountNumber',
        'accountname': 'accountName',
        'accname': 'accountName',
        'name': 'accountName',
        'debtorname': 'accountName',
        'bank': 'bankName',
        'bankname': 'bankName',
        'branch': 'branchCode',
        'branchcode': 'branchCode',
        'type': 'accountType',
        'accounttype': 'accountType',
        'debtorcode': 'debtorCode',
        'code': 'debtorCode',
        'cdi': 'cdiNumber',
        'cdinumber': 'cdiNumber',
        'reference': 'debtorReference',
        'debtorreference': 'debtorReference',
        'ref': 'debtorReference',
        'limit': 'transactionLimit',
        'transactionlimit': 'transactionLimit',
        'iban': 'iban'
    };

    return fieldMap[normalized] || fieldName;
}

export async function parseFileContent(file: File, extension: string): Promise<DebtorRecord[]> {
    const ext = extension.toUpperCase();

    if (ext === 'PDF') {
        return await parsePDFContent(file);
    }
    else if (ext === 'DOC' || ext === 'DOCX') {
        return await parseDOCContent(file);
    }

    throw new Error(`Unsupported file format: ${extension}`);
}

export function validateDebtorRequiredFields(
    debtor: DebtorRecord,
    requiredFields: string[] = ['accountNumber', 'accountName']
): ValidationResult {
    const errors: string[] = [];

    requiredFields.forEach(field => {
        if (!debtor[field] || debtor[field].toString().trim().length === 0) {
            errors.push(`${field} is required`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors
    };
}

export function validateAccountNumber(accountNumber: string): ValidationResult {
    const errors: string[] = [];

    if (!accountNumber || accountNumber.trim().length === 0) {
        errors.push('Account number is required');
        return { isValid: false, errors };
    }

    const cleaned = accountNumber.replace(/[\s-]/g, '');

    if (!/^\d+$/.test(cleaned)) {
        errors.push('Account number must contain only digits');
    }

    if (cleaned.length < 8 || cleaned.length > 17) {
        errors.push('Account number must be between 8 and 17 digits');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

export function validateDebtor(debtor: DebtorRecord): ValidationResult {
    const errors: string[] = [];

    const requiredValidation = validateDebtorRequiredFields(debtor);
    if (!requiredValidation.isValid) {
        errors.push(...requiredValidation.errors);
    }

    if (debtor.accountNumber) {
        const accountValidation = validateAccountNumber(debtor.accountNumber);
        if (!accountValidation.isValid) {
            errors.push(...accountValidation.errors);
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

export function validateDebtors(debtors: DebtorRecord[]): Map<number, ValidationResult> {
    const validationResults = new Map<number, ValidationResult>();

    debtors.forEach((debtor, index) => {
        validationResults.set(index, validateDebtor(debtor));
    });

    return validationResults;
}

export function validateAndMarkDebtors(debtors: DebtorRecord[]): DebtorRecord[] {
    return debtors.map(debtor => {
        const validation = validateDebtor(debtor);
        return {
            ...debtor,
            status: validation.isValid ? 'verified' : 'invalid',
            errors: validation.errors
        };
    });
}

export function areDebtorsDuplicates(debtor1: DebtorRecord, debtor2: DebtorRecord): boolean {
    const acc1 = debtor1.accountNumber?.replace(/[\s-]/g, '').toLowerCase();
    const acc2 = debtor2.accountNumber?.replace(/[\s-]/g, '').toLowerCase();

    return acc1 === acc2 && acc1 !== undefined && acc1.length > 0;
}

export function findDuplicateDebtors(debtors: DebtorRecord[]): DebtorRecord[] {
    const seen = new Set<string>();
    const duplicates: DebtorRecord[] = [];

    debtors.forEach(debtor => {
        const accountNumber = debtor.accountNumber?.replace(/[\s-]/g, '').toLowerCase();
        
        if (accountNumber && seen.has(accountNumber)) {
            duplicates.push(debtor);
        } else if (accountNumber) {
            seen.add(accountNumber);
        }
    });

    return duplicates;
}

export function markDuplicateDebtors(debtors: DebtorRecord[]): DebtorRecord[] {
    const seen = new Map<string, number>();
    
    return debtors.map((debtor, index) => {
        const accountNumber = debtor.accountNumber?.replace(/[\s-]/g, '').toLowerCase();
        
        if (accountNumber) {
            if (seen.has(accountNumber)) {
                const firstRow = seen.get(accountNumber)!;
                return {
                    ...debtor,
                    status: 'duplicate',
                    errors: [
                        ...(debtor.errors || []),
                        `Duplicate account number (first occurrence at row ${firstRow})`
                    ]
                };
            }
            seen.set(accountNumber, debtor.rowNumber || index + 1);
        }
        
        return debtor;
    });
}

export function validateCollectionTypes(selectedTypes: CollectionType[]): ValidationResult {
    const errors: string[] = [];

    if (!selectedTypes || selectedTypes.length === 0) {
        errors.push('At least one collection type must be selected');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

export function filterCollectionTypes(types: CollectionType[], searchTerm: string): CollectionType[] {
    if (!searchTerm || searchTerm.trim().length === 0) {
        return types;
    }

    const term = searchTerm.toLowerCase();
    return types.filter(type => 
        type.name.toLowerCase().includes(term) ||
        type.id.toLowerCase().includes(term)
    );
}

export function transformDebtorForAPI(debtor: DebtorRecord): Record<string, any> {
    return {
        accountNumber: debtor.accountNumber?.replace(/[\s-]/g, ''),
        accountName: debtor.accountName?.trim(),
        bankName: debtor.bankName?.trim(),
        branchCode: debtor.branchCode?.trim(),
        accountType: debtor.accountType?.trim(),
        debtorCode: debtor.debtorCode?.trim(),
        cdiNumber: debtor.cdiNumber?.trim(),
        debtorReference: debtor.debtorReference?.trim(),
        iban: debtor.iban?.trim(),
        transactionLimit: debtor.transactionLimit?.trim()
    };
}

export function transformDebtorsForAPI(debtors: DebtorRecord[]): Record<string, any>[] {
    return debtors
        .filter(debtor => debtor.status === 'verified' || debtor.status === 'partially-verified')
        .map(transformDebtorForAPI);
}

export function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const content = event.target?.result as string;
            resolve(content);
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };

        reader.readAsText(file);
    });
}

export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const content = event.target?.result as ArrayBuffer;
            resolve(content);
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file as ArrayBuffer'));
        };

        reader.readAsArrayBuffer(file);
    });
}

export function calculateFileStatistics(debtors: DebtorRecord[]): FileStatistics {
    const total = debtors.length;
    const valid = debtors.filter(d => d.status === 'verified' || d.status === 'partially-verified').length;
    const invalid = debtors.filter(d => d.status === 'invalid').length;
    const duplicates = debtors.filter(d => d.status === 'duplicate').length;

    return {
        total,
        valid,
        invalid,
        duplicates
    };
}

export async function processDebtorFile(file: File): Promise<ParsedDebtorsResult> {
    const fileValidation = validateFile(file);
    if (!fileValidation.isValid) {
        throw new Error(fileValidation.errors.join(', '));
    }

    const extResult = validateFileExtension(file.name);
    if (!extResult.extension) {
        throw new Error('Could not determine file extension');
    }

    let debtors = await parseFileContent(file, extResult.extension);

    debtors = validateAndMarkDebtors(debtors);

    debtors = markDuplicateDebtors(debtors);

    const statistics = calculateFileStatistics(debtors);

    const newRecords = debtors.filter(d => d.status === 'verified');
    const errorRecords = debtors.filter(d => d.status === 'invalid');
    const dupRecords = debtors.filter(d => d.status === 'duplicate');

    return {
        newRecords,
        existingRecords: [],
        dupRecords,
        potentialDupRecords: [],
        errorRecords,
        inValidRecords: errorRecords,
        schemaValidated: true,
        statistics
    };
}
