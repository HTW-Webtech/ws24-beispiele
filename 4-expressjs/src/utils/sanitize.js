// HTML entity encoding map
const htmlEntities = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

// Regex to match HTML entities
const entityRegex = new RegExp(`[${Object.keys(htmlEntities).join('')}]`, 'g');

// Sanitize a single string
export function sanitizeString(str){
  if (typeof str !== 'string') return '';
  return str.replace(entityRegex, (match) => htmlEntities[match]).trim();
}

// Sanitize an array of strings
export function sanitizeArray(arr){
  if (!Array.isArray(arr)) return [];
  return arr.map(sanitizeString).filter(Boolean);
}
