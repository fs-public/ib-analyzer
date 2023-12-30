import { isValueLastInSet } from "../src/utils"

describe("isValueLastInSet", () => {
  it("gives true when it should", () => {
    expect(isValueLastInSet(4, new Set([1, 2, 3, 4, 3, 2, 1]))).toEqual(true)
    expect(isValueLastInSet("baz", new Set(["foo", "bar", "baz"]))).toEqual(true)
  })
  it("gives false when it should", () => {
    expect(isValueLastInSet(1, new Set([1, 2, 3, 4, 3, 2, 1]))).toEqual(false)
    expect(isValueLastInSet("bar", new Set(["foo", "bar", "baz"]))).toEqual(false)
  })
})
