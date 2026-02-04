import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { encrypt, decrypt, maskApiKey } from "@/lib/crypto/encryption";
import { randomBytes } from "crypto";

const VALID_KEY = randomBytes(32).toString("hex");

function withEncryptionKey(key: string | undefined, fn: () => void) {
  const original = process.env.ENCRYPTION_KEY;
  process.env.ENCRYPTION_KEY = key;
  try {
    fn();
  } finally {
    process.env.ENCRYPTION_KEY = original;
  }
}

beforeEach(() => {
  process.env.ENCRYPTION_KEY = VALID_KEY;
});

afterEach(() => {
  delete process.env.ENCRYPTION_KEY;
});

describe("encrypt and decrypt", () => {
  it("should round-trip a plaintext string", () => {
    const plaintext = "AIzaSyD-test-key-1234567890";
    const encrypted = encrypt(plaintext);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("should round-trip a long string", () => {
    const plaintext = "a".repeat(500);
    const encrypted = encrypt(plaintext);
    expect(decrypt(encrypted)).toBe(plaintext);
  });

  it("should round-trip unicode characters", () => {
    const plaintext = "key-with-émojis-🔑";
    const encrypted = encrypt(plaintext);
    expect(decrypt(encrypted)).toBe(plaintext);
  });

  it("should produce different ciphertexts for the same plaintext (random IV)", () => {
    const plaintext = "AIzaSyD-test-key-1234567890";
    const encrypted1 = encrypt(plaintext);
    const encrypted2 = encrypt(plaintext);
    expect(encrypted1).not.toBe(encrypted2);

    expect(decrypt(encrypted1)).toBe(plaintext);
    expect(decrypt(encrypted2)).toBe(plaintext);
  });

  it("should produce output in iv:authTag:ciphertext hex format", () => {
    const encrypted = encrypt("test");
    const parts = encrypted.split(":");
    expect(parts).toHaveLength(3);

    const [iv, authTag, ciphertext] = parts;
    expect(iv).toMatch(/^[0-9a-f]{24}$/);
    expect(authTag).toMatch(/^[0-9a-f]{32}$/);
    expect(ciphertext.length).toBeGreaterThan(0);
    expect(ciphertext).toMatch(/^[0-9a-f]+$/);
  });
});

describe("decrypt error handling", () => {
  it("should throw on tampered ciphertext", () => {
    const encrypted = encrypt("test-key");
    const parts = encrypted.split(":");
    const tampered = parts[2]!.replace(
      parts[2]![0]!,
      parts[2]![0] === "0" ? "1" : "0"
    );
    const tamperedString = `${parts[0]}:${parts[1]}:${tampered}`;

    expect(() => decrypt(tamperedString)).toThrow();
  });

  it("should throw on tampered auth tag", () => {
    const encrypted = encrypt("test-key");
    const parts = encrypted.split(":");
    const tampered = parts[1]!.replace(
      parts[1]![0]!,
      parts[1]![0] === "0" ? "1" : "0"
    );
    const tamperedString = `${parts[0]}:${tampered}:${parts[2]}`;

    expect(() => decrypt(tamperedString)).toThrow();
  });

  it("should throw on tampered IV", () => {
    const encrypted = encrypt("test-key");
    const parts = encrypted.split(":");
    const tampered = parts[0]!.replace(
      parts[0]![0]!,
      parts[0]![0] === "0" ? "1" : "0"
    );
    const tamperedString = `${tampered}:${parts[1]}:${parts[2]}`;

    expect(() => decrypt(tamperedString)).toThrow();
  });

  it("should throw on invalid format (missing parts)", () => {
    expect(() => decrypt("onlyonepart")).toThrow("Invalid encrypted string format");
  });

  it("should throw on invalid format (two parts)", () => {
    expect(() => decrypt("part1:part2")).toThrow("Invalid encrypted string format");
  });

  it("should throw on empty string", () => {
    expect(() => decrypt("")).toThrow("Invalid encrypted string format");
  });
});

describe("getEncryptionKey validation", () => {
  it("should throw when ENCRYPTION_KEY is missing", () => {
    withEncryptionKey(undefined, () => {
      expect(() => encrypt("test")).toThrow(
        "ENCRYPTION_KEY must be a 64-character hex string (256 bits)"
      );
    });
  });

  it("should throw when ENCRYPTION_KEY is empty string", () => {
    withEncryptionKey("", () => {
      expect(() => encrypt("test")).toThrow(
        "ENCRYPTION_KEY must be a 64-character hex string (256 bits)"
      );
    });
  });

  it("should throw when ENCRYPTION_KEY is too short", () => {
    withEncryptionKey("abcdef1234", () => {
      expect(() => encrypt("test")).toThrow(
        "ENCRYPTION_KEY must be a 64-character hex string (256 bits)"
      );
    });
  });

  it("should throw when ENCRYPTION_KEY is too long", () => {
    withEncryptionKey("a".repeat(65), () => {
      expect(() => encrypt("test")).toThrow(
        "ENCRYPTION_KEY must be a 64-character hex string (256 bits)"
      );
    });
  });

  it("should throw when decrypting with missing ENCRYPTION_KEY", () => {
    const encrypted = encrypt("test");
    withEncryptionKey(undefined, () => {
      expect(() => decrypt(encrypted)).toThrow(
        "ENCRYPTION_KEY must be a 64-character hex string (256 bits)"
      );
    });
  });

  it("should fail to decrypt with a different key", () => {
    const encrypted = encrypt("test-key");
    const differentKey = randomBytes(32).toString("hex");
    withEncryptionKey(differentKey, () => {
      expect(() => decrypt(encrypted)).toThrow();
    });
  });
});

describe("maskApiKey", () => {
  it("should mask a typical Gemini API key", () => {
    expect(maskApiKey("AIzaSyD-1234567890abcdefg")).toBe("****defg");
  });

  it("should mask a key showing last 4 characters", () => {
    expect(maskApiKey("abcdefghij")).toBe("****ghij");
  });

  it("should return **** for keys with 4 or fewer characters", () => {
    expect(maskApiKey("abcd")).toBe("****");
    expect(maskApiKey("abc")).toBe("****");
    expect(maskApiKey("a")).toBe("****");
  });

  it("should return **** for empty string", () => {
    expect(maskApiKey("")).toBe("****");
  });

  it("should handle exactly 5 characters", () => {
    expect(maskApiKey("abcde")).toBe("****bcde");
  });
});
