const HIDE_CANCELED_KEY = "hideCanceled";

/** 취소된 예약 숨기기 설정. 저장된 값이 없으면 숨김이 기본이다. */
export function readHideCanceled(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(HIDE_CANCELED_KEY) !== "false";
}

export function writeHideCanceled(hide: boolean): void {
  window.localStorage.setItem(HIDE_CANCELED_KEY, String(hide));
}
