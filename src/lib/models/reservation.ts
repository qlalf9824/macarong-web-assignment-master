import {
  type ApiCustomer,
  type ApiVehicle,
  fuelLabel,
  visitLabel,
} from "@/lib/models/customer";
import type { ApiProduct } from "@/lib/models/product";
import { formatDateTime, toTime } from "@/lib/utils/format";

export interface Reservation {
  id: string;
  time: string;
  productName: string;
  additionalItems: string[];
  car: { name: string; number: string };
  customer: { name: string; phone: string; visitLabel: string };
  requestMessage?: string;
  status: UiStatus;
}

export interface ReservationDetail {
  id: string;
  status: UiStatus;
  reservedAtLabel: string;
  productTitle: string;
  productName: string;
  additionalItems: string[];
  requestMessage?: string;
  customer: { name: string; phone: string };
  car: { brand: string; model: string; number: string; fuelLabel: string };
  payment: { methodLabel: string; totalAmount: number };
}

export type UiStatus = "pending" | "confirmed" | "rejected" | "canceled";
export type DecisionStatus = "confirmed" | "rejected";

export const PAYMENT_LABEL: Record<string, string> = {
  CARD: "카드결제",
  BANK: "계좌이체",
  VBANK: "무통장입금",
  ONSITE: "현장결제",
};

export interface ApiReservationListPage {
  data: ApiReservationListItem[];
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface ApiReservationListItem {
  serverId: number;
  customerId: number;
  status: string;
  reservedAt: string;
  requirements: string;
  products: ApiProduct[];
  paymentMethod: string;
}

export interface ApiReservationDetail {
  serverId: number;
  status: string;
  reservedAt: string;
  requirements: string;
  customer: Pick<ApiCustomer, "serverId" | "name" | "phone">;
  vehicle: ApiVehicle;
  products: ApiProduct[];
  paymentMethod: string;
}

export function toReservation(
  item: ApiReservationListItem,
  customer: ApiCustomer,
): Reservation {
  return {
    id: String(item.serverId),
    time: toTime(item.reservedAt),
    productName: item.products[0]?.name ?? "",
    additionalItems: item.products.slice(1).map((product) => product.name),
    car: { name: customer.vehicle.model, number: customer.vehicle.number },
    customer: {
      name: customer.name,
      phone: customer.phone,
      visitLabel: visitLabel(customer.visitCount),
    },
    requestMessage: item.requirements || undefined,
    status: toStatus(item.status),
  };
}

export function toReservationDetail(
  detail: ApiReservationDetail,
): ReservationDetail {
  return {
    id: String(detail.serverId),
    status: toStatus(detail.status),
    reservedAtLabel: formatDateTime(detail.reservedAt),
    productTitle: detail.products[0]?.group ?? "",
    productName: detail.products[0]?.name ?? "",
    additionalItems: detail.products.slice(1).map((product) => product.name),
    requestMessage: detail.requirements || undefined,
    customer: { name: detail.customer.name, phone: detail.customer.phone },
    car: {
      brand: detail.vehicle.brand,
      model: detail.vehicle.model,
      number: detail.vehicle.number,
      fuelLabel: fuelLabel(detail.vehicle.fuelType),
    },
    payment: {
      methodLabel: paymentMethodLabel(detail.paymentMethod),
      totalAmount: detail.products.reduce(
        (sum, product) => sum + product.price,
        0,
      ),
    },
  };
}

function paymentMethodLabel(paymentMethod: string): string {
  return PAYMENT_LABEL[paymentMethod] ?? paymentMethod;
}

export function toStatus(apiStatus: string): UiStatus {
  if (apiStatus === "CANCELLED" || apiStatus === "DEFERRED") return "canceled";
  if (apiStatus === "CONFIRMED" || apiStatus === "COMPLETED")
    return "confirmed";
  return "pending";
}
