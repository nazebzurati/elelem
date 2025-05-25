import { expect, test } from "vitest";
import { getBranch, tree1, tree2, tree3 } from "./fixtures/chat";

test("1", () => {
  const data = getBranch(tree1);
  expect(data.map((d) => d.id)).toStrictEqual([1, 6, 7]);
});

test("2", () => {
  const data = getBranch(tree1, 2);
  expect(data.map((d) => d.id)).toStrictEqual([1, 2, 3, 4, 5]);
});

test("3", () => {
  const data = getBranch(tree2);
  expect(data.map((d) => d.id)).toStrictEqual([1, 4, 7]);
});

test("4", () => {
  const data = getBranch(tree2, 2);
  expect(data.map((d) => d.id)).toStrictEqual([1, 2, 3]);
});

test("5", () => {
  const data = getBranch(tree2, 5);
  expect(data.map((d) => d.id)).toStrictEqual([1, 4, 5, 6]);
});

test("6", () => {
  const data = getBranch(tree3);
  expect(data.map((d) => d.id)).toStrictEqual([1, 4, 5, 10, 11, 14]);
});

test("7", () => {
  const data = getBranch(tree3, 8);
  expect(data.map((d) => d.id)).toStrictEqual([1, 4, 5, 8, 9, 13]);
});

test("8", () => {
  const data = getBranch(tree3, 6);
  expect(data.map((d) => d.id)).toStrictEqual([1, 4, 5, 6, 7, 12]);
});

test("9", () => {
  const data = getBranch(tree3, 2);
  expect(data.map((d) => d.id)).toStrictEqual([1, 2, 3]);
});
