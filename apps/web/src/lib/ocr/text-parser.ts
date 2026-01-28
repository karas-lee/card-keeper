import type { ContactType } from "@cardkeeper/shared-types";
import { extractEmails, extractPhones, extractFaxes, extractUrls, extractAddresses } from "./regex-patterns";

interface ParsedContact {
  type: ContactType;
  value: string;
}

export interface ParsedCardData {
  name: string | null;
  company: string | null;
  jobTitle: string | null;
  contactDetails: ParsedContact[];
  address: string | null;
  website: string | null;
}

export function parseOcrText(rawText: string): ParsedCardData {
  const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean);

  const emails = extractEmails(rawText);
  const phones = extractPhones(rawText);
  const faxes = extractFaxes(rawText);
  const urls = extractUrls(rawText);
  const addresses = extractAddresses(rawText);

  const contactDetails: ParsedContact[] = [
    ...phones.map(value => ({ type: "PHONE" as ContactType, value })),
    ...emails.map(value => ({ type: "EMAIL" as ContactType, value })),
    ...faxes.map(value => ({ type: "FAX" as ContactType, value })),
  ];

  // Heuristic: first line is often the name, second line is company
  // Lines containing common job titles
  const jobTitleKeywords = ["대표", "사장", "이사", "부장", "과장", "대리", "사원", "팀장", "실장", "매니저", "엔지니어", "디자이너", "개발", "CTO", "CEO", "CFO", "COO", "VP", "Director", "Manager", "Engineer", "Designer", "Developer"];

  let name: string | null = null;
  let company: string | null = null;
  let jobTitle: string | null = null;

  // Filter out lines that are contact info
  const contactStrings = [...emails, ...phones, ...faxes, ...urls, ...addresses];
  const contentLines = lines.filter(line =>
    !contactStrings.some(c => line.includes(c))
  );

  if (contentLines.length >= 1) {
    name = contentLines[0] || null;
  }
  if (contentLines.length >= 2) {
    company = contentLines[1] || null;
  }

  // Look for job title in remaining lines
  for (const line of contentLines.slice(1)) {
    if (jobTitleKeywords.some(k => line.includes(k))) {
      jobTitle = line;
      if (company === line) {
        company = contentLines[2] || null;
      }
      break;
    }
  }

  return {
    name,
    company,
    jobTitle,
    contactDetails,
    address: addresses[0] || null,
    website: urls[0] || null,
  };
}
