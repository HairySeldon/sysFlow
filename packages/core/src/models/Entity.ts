export type ID = string;

export type PortSide = 'left' | 'right' | 'top' | 'bottom' | 'auto';
export type PortDirection = 'in' | 'out' | 'inout';

export interface Port {
  id: ID;
  label: string;
  side?: PortSide;
  direction?: PortDirection;
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
  collapsed?: boolean;
  data?: Record<string, unknown>;
  className?: string;
}
