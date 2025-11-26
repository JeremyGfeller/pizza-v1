export interface Pizza {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  category_id: string | null;
  base_price: number;
  is_available: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_spicy: boolean;
  prep_time_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Topping {
  id: string;
  name: string;
  price: number;
  is_available: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  category: "cheese" | "meat" | "vegetable" | "sauce" | "other";
  created_at: string;
}

export interface PizzaSize {
  id: string;
  name: string;
  diameter_cm: number;
  price_multiplier: number;
  display_order: number;
  created_at: string;
}

export interface CrustType {
  id: string;
  name: string;
  description: string | null;
  additional_price: number;
  is_available: boolean;
  created_at: string;
}

export interface DeliveryZone {
  id: string;
  canton: string;
  postal_codess: string[];
  delivery_fee: number;
  min_order_amount: number;
  estimated_delivery_minutes: number;
  is_active: boolean;
  created_at: string;
}

export interface CartItem {
  pizzaId: string;
  pizzaName: string;
  pizzaImage: string | null;
  sizeId: string;
  sizeName: string;
  crustTypeId: string;
  crustTypeName: string;
  toppingIds: string[];
  quantity: number;
  unitPrice: number;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  guest_email: string | null;
  guest_name: string | null;
  guest_phone: string | null;
  delivery_street: string;
  delivery_city: string;
  delivery_postal_codes: string;
  delivery_canton: string;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "delivering"
    | "delivered"
    | "cancelled";
  subtotal: number;
  delivery_fee: number;
  tax: number;
  total: number;
  payment_intent_id: string | null;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  delivery_notes: string | null;
  estimated_delivery_time: string | null;
  actual_delivery_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: "customer" | "admin" | "delivery";
  created_at: string;
  updated_at: string;
}
