import { describe, expect, it } from "vitest";
import { roundCashAmount } from "../../../../src/commerce/cash/utils/round-cash-amount.js";

describe("roundCashAmount", () => {
  it("no redondea cuando unit es 0", () => {
    expect(roundCashAmount(123.37, 0)).toBe(123.37);
  });

  it("no redondea cuando unit es negativa", () => {
    expect(roundCashAmount(123.37, -1)).toBe(123.37);
  });

  it("redondea al múltiplo de 0.50 más cercano", () => {
    expect(roundCashAmount(123.2, 0.5)).toBe(123);
    expect(roundCashAmount(123.3, 0.5)).toBe(123.5);
    expect(roundCashAmount(123.75, 0.5)).toBe(124);
  });

  it("redondea al entero más cercano cuando unit es 1", () => {
    expect(roundCashAmount(100.4, 1)).toBe(100);
    expect(roundCashAmount(100.5, 1)).toBe(101);
  });

  it("no introduce errores de punto flotante", () => {
    expect(roundCashAmount(10.1, 0.5)).toBe(10);
    expect(roundCashAmount(0.3, 0.1)).toBe(0.3);
  });
});
