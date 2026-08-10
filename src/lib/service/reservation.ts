import "server-only";
import type { ApiReservationDetail, ApiReservationListPage } from "@/lib/models";
import * as mock from "@/lib/service/mock";

/**
 * 예약 데이터에 접근하는 서비스 레이어.
 * Route Handler 와 서버 컴포넌트가 공통으로 사용한다. (서버 컴포넌트가 자기 자신의
 * Route Handler를 HTTP로 다시 호출하지 않도록, 데이터 소스를 함수 호출로 직접 읽는다.)
 *
 * 지금은 데이터 소스가 목(mock)이라 그대로 위임하지만, 실제 서버로 바뀌어도
 * 호출부는 이 시그니처만 알면 된다.
 */

/** 예약 목록 (날짜 + 페이지). page 는 0부터 시작한다. */
export function getReservationsPage(
  date: string | null,
  page: number,
  perPage: number,
): ApiReservationListPage {
  return mock.getReservationsPage(date, page, perPage);
}

/** 예약 상세. 없으면 null */
export function getReservationDetail(
  serverId: number,
): ApiReservationDetail | null {
  return mock.getReservationDetail(serverId);
}
