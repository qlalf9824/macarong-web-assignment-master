import moment from "moment";
import "moment/min/locales";

moment.locale("ko");

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
