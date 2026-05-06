export function cx(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(timestamp: number | string): string {
  if (!timestamp) return '';
  
  const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) : timestamp);
  
  if (isNaN(date.getTime())) return '';
  
  const day = String(date.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getMonth()];
  const year = String(date.getFullYear()).slice(-2);
  
  return `${day}-${month}-${year}`;
}

/**
 * Format timestamp to time string (HH:MM:SS)
 */
export function formatTime(timestamp: number | string): string {
  if (!timestamp) return '';
  
  const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) : timestamp);
  
  if (isNaN(date.getTime())) return '';
  
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Format timestamp to date string (Month Day, Year)
 * Example: March 26, 2026
 */
export function formatDateLong(timestamp: number | string): string {
  if (!timestamp) return '';
  
  const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) : timestamp);
  
  if (isNaN(date.getTime())) return '';
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  return `${month} ${day}, ${year}`;
}
