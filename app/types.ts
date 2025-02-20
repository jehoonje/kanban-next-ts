// /types.ts
export interface Board {
  id: string;
  name: string;
  users?: User[];
}

export interface User {
  id: string;
  name: string;
  board_id: string;
}