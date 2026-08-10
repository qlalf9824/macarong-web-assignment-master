import { apiUrl } from "@/lib/api/client";
import type { ReservationsPage } from "@/lib/models";

/** 예약 목록 한 페이지. 확정/불가 결정 병합은 호출하는 화면에서 한다. */
export async function fetchReservations(
  date: string,
  page: number,
  perPage: number,
): Promise<ReservationsPage> {
  const res = await fetch(
    apiUrl(`/reservations?date=${date}&page=${page}&per_page=${perPage}`),
  );
  if (!res.ok) throw new Error("예약 목록을 불러오지 못했습니다.");
  return res.json();
}
