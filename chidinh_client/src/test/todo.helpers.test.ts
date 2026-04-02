import {
  APP_TIME_ZONE,
  dateInputToIsoInAppZone,
  formatDateInputInAppZone,
} from "../modules/todo/todoDate";
import { addUniqueTags, parseTagInput } from "../modules/todo/todoTags";

describe("todo helpers", () => {
  it("merges tags without duplicates and normalizes inputs", () => {
    expect(parseTagInput(" Work,deep , WORK ")).toEqual(["work", "deep", "work"]);
    expect(addUniqueTags(["work"], ["work", "deep"])).toEqual(["work", "deep"]);
  });

  it("round-trips date input in app timezone", () => {
    expect(APP_TIME_ZONE).toBe("Asia/Ho_Chi_Minh");

    const iso = dateInputToIsoInAppZone("2026-04-03");
    expect(iso).toBe("2026-04-02T17:00:00.000Z");
    expect(formatDateInputInAppZone(iso ?? null)).toBe("2026-04-03");
  });
});
