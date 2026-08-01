import { EndpointBuilder } from "@reduxjs/toolkit/query";

type EndpointDefinitions = EndpointBuilder<any, any, any>;

export interface CustomCakePayload {
  name: string;
  phone: string;
  email?: string;
  occasion: string;
  size?: "SMALL" | "MEDIUM" | "LARGE" | "CUSTOM";
  flavors?: string[];
  designNotes?: string;
  budget?: number;
  preferredDeliveryDate?: string;
  deliveryAddress?: string;
  city?: string;
  pincode?: string;
  contactPreference?: "WHATSAPP" | "EMAIL" | "CALL";
  referenceImageKeys?: string[];
}

export const cakeEndpoints = (builder: EndpointDefinitions) => ({
  createCakeRequest: builder.mutation<any, CustomCakePayload>({
    query: (body) => ({
      url: "cake-customization",
      method: "POST",
      body,
    }),
  }),
});
