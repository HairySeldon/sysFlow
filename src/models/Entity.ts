export type ID = string;
export type SIZE = { width: number; height: number } 
export interface Vec2 { x: number; y: number; }
export interface Port { id: ID; label: string;}

export abstract class Entity {
  id: ID;
  label: string;
  position: Vec2;
  parentId?: ID;
  size: SIZE;
  ports?: Port[];
  data?: any;

  constructor(id: ID, label: string,  position: Vec2, size: SIZE, parentId?: ID, ports?: Port[], data?: any) {
    this.id = id;
    this.label = label;
    this.position = position;
    this.parentId = parentId;
    this.size = size ?? { width: 100, height: 50 };
    this.ports = ports;
    this.data = data;
  }
}

