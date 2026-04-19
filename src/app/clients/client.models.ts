// ===== Client Domain Models (View Layer) =====

export interface ClientModelForm {
  id?: number;
  name: string;
  email: string;
  phone: string;
}

export interface ClientModelTable {
  id: number;
  name: string;
  email: string;
  phone: string;
}
