import moment from "moment";
import "moment/min/locales";

moment.locale("ko");

// BFF(Next.js Route Handler) 경유. 실제 데이터는 src/app/api/* 에서 목으로 제공한다.
export const API_BASE = "/api";
export const PER_PAGE = 10;

// 브라우저에서는 상대경로로 충분하지만, 서버 컴포넌트의 SSR prefetch처럼 "서버에서
// 실행되는" fetch는 self-host BFF를 절대 URL로 호출해야 한다. (Node fetch는 상대경로 불가)
function apiUrl(path: string): string {
  if (typeof window !== "undefined") return `${API_BASE}${path}`;
  const origin =
    process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : `http://127.0.0.1:${process.env.PORT ?? 3000}`);
  return `${origin}${API_BASE}${path}`;
}

export const PAYMENT_LABEL: Record<string, string> = {
  CARD: "카드결제",
  BANK: "계좌이체",
  VBANK: "무통장입금",
  ONSITE: "현장결제",
};

export const FUEL_LABEL: Record<string, string> = {
  PREMIUM_GASOLINE: "고급 휘발유",
  GASOLINE: "일반 휘발유",
  DIESEL: "경유",
  LPG: "LPG",
  ELECTRICITY: "전기",
};

export type UiStatus = "pending" | "confirmed" | "rejected" | "canceled";
export type DecisionStatus = "confirmed" | "rejected";

export interface ApiProduct {
  group: string;
  name: string;
  price: number;
  quantity: number;
}

export interface ApiListItem {
  serverId: number;
  customerId: number;
  status: string;
  reservedAt: string;
  requirements: string;
  products: ApiProduct[];
  paymentMethod: string;
}

export interface ApiCustomer {
  serverId: number;
  name: string;
  phone: string;
  vehicle: { brand: string; model: string; number: string; fuelType: string };
  visitCount: number;
}

export interface ApiDetail {
  serverId: number;
  status: string;
  reservedAt: string;
  requirements: string;
  customer: { serverId: number; name: string; phone: string };
  vehicle: { brand: string; model: string; number: string; fuelType: string };
  products: ApiProduct[];
  paymentMethod: string;
}

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

export function toTime(reservedAt: string): string {
  return moment(reservedAt).format("A h:mm");
}

export function formatDateHeader(date: string): string {
  return moment(date).format("M월 D일 ddd");
}

export function formatDateTime(reservedAt: string): string {
  return moment(reservedAt).format("YYYY년 M월 D일 (ddd) A h:mm");
}

export function addDays(date: string, days: number): string {
  return moment(date).add(days, "day").format("YYYY-MM-DD");
}

export function formatWon(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

export function visitLabel(visitCount: number): string {
  if (visitCount === 0) return "신규 고객";
  return `${visitCount}회 방문`;
}

export function toStatus(apiStatus: string): UiStatus {
  if (apiStatus === "CANCELLED" || apiStatus === "DEFERRED") return "canceled";
  if (apiStatus === "CONFIRMED" || apiStatus === "COMPLETED")
    return "confirmed";
  return "pending";
}

export function readDecisions(): Record<string, UiStatus> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(
      window.localStorage.getItem("reservation-decisions") || "{}",
    );
  } catch {
    return {};
  }
}

export function writeDecision(id: string, status: DecisionStatus): void {
  const current = JSON.parse(
    window.localStorage.getItem("reservation-decisions") || "{}",
  );
  current[id] = status;
  window.localStorage.setItem("reservation-decisions", JSON.stringify(current));
}

export async function fetchReservationsPage(
  date: string,
  page: number,
  perPage: number,
) {
  const res = await fetch(
    apiUrl(`/reservations?date=${date}&page=${page}&per_page=${perPage}`),
  );
  if (!res.ok) throw new Error("예약 목록을 불러오지 못했습니다.");
  const body: { data: ApiListItem[]; totalPages: number; hasNext: boolean } =
    await res.json();

  const decisions = readDecisions();

  const items: Reservation[] = await Promise.all(
    body.data.map(async (item) => {
      const customerRes = await fetch(apiUrl(`/customers/${item.customerId}`));
      const customer: ApiCustomer = await customerRes.json();
      const id = String(item.serverId);
      return {
        id,
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
        status: decisions[id] ?? toStatus(item.status),
      };
    }),
  );

  return { items, hasNext: body.hasNext, totalPages: body.totalPages };
}

export async function fetchReservation(id: string): Promise<ApiDetail> {
  const res = await fetch(apiUrl(`/reservations/${id}`));
  if (!res.ok) throw new Error("예약 정보를 불러오지 못했습니다.");
  return res.json();
}
