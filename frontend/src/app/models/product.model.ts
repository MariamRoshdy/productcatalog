export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stockQuantity: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface ProductPayload {
  name: string;
  description: string | null;
  price: number;
  stockQuantity: number;
}
