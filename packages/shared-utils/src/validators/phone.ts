const PHONE_REGEX = /^(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}$/;
const KOREAN_MOBILE_PREFIXES = ["010", "011", "016", "017", "018", "019"];

export function isValidPhone(phone: string): boolean {
  return PHONE_REGEX.test(phone.trim());
}

export function isKoreanMobile(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return KOREAN_MOBILE_PREFIXES.some((prefix) => digits.startsWith(prefix));
}
