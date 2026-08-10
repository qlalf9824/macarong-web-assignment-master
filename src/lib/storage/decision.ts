import type { DecisionStatus, UiStatus } from "@/lib/models";

const STORAGE_KEY = "reservation-decisions";

/** 로컬에 저장된 예약별 확정/불가 결정. 서버에서는 항상 빈 객체다. */
export function readDecisions(): Record<string, UiStatus> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function writeDecision(id: string, status: DecisionStatus): void {
  const current = readDecisions();
  current[id] = status;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
}
