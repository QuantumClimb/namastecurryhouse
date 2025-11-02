export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface DeliveryAddress {
  street: string;
  apartment?: string;
  city: string;
  postalCode: string;
  country: string;
}

export type PaymentMethod = 'whatsapp' | 'stripe';

export type OrderStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus = 
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'REFUNDED';

export interface Order {
  id: number;
  orderNumber: string;
  
  // Customer
  customerId?: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  
  // Delivery
  deliveryAddress: DeliveryAddress;
  deliveryInstructions?: string;
  
  // Order details
  orderItems: any[]; // CartItem[] from cart.ts
  subtotal: number;
  deliveryFee: number;
  total: number;
  
  // Status
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  
  // Payment
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  completedAt?: string;
}

export interface CreatePaymentIntentRequest {
  orderItems: any[];
  customerInfo: CustomerInfo;
  deliveryAddress: DeliveryAddress;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  orderId: number;
  orderNumber: string;
  amount: number;
}
