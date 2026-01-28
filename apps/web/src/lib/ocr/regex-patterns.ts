export const PATTERNS = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  phone: /(?:\+?82[-.\s]?|0)(?:1[0-9]|2|3[1-3]|4[1-4]|5[1-5]|6[1-4])[-.\s]?\d{3,4}[-.\s]?\d{4}/g,
  fax: /(?:FAX|Fax|fax|F|팩스)[:\s]*(?:\+?82[-.\s]?|0)(?:2|3[1-3]|4[1-4]|5[1-5]|6[1-4])[-.\s]?\d{3,4}[-.\s]?\d{4}/gi,
  url: /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(?:\.[a-zA-Z]{2,})+(?:\/[^\s]*)?/gi,
  address: /(?:서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)(?:특별시|광역시|특별자치시|도|특별자치도)?[\s]?.+?(?:\d{1,5}[-\s]?\d{0,5}|\d{5})/g,
};

export function extractEmails(text: string): string[] {
  return [...new Set(text.match(PATTERNS.email) || [])];
}

export function extractPhones(text: string): string[] {
  const faxMatches = text.match(PATTERNS.fax) || [];
  const allPhones = text.match(PATTERNS.phone) || [];
  const faxNumbers = faxMatches.map(f => f.replace(/(?:FAX|Fax|fax|F|팩스)[:\s]*/i, "").trim());
  return [...new Set(allPhones.filter(p => !faxNumbers.some(f => p.includes(f))))];
}

export function extractFaxes(text: string): string[] {
  const matches = text.match(PATTERNS.fax) || [];
  return [...new Set(matches.map(f => f.replace(/(?:FAX|Fax|fax|F|팩스)[:\s]*/i, "").trim()))];
}

export function extractUrls(text: string): string[] {
  const emails = extractEmails(text);
  const urls = text.match(PATTERNS.url) || [];
  return [...new Set(urls.filter(u => !emails.some(e => u.includes(e))))];
}

export function extractAddresses(text: string): string[] {
  return [...new Set(text.match(PATTERNS.address) || [])];
}
