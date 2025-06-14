import { expect, test } from "vitest";
import { getChatListByRefId } from "../src/database/chat";
import { tree1, tree2, tree3 } from "./fixtures/chat";

test("Should return latest chat tree when refId is undefined", () => {
  const data = getChatListByRefId(tree1);
  expect(data.map((d) => d.id)).toStrictEqual([1, 6, 7]);
});

test("Should return chat tree defined by refId", () => {
  const data = getChatListByRefId(tree1, 2);
  expect(data.map((d) => d.id)).toStrictEqual([1, 2, 3, 4, 5]);
});

test("Should return latest chat tree when refId is undefined", () => {
  const data = getChatListByRefId(tree2);
  expect(data.map((d) => d.id)).toStrictEqual([1, 4, 7]);
});

test("Should return chat tree defined by refId (point 1)", () => {
  const data = getChatListByRefId(tree2, 2);
  expect(data.map((d) => d.id)).toStrictEqual([1, 2, 3]);
});

test("Should return chat tree defined by refId (point 2)", () => {
  const data = getChatListByRefId(tree2, 5);
  expect(data.map((d) => d.id)).toStrictEqual([1, 4, 5, 6]);
});

test("Should return latest chat tree when refId is undefined", () => {
  const data = getChatListByRefId(tree3);
  expect(data.map((d) => d.id)).toStrictEqual([1, 4, 5, 10, 11, 14]);
});

test("Should return chat tree defined by refId (point 1)", () => {
  const data = getChatListByRefId(tree3, 8);
  expect(data.map((d) => d.id)).toStrictEqual([1, 4, 5, 8, 9, 13]);
});

test("Should return chat tree defined by refId (point 2)", () => {
  const data = getChatListByRefId(tree3, 6);
  expect(data.map((d) => d.id)).toStrictEqual([1, 4, 5, 6, 7, 12]);
});

test("Should return chat tree defined by refId (point 3)", () => {
  const data = getChatListByRefId(tree3, 2);
  expect(data.map((d) => d.id)).toStrictEqual([1, 2, 3]);
});
