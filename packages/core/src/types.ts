export type ID = string;

export interface Position { x: number; y: number; }
export type NodeData = Record<string, any>;

export interface NodeDTO {
  id: ID;
  type: string;
  data: NodeData;
  parent?: ID | null;
  children?: ID[];
  position: Position;
  size?: { w: number; h: number };
  collapsed?: boolean;
  meta?: Record<string, any>;
}

export interface EdgeDTO {
  id: ID;
  source: ID;
  target: ID;
  type?: string;
  label?: string;
  meta?: Record<string, any>;
}

