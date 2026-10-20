import { describe, expect, it } from "vitest";
import type { Bill } from "@/types/pos";
import { computeBill } from "./billing";
import { billsToCsv, csvCell, CSV_COLUMNS } from "./export";

describe("csvCell", () => {
  it("leaves plain values alone", () => expect(csvCell("Table 1")).toBe("Table 1"));
  it("quotes commas, quotes and newlines", () => {
    expect(csvCell("Booth 1, Lounge")).toBe('"Booth 1, Lounge"');
    expect(csvCell('The "VIP" table')).toBe('"The ""VIP"" table"');
    expect(csvCell("a\nb")).toBe('"a\nb"');
  });
});

describe("billsToCsv", () => {
  const bill: Bill = {
    id: "1",
    number: "INV-20261019-0001",
    tableId: "T9",
    tableName: "Booth 1, Lounge",
    guests: 3,
    createdAt: new Date(2026, 9, 19, 20, 5).getTime(),
    payment: "UPI",
    cart: [{ itemId: "paneer-tikka", qty: 2 }],
    totals: computeBill([{ itemId: "paneer-tikka", qty: 2 }]),
  };

  it("writes a header and one row per bill with GST columns", () => {
    const [header, row] = billsToCsv([bill]).split("\r\n");
    expect(header).toBe(CSV_COLUMNS.join(","));
    expect(row).toBe('INV-20261019-0001,2026-10-19,20:05,"Booth 1, Lounge",3,UPI,2,560.00,0.00,560.00,14.00,14.00,0.00,588.00,Paid');
  });

  it("marks voided bills with their reason", () => {
    const row = billsToCsv([{ ...bill, voided: { at: 0, reason: "wrong table, re-billed" } }]).split("\r\n")[1];
    expect(row.endsWith(',"Void: wrong table, re-billed"')).toBe(true);
  });
});
