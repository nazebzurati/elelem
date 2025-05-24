export interface Branch {
  id: number;
  createdAt: number;
  conversationId: number;
  parentBranchIds: number[];
}
