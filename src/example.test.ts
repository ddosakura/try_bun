import { expect, test } from "bun:test";

import { random } from "macros" assert { type: "macro" };
import { A_NUMBER, getNumber } from "funcs";

test("example", () => {
  expect(A_NUMBER).toBe(A_NUMBER);
  expect(getNumber()).toBe(getNumber());
  expect(random()).not.toEqual(random());
});
