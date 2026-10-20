import { describe, expect, it } from "vitest";
import { COOLDOWN_MS, IDLE_LOCK_MS, MAX_ATTEMPTS, cooldownLeft, failAttempt, hashPin, isValidPin, newSalt, safeEqual, stillUnlocked, verifyPin, type Attempts } from "./pin";

describe("PIN format", () => {
  it.each([["1234", true], ["123456", true], ["123", false], ["1234567", false], ["12a4", false], ["", false], [" 1234", false]])("%j → %s", (pin, ok) => {
    expect(isValidPin(pin)).toBe(ok);
  });
});

describe("hashing", () => {
  it("verifies the right PIN and rejects others", async () => {
    const salt = newSalt();
    const stored = { salt, hash: await hashPin("4821", salt) };
    expect(await verifyPin("4821", stored)).toBe(true);
    expect(await verifyPin("4822", stored)).toBe(false);
  });

  it("never stores the PIN itself and salts every hash", async () => {
    const [a, b] = [newSalt(), newSalt()];
    expect(a).not.toBe(b);
    const ha = await hashPin("1234", a);
    expect(ha).not.toContain("1234");
    expect(ha).not.toBe(await hashPin("1234", b));
  });

  it("compares strings exactly", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "ab")).toBe(false);
  });
});

describe("attempt limiting", () => {
  const fresh: Attempts = { count: 0, until: 0 };

  it(`starts a cooldown on the ${MAX_ATTEMPTS}th wrong PIN`, () => {
    let a = fresh;
    for (let i = 1; i < MAX_ATTEMPTS; i++) {
      a = failAttempt(a, 1000);
      expect(a).toEqual({ count: i, until: 0 });
    }
    a = failAttempt(a, 1000);
    expect(cooldownLeft(a, 1000)).toBe(COOLDOWN_MS);
    expect(cooldownLeft(a, 1000 + COOLDOWN_MS)).toBe(0);
  });

  it("starts counting again from one after a cooldown ends", () => {
    const cooled: Attempts = { count: 0, until: 5000 };
    expect(failAttempt(cooled, 6000)).toEqual({ count: 1, until: 0 });
  });
});

describe("idle lock", () => {
  it("stays unlocked only while activity is recent", () => {
    expect(stillUnlocked(null, 0)).toBe(false);
    expect(stillUnlocked(0, IDLE_LOCK_MS - 1)).toBe(true);
    expect(stillUnlocked(0, IDLE_LOCK_MS)).toBe(false);
  });
});
