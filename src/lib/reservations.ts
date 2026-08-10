import {
  type ApiCustomer,
  type ApiReservationListPage,
  type DecisionStatus,
  type Reservation,
  type UiStatus,
  toReservation,
} from "@/lib/models";

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
  const body: ApiReservationListPage = await res.json();

  const decisions = readDecisions();

  const items: Reservation[] = await Promise.all(
    body.data.map(async (item) => {
      const customerRes = await fetch(apiUrl(`/customers/${item.customerId}`));
      const customer: ApiCustomer = await customerRes.json();
      const reservation = toReservation(item, customer);
      // 로컬에 저장한 확정/불가 결정이 있으면 서버 상태보다 우선한다.
      return {
        ...reservation,
        status: decisions[reservation.id] ?? reservation.status,
      };
    }),
  );

  return { items, hasNext: body.hasNext, totalPages: body.totalPages };
}
