import { describe, expect, it } from "vitest";
import { nameTaken, nextTableName } from "./tableNames";

describe("table names", () => {
  it("skips names already on the floor", () => {
    expect(nextTableName([{ name: "Table 1" }, { name: "Table 2" }])).toBe("Table 3");
    // Table 2 was removed, leaving Table 1 and Table 3: the default must not repeat "Table 3".
    expect(nextTableName([{ name: "Table 1" }, { name: "table 3 " }])).toBe("Table 4");
  });

  it("detects clashes ignoring case and spaces, but not with itself", () => {
    const tables = [{ id: "a", name: "Booth 1" }, { id: "b", name: "Table 2" }];
    expect(nameTaken(tables, "  booth 1 ")).toBe(true);
    expect(nameTaken(tables, "Booth 1", "a")).toBe(false);
    expect(nameTaken(tables, "Booth 2")).toBe(false);
  });
});
