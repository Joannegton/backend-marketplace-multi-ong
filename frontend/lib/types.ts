export interface LoginResponse {
  id: string;
  email: string;
  organizationId: string;
}

export interface MeResponse {
  user: {
    id: string;
    email: string;
    name: string;
    isActive: boolean;
    createdAt: string;
  };
  organization: {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
  };
}

export type User = MeResponse["user"];

export type Organization = MeResponse["organization"];

export interface SearchProductResponse {
  query: string;
  results: Product[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  weight: number;
  organizationId: string;
  isActive: boolean;
}

export const PRODUCT_CATEGORIES = [
  "artesanato",
  "vestuario",
  "casa",
  "acessorios",
  "infantil",
  "outros",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  artesanato: 'Artesanato',
  vestuario: 'Vestuário',
  casa: 'Casa',
  acessorios: 'Acessórios',
  infantil: 'Infantil',
  outros: 'Outros',
};

export interface OrganizationOrder {
  id: string;
  orderNumber: number;
  cliente: Cliente;
  total: number;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Cliente {
  name: string;
  cpf: string;
  email: string;
  cep: string;
  address: string;
  number: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  priceSnapshot: number;
  quantity: number;
  subtotal: number;
}

export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface SearchProductsParams {
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface CatalogProduct {
  results: Product[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  weight: number;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

export interface ShoppingCart {
  id: string;
  items: OrderItem[];
  total: number;
  status: ShoppingCartStatus;
  expiresAt: string;
  createdAt: string;
}

export enum ShoppingCartStatus {
  ACTIVE = "active",
  CONFIRMED = "confirmed",
  EXPIRED = "expired",
}
export interface CreateOrderDto {
  name: string;
  cpf: string;
  email: string;
  cep: string;
  address: string;
  number: string;
}

export type Order = {
  id: string;
  orderNumber: number;
  cliente?: Cliente;
  organizationIds: string[];
  total: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
};

export interface CheckoutPaymentDto {
  paymentProvider: string;
  paymentToken?: string;
  reference?: string;
}
