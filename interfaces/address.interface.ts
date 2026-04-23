// interfaces/address.interface.ts
import { Root } from "./root.interface";

export type AddressType = "HOME" | "WORK" | "OTHER";

export interface Address {
  id: string;
  label: string;
  addressType: AddressType;
  line1: string;
  line2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  postcode: string;
  country: string;
  recipientName: string;
  phone: string;
  latitude?: number | null;
  longitude?: number | null;
  plusCode?: string | null;
  deliveryInstructions?: string | null;
  isDefault: boolean;
  isVerified: boolean;
  customerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressPayload {
  label: string;
  addressType?: AddressType;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  postcode: string;
  country?: string;
  recipientName: string;
  phone: string;
  latitude?: number;
  longitude?: number;
  plusCode?: string;
  deliveryInstructions?: string;
  isDefault?: boolean;
}

export type UpdateAddressPayload = Partial<CreateAddressPayload>;

export type GetAddressResponse = Root<Address>;
export type GetAllAddressesResponse = Root<Address[]>;