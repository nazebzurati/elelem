import { expect, test } from "vitest";
import { getChatListByRefId } from "../src/database/chat";
import { tree1, tree2, tree3 } from "./fixtures/chat";

test("1", () => {
  const data = getChatListByRefId(tree1);
  expect(data.map((d) => d.id)).toStrictEqual([1, 6, 7]);
});

test("2", () => {
  const data = getChatListByRefId(tree1, 2);
  expect(data.map((d) => d.id)).toStrictEqual([1, 2, 3, 4, 5]);
});

test("3", () => {
  const data = getChatListByRefId(tree2);
  expect(data.map((d) => d.id)).toStrictEqual([1, 4, 7]);
});

test("4", () => {
  const data = getChatListByRefId(tree2, 2);
  expect(data.map((d) => d.id)).toStrictEqual([1, 2, 3]);
});

test("5", () => {
  const data = getChatListByRefId(tree2, 5);
  expect(data.map((d) => d.id)).toStrictEqual([1, 4, 5, 6]);
});

test("6", () => {
  const data = getChatListByRefId(tree3);
  expect(data.map((d) => d.id)).toStrictEqual([1, 4, 5, 10, 11, 14]);
});

test("7", () => {
  const data = getChatListByRefId(tree3, 8);
  expect(data.map((d) => d.id)).toStrictEqual([1, 4, 5, 8, 9, 13]);
});

test("8", () => {
  const data = getChatListByRefId(tree3, 6);
  expect(data.map((d) => d.id)).toStrictEqual([1, 4, 5, 6, 7, 12]);
});

test("9", () => {
  const data = getChatListByRefId(tree3, 2);
  expect(data.map((d) => d.id)).toStrictEqual([1, 2, 3]);
});
