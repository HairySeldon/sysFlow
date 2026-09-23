export type ID = string;

export interface Port {
  id: ID;
  label: string;
  data?: Record<string, unknown>;
}

export interface NodeEntity {
  id: ID;
  label: string;
  parentId?: ID | null;
  type?: string;
  ports: Port[];
  data?: Record<string, unknown>;
  className?: string;
}

export interface ContainerEntity {
  id: ID;
  label: string;
  parentId?: ID | null;
  type?: string;
  ports: Port[];
  collapsed?: boolean;
  data?: Record<string, unknown>;
  className?: string;
}
