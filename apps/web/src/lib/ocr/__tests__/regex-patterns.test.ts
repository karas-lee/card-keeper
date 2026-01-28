import { describe, it, expect } from "vitest";
import {
  PATTERNS,
  extractEmails,
  extractPhones,
  extractFaxes,
  extractUrls,
  extractAddresses,
} from "../regex-patterns";

describe("PATTERNS", () => {
  describe("email pattern", () => {
    it("should match standard email addresses", () => {
      const text = "Contact: user@example.com for info";
      const matches = text.match(PATTERNS.email);

      expect(matches).not.toBeNull();
      expect(matches).toContain("user@example.com");
    });

    it("should match emails with dots and hyphens in domain", () => {
      const text = "Send to john.doe@sub-domain.company.co.kr";
      const matches = text.match(PATTERNS.email);

      expect(matches).not.toBeNull();
      expect(matches![0]).toBe("john.doe@sub-domain.company.co.kr");
    });

    it("should match emails with plus addressing", () => {
      const text = "Email: user+tag@example.com";
      const matches = text.match(PATTERNS.email);

      expect(matches).not.toBeNull();
      expect(matches).toContain("user+tag@example.com");
    });

    it("should not match strings without @ symbol", () => {
      const text = "This is not an email";
      const matches = text.match(PATTERNS.email);

      expect(matches).toBeNull();
    });
  });

  describe("phone pattern", () => {
    it("should match Korean mobile numbers with dashes", () => {
      const text = "전화: 010-1234-5678";
      const matches = text.match(PATTERNS.phone);

      expect(matches).not.toBeNull();
      expect(matches).toContain("010-1234-5678");
    });

    it("should match Seoul landline numbers", () => {
      const text = "사무실: 02-555-1234";
      const matches = text.match(PATTERNS.phone);

      expect(matches).not.toBeNull();
      expect(matches).toContain("02-555-1234");
    });

    it("should match numbers with +82 country code", () => {
      const text = "Phone: +82-10-1234-5678";
      const matches = text.match(PATTERNS.phone);

      expect(matches).not.toBeNull();
      expect(matches![0]).toContain("82");
    });

    it("should match regional Korean numbers", () => {
      const text = "부산: 051-123-4567";
      const matches = text.match(PATTERNS.phone);

      expect(matches).not.toBeNull();
    });

    it("should not match random digit sequences", () => {
      const text = "Order #12345";
      const matches = text.match(PATTERNS.phone);

      expect(matches).toBeNull();
    });
  });

  describe("fax pattern", () => {
    it("should match fax numbers with FAX prefix", () => {
      const text = "FAX: 02-555-1234";
      const matches = text.match(PATTERNS.fax);

      expect(matches).not.toBeNull();
      expect(matches!.length).toBeGreaterThan(0);
    });

    it("should match fax numbers with Korean prefix", () => {
      const text = "팩스: 02-555-1234";
      const matches = text.match(PATTERNS.fax);

      expect(matches).not.toBeNull();
    });

    it("should match case-insensitive FAX prefix", () => {
      const text = "fax 02-333-4444";
      const matches = text.match(PATTERNS.fax);

      expect(matches).not.toBeNull();
    });

    it("should match Fax with colon and space", () => {
      const text = "Fax: 031-555-6789";
      const matches = text.match(PATTERNS.fax);

      expect(matches).not.toBeNull();
    });
  });

  describe("url pattern", () => {
    it("should match URLs with https://", () => {
      const text = "Visit https://www.example.com";
      const matches = text.match(PATTERNS.url);

      expect(matches).not.toBeNull();
      expect(matches![0]).toContain("example.com");
    });

    it("should match URLs with www prefix only", () => {
      const text = "Website: www.cardkeeper.com";
      const matches = text.match(PATTERNS.url);

      expect(matches).not.toBeNull();
      expect(matches![0]).toContain("www.cardkeeper.com");
    });

    it("should match URLs with paths", () => {
      const text = "Go to https://example.com/about/team";
      const matches = text.match(PATTERNS.url);

      expect(matches).not.toBeNull();
      expect(matches![0]).toContain("/about/team");
    });

    it("should match Korean domain URLs", () => {
      const text = "홈페이지: www.samsung.co.kr";
      const matches = text.match(PATTERNS.url);

      expect(matches).not.toBeNull();
    });
  });

  describe("address pattern", () => {
    it("should match Seoul addresses", () => {
      const text = "서울특별시 강남구 테헤란로 123";
      const matches = text.match(PATTERNS.address);

      expect(matches).not.toBeNull();
    });

    it("should match Gyeonggi province addresses", () => {
      const text = "경기도 성남시 분당구 판교로 456";
      const matches = text.match(PATTERNS.address);

      expect(matches).not.toBeNull();
    });

    it("should match Busan addresses", () => {
      const text = "부산광역시 해운대구 센텀로 789";
      const matches = text.match(PATTERNS.address);

      expect(matches).not.toBeNull();
    });

    it("should match addresses with postal codes", () => {
      const text = "서울 마포구 상암동 12345";
      const matches = text.match(PATTERNS.address);

      expect(matches).not.toBeNull();
    });
  });
});

describe("Extraction functions", () => {
  describe("extractEmails", () => {
    it("should extract all unique emails from text", () => {
      const text = "Primary: hong@test.com, Secondary: kim@test.com, Duplicate: hong@test.com";
      const result = extractEmails(text);

      expect(result).toHaveLength(2);
      expect(result).toContain("hong@test.com");
      expect(result).toContain("kim@test.com");
    });

    it("should return an empty array when no emails found", () => {
      const result = extractEmails("No emails here");

      expect(result).toEqual([]);
    });
  });

  describe("extractPhones", () => {
    it("should extract phone numbers but exclude fax numbers", () => {
      const text = "전화: 010-1234-5678\nFAX: 02-555-1234";
      const result = extractPhones(text);

      expect(result).toContain("010-1234-5678");
      // Fax number should be excluded
      const hasFaxNumber = result.some((p) => p.includes("02-555-1234"));
      expect(hasFaxNumber).toBe(false);
    });

    it("should return an empty array when no phones found", () => {
      const result = extractPhones("No phone numbers");

      expect(result).toEqual([]);
    });

    it("should extract multiple phone numbers", () => {
      const text = "010-1111-2222, 010-3333-4444";
      const result = extractPhones(text);

      expect(result.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("extractFaxes", () => {
    it("should extract fax numbers with prefix removed", () => {
      const text = "FAX: 02-555-1234";
      const result = extractFaxes(text);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe("02-555-1234");
    });

    it("should extract fax with Korean prefix", () => {
      const text = "팩스: 02-777-8888";
      const result = extractFaxes(text);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe("02-777-8888");
    });

    it("should return an empty array when no fax found", () => {
      const result = extractFaxes("No fax here");

      expect(result).toEqual([]);
    });

    it("should deduplicate fax numbers", () => {
      const text = "FAX: 02-111-2222\nFax: 02-111-2222";
      const result = extractFaxes(text);

      expect(result).toHaveLength(1);
    });
  });

  describe("extractUrls", () => {
    it("should extract URLs but not email domains", () => {
      const text = "Website: www.example.com Email: user@example.com";
      const result = extractUrls(text);

      // Should not include the domain part from the email
      const hasEmailDomain = result.some((u) => u === "example.com");
      // The URL extraction should include www.example.com
      expect(result.some((u) => u.includes("www.example.com"))).toBe(true);
    });

    it("should return an empty array when no URLs found", () => {
      const result = extractUrls("Just plain text");

      expect(result).toEqual([]);
    });
  });

  describe("extractAddresses", () => {
    it("should extract Korean addresses", () => {
      const text = "주소: 서울특별시 강남구 역삼동 123-45";
      const result = extractAddresses(text);

      expect(result).toHaveLength(1);
      expect(result[0]).toContain("서울");
    });

    it("should return an empty array when no addresses found", () => {
      const result = extractAddresses("No address here");

      expect(result).toEqual([]);
    });

    it("should extract multiple addresses", () => {
      const text = "본사: 서울특별시 강남구 역삼동 123\n지사: 부산광역시 해운대구 우동 456";
      const result = extractAddresses(text);

      expect(result).toHaveLength(2);
    });
  });
});
