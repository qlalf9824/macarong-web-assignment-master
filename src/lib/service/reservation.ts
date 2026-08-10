import "server-only";

import {
  type ReservationDetail,
  type ReservationsPage,
  toReservation,
  toReservationDetail,
} from "@/lib/models";
import { getCustomer } from "@/lib/service/customer";
import * as mock from "@/lib/service/mock";

export const PER_PAGE = 10;

/**
 * 예약 목록 한 페이지를 화면 모델로 조립해 돌려준다. page 는 0부터 시작한다.
 * 고객 정보가 없는 예약은 목록에서 제외한다.
 */
export function getReservations(
  date: string | null,
  page: number,
  perPage: number,
): ReservationsPage {
  const { data, totalPages, hasNext } = mock.getReservationsPage(
    date,
    page,
    perPage,
  );

  const items = data.flatMap((item) => {
    const customer = getCustomer(item.customerId);
    return customer ? [toReservation(item, customer)] : [];
  });

  return { items, hasNext, totalPages };
}

/** 예약 상세 화면 모델. 없으면 null */
export function getReservationDetail(
  serverId: number,
): ReservationDetail | null {
  const detail = mock.getReservationDetail(serverId);
  return detail ? toReservationDetail(detail) : null;
}
