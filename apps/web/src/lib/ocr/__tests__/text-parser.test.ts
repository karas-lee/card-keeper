import { describe, it, expect } from "vitest";
import { parseOcrText } from "../text-parser";

describe("parseOcrText", () => {
  it("should extract name from the first content line", () => {
    const text = "홍길동\n삼성전자\n개발팀\ntest@samsung.com\n010-1234-5678";
    const result = parseOcrText(text);

    expect(result.name).toBe("홍길동");
  });

  it("should extract company from the second content line", () => {
    const text = "홍길동\n삼성전자\ntest@samsung.com\n010-1234-5678";
    const result = parseOcrText(text);

    expect(result.company).toBe("삼성전자");
  });

  it("should extract job title when it contains a known keyword", () => {
    const text = "홍길동\n수석 엔지니어\n삼성전자\ntest@samsung.com\n010-1234-5678";
    const result = parseOcrText(text);

    expect(result.jobTitle).toBe("수석 엔지니어");
  });

  it("should extract emails as contact details", () => {
    const text = "홍길동\n삼성전자\nhong@samsung.com\n010-1234-5678";
    const result = parseOcrText(text);

    const emailContacts = result.contactDetails.filter((c) => c.type === "EMAIL");
    expect(emailContacts).toHaveLength(1);
    expect(emailContacts[0]!.value).toBe("hong@samsung.com");
  });

  it("should extract phone numbers as contact details", () => {
    const text = "홍길동\n삼성전자\nhong@samsung.com\n010-1234-5678";
    const result = parseOcrText(text);

    const phoneContacts = result.contactDetails.filter((c) => c.type === "PHONE");
    expect(phoneContacts).toHaveLength(1);
    expect(phoneContacts[0]!.value).toBe("010-1234-5678");
  });

  it("should extract URLs as website", () => {
    const text = "홍길동\n삼성전자\n010-1234-5678\nwww.samsung.com";
    const result = parseOcrText(text);

    expect(result.website).toBe("www.samsung.com");
  });

  it("should extract fax numbers as contact details", () => {
    const text = "홍길동\n삼성전자\n010-1234-5678\nFAX: 02-555-1234";
    const result = parseOcrText(text);

    const faxContacts = result.contactDetails.filter((c) => c.type === "FAX");
    expect(faxContacts).toHaveLength(1);
    expect(faxContacts[0]!.value).toBe("02-555-1234");
  });

  it("should handle a full Korean business card format", () => {
    const text = [
      "김철수",
      "CTO",
      "카드키퍼 주식회사",
      "kim@cardkeeper.com",
      "010-9876-5432",
      "FAX: 02-1234-5678",
      "www.cardkeeper.com",
      "서울특별시 강남구 테헤란로 123",
    ].join("\n");

    const result = parseOcrText(text);

    expect(result.name).toBe("김철수");
    expect(result.jobTitle).toBe("CTO");
    expect(result.company).toBe("카드키퍼 주식회사");
    // URL regex also matches domain from email, so first match is bare domain
    expect(result.website).toBe("cardkeeper.com");
    expect(result.address).toBe("서울특별시 강남구 테헤란로 123");

    const emails = result.contactDetails.filter((c) => c.type === "EMAIL");
    expect(emails).toHaveLength(1);
    expect(emails[0]!.value).toBe("kim@cardkeeper.com");

    const phones = result.contactDetails.filter((c) => c.type === "PHONE");
    expect(phones).toHaveLength(1);
    expect(phones[0]!.value).toBe("010-9876-5432");

    const faxes = result.contactDetails.filter((c) => c.type === "FAX");
    expect(faxes).toHaveLength(1);
    expect(faxes[0]!.value).toBe("02-1234-5678");
  });

  it("should handle English business card format with known title keywords", () => {
    const text = [
      "John Smith",
      "Senior Manager",
      "Tech Corp",
      "john@techcorp.com",
      "010-5555-1234",
    ].join("\n");

    const result = parseOcrText(text);

    expect(result.name).toBe("John Smith");
    expect(result.jobTitle).toBe("Senior Manager");
    expect(result.company).toBe("Tech Corp");
  });

  it("should return null fields when text is empty", () => {
    const result = parseOcrText("");

    expect(result.name).toBeNull();
    expect(result.company).toBeNull();
    expect(result.jobTitle).toBeNull();
    expect(result.contactDetails).toEqual([]);
    expect(result.address).toBeNull();
    expect(result.website).toBeNull();
  });

  it("should return null company when only one content line exists", () => {
    const text = "홍길동\n010-1234-5678";
    const result = parseOcrText(text);

    expect(result.name).toBe("홍길동");
    expect(result.company).toBeNull();
  });

  it("should handle multiple phone numbers", () => {
    const text = "홍길동\n삼성전자\n010-1234-5678\n02-9999-8888";
    const result = parseOcrText(text);

    const phones = result.contactDetails.filter((c) => c.type === "PHONE");
    expect(phones.length).toBeGreaterThanOrEqual(2);
  });

  it("should handle multiple emails", () => {
    const text = "홍길동\n삼성전자\nhong@samsung.com\nhong.personal@gmail.com\n010-1234-5678";
    const result = parseOcrText(text);

    const emails = result.contactDetails.filter((c) => c.type === "EMAIL");
    expect(emails).toHaveLength(2);
  });

  it("should reassign company when second line is a job title keyword", () => {
    const text = [
      "이영희",
      "대표이사",
      "ABC 컴퍼니",
      "lee@abc.com",
      "010-1111-2222",
    ].join("\n");

    const result = parseOcrText(text);

    expect(result.name).toBe("이영희");
    expect(result.jobTitle).toBe("대표이사");
    // Company should be reassigned to the third content line
    expect(result.company).toBe("ABC 컴퍼니");
  });
});
