import { describe, expect, it } from "bun:test";
import { reviewVisibility } from "./bm-store";

describe("review visibility", () => {
  it("4 and 5 stars are public", () => { expect(reviewVisibility(4)).toBe("public"); expect(reviewVisibility(5)).toBe("public"); });
  it("1 to 3 stars are private for admin", () => { expect(reviewVisibility(3)).toBe("private"); expect(reviewVisibility(1)).toBe("private"); });
});
