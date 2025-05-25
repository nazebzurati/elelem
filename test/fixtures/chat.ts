type Node = { id: number; parentId?: number };

// 1 -> 6 -> 7
// 1 -> 2 -> 3 -> 4 -> 5

export const tree1: Node[] = [
  { id: 1, parentId: undefined },
  { id: 2, parentId: 1 },
  { id: 3, parentId: 2 },
  { id: 4, parentId: 3 },
  { id: 5, parentId: 4 },
  { id: 6, parentId: 1 },
  { id: 7, parentId: 6 },
];

// 1 -> 4 -> 7
// 1 -> 4 -> 5 -> 6
// 1 -> 2 -> 3

export const tree2: Node[] = [
  { id: 1, parentId: undefined },
  { id: 2, parentId: 1 },
  { id: 3, parentId: 2 },
  { id: 4, parentId: 1 },
  { id: 5, parentId: 4 },
  { id: 6, parentId: 5 },
  { id: 7, parentId: 4 },
];

// 1 -> 2 -> 3
// 1 -> 4 -> 5 -> 6 -> 7 -> 12
// 1 -> 4 -> 5 -> 8 -> 9 -> 13
// 1 -> 4 -> 5 -> 10 -> 11 -> 14

export const tree3: Node[] = [
  { id: 1, parentId: undefined },
  { id: 2, parentId: 1 },
  { id: 3, parentId: 2 },
  { id: 4, parentId: 1 },
  { id: 5, parentId: 4 },
  { id: 6, parentId: 5 },
  { id: 7, parentId: 6 },
  { id: 8, parentId: 5 },
  { id: 9, parentId: 8 },
  { id: 10, parentId: 5 },
  { id: 11, parentId: 10 },
  { id: 12, parentId: 7 },
  { id: 13, parentId: 9 },
  { id: 14, parentId: 11 },
];

export const getBranch = (data: Node[], id?: number): Node[] => {
  if (!id) id = data[0].id;

  // get branch up
  const up: Node[] = [];
  let current = data.find((d) => d.id === id);
  while (current) {
    up.unshift(current);
    if (current.parentId === undefined) break;
    current = data.find((d) => d.id === current?.parentId);
  }

  // get branch down
  const down: Node[] = [];
  current = data.find((d) => d.id === id);
  while (current) {
    current = data
      .filter((d) => current?.id === d.parentId)
      .sort((a, b) => b.id - a.id)[0];
    if (current === undefined) break;
    down.push(current);
  }

  return [...up, ...down];
};
