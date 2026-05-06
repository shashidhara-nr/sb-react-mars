/**
 * File utility functions for file handling and conversion
 */

/**
 * Converts a File object to Base64 encoded string
 * @param file - File to convert
 * @returns Promise that resolves to base64 encoded string (without data URI prefix)
 */
export function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URI prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    
    reader.onerror = (error) => {
      reject(new Error(`Failed to read file: ${error}`));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Gets file extension from filename
 * @param filename - Name of the file
 * @returns File extension without the dot (e.g., 'pdf', 'csv')
 */
export function getFileExtension(filename: string): string {
  const extension = filename.split('.').pop();
  return extension ? extension.toLowerCase() : '';
}

/**
 * Gets file format suitable for API (csv, pdf, etc.)
 * @param file - File object
 * @returns File format string
 */
export function getFileFormat(file: File): string {
  return getFileExtension(file.name);
}

/**
 * Validates if file is of allowed type
 * @param file - File to validate
 * @param allowedExtensions - Array of allowed extensions
 * @returns True if file is valid
 */
export function isValidFileType(file: File, allowedExtensions: string[]): boolean {
  const extension = getFileExtension(file.name);
  return allowedExtensions.includes(extension);
}

/**
 * Formats bytes to human readable size
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
