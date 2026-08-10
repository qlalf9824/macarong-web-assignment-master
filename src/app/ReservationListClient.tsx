"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  addDays,
  fetchReservationsPage,
  formatDateHeader,
  type Reservation,
  type UiStatus,
} from "@/lib/reservations";

const STATUS_BADGE: Partial<Record<UiStatus, { label: string; className: string }>> = {
  confirmed: { label: "예약 확정", className: "bg-primary-bg text-primary" },
  rejected: { label: "예약 불가", className: "bg-gray100 text-gray600" },
  canceled: { label: "취소된 예약", className: "bg-danger-bg text-danger" },
};

function groupByTime(items: Reservation[]) {
  const groups: { time: string; items: Reservation[] }[] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.time === item.time) {
      last.items.push(item);
      continue;
    }
    groups.push({ time: item.time, items: [item] });
  }
  for (const group of groups) {
    group.items.sort(
      (a, b) =>
        (a.status === "canceled" ? 1 : 0) - (b.status === "canceled" ? 1 : 0),
    );
  }
  return groups;
}

function ReservationCard({ reservation }: { reservation: Reservation }) {
  const router = useRouter();
  const canceled = reservation.status === "canceled";
  const badge = STATUS_BADGE[reservation.status];

  return (
    <button
      type="button"
      onClick={() => {
        if (canceled) return;
        router.push(`/reservations/${reservation.id}`);
      }}
      disabled={canceled}
      className={`flex w-full flex-col items-center gap-[18px] rounded-[20px] bg-white px-5 py-6 text-left ${
        canceled ? "opacity-60" : "active:bg-gray100/40"
      }`}
    >
      {badge && (
        <div className="flex w-[280px]">
          <span
            className={`rounded-[8px] px-2 py-0.5 text-t3 font-semibold ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>
      )}

      <div className="flex w-[280px] flex-col gap-1.5">
        <p className="line-clamp-2 text-h3 font-bold text-gray900">
          {reservation.productName}
        </p>
        {reservation.additionalItems.length > 0 && (
          <ul className="flex flex-col gap-1">
            {reservation.additionalItems.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <img
                  src="/icons/ic_plus_circle.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="shrink-0"
                  aria-hidden
                />
                <span className="truncate text-t1 font-medium text-gray600">{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="h-px w-[280px] bg-line-subtle" />

      <div className="flex w-[280px] flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1">
            <span className="shrink-0 text-t1 font-semibold text-gray900">
              {reservation.car.number}
            </span>
            <span className="truncate text-t1 font-semibold text-gray900">
              {reservation.car.name}
            </span>
          </div>
          <span className="flex h-6 shrink-0 items-center rounded-[12px] bg-primary-bg px-2 text-t3 font-medium text-primary">
            {reservation.customer.visitLabel}
          </span>
        </div>

        <div className="flex flex-col gap-1 rounded-[10px] border border-gray100 p-3">
          <div className="flex items-center justify-between">
            <span className="text-t2 font-medium text-gray500">
              {reservation.customer.name}
            </span>
            <span className="text-t2 font-medium text-gray500">
              {reservation.customer.phone}
            </span>
          </div>
          {reservation.requestMessage && (
            <p className="text-t3 font-medium text-gray600">{reservation.requestMessage}</p>
          )}
        </div>
      </div>
    </button>
  );
}

export function ReservationListClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedDate = searchParams.get("date") ?? "";
  const initialPage = Number(searchParams.get("page"));
  const perPage = Number(searchParams.get("per_page"));

  function moveDate(delta: number) {
    router.push(
      `/?date=${addDays(selectedDate, delta)}&page=0&per_page=${perPage}`,
    );
  }

  const [hideCanceled, setHideCanceled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem("hideCanceled") !== "false";
  });
  const [scrollY, setScrollY] = useState(0);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["reservations", selectedDate],
      queryFn: ({ pageParam }) =>
        fetchReservationsPage(selectedDate, pageParam, perPage),
      initialPageParam: initialPage,
      getNextPageParam: () => undefined,
    });

  const items = useMemo(() => {
    const all = data?.pages.flatMap((page) => page.items) ?? [];
    return hideCanceled ? all.filter((item) => item.status !== "canceled") : all;
  }, [data, hideCanceled]);

  // 시간대별 그룹은 상태로 들고 effect 로 동기화한다.
  const [groups, setGroups] = useState(() => groupByTime(items));
  useEffect(() => {
    setGroups(groupByTime(items));
  }, [items]);

  useEffect(() => {
    window.localStorage.setItem("hideCanceled", String(hideCanceled));
  }, [hideCanceled]);

  useEffect(() => {
    function onScroll() {
      setScrollY(window.scrollY);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrolled = scrollY > 0;

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const hasItems = items.length > 0;
  const isEmpty = !isLoading && !isError && !hasItems;

  return (
    <main className="device-frame bg-gray100">
      <header
        className={`sticky top-0 z-10 bg-white transition-shadow ${
          scrolled ? "shadow-[0px_4px_16px_rgba(26,33,40,0.12)]" : ""
        }`}
      >
        <img
          src="/icons/status_bar.svg"
          alt=""
          width={360}
          height={24}
          className="block w-full select-none"
          aria-hidden
        />
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <button
            type="button"
            aria-label="이전 날짜"
            onClick={() => moveDate(-1)}
            className="flex h-8 w-8 items-center justify-center"
          >
            <img src="/icons/ic_chevron_left.svg" alt="" width={32} height={32} aria-hidden />
          </button>
          <span className="text-h3 font-semibold text-gray900">
            {formatDateHeader(selectedDate)}
          </span>
          <button
            type="button"
            aria-label="다음 날짜"
            onClick={() => moveDate(1)}
            className="flex h-8 w-8 items-center justify-center"
          >
            <img src="/icons/ic_chevron_right.svg" alt="" width={32} height={32} aria-hidden />
          </button>
        </div>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-t2 font-medium text-gray600">취소된 예약 안보기</span>
            <button
              type="button"
              role="switch"
              aria-checked={hideCanceled}
              aria-label="취소된 예약 안보기"
              onClick={() => setHideCanceled((prev) => !prev)}
              className={`flex h-7 w-12 shrink-0 items-center rounded-[14px] p-0.5 transition-colors ${
                hideCanceled ? "bg-primary justify-end" : "bg-gray300 justify-start"
              }`}
            >
              <span className="block h-6 w-6 rounded-full bg-white shadow-sm" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col items-center gap-5 px-5 pb-16 pt-1">
        {groups.map((group) => (
          <section key={group.time} className="flex w-full flex-col items-center gap-5">
            <div className="flex items-center gap-1">
              <span className="text-h3 font-semibold text-gray500">{group.time}</span>
              <span className="h-0.5 w-0.5 rounded-full bg-gray500" />
              <span className="text-h3 font-semibold text-gray500">{group.items.length}건</span>
            </div>
            <div className="flex w-full flex-col gap-3">
              {group.items.map((reservation) => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))}
            </div>
          </section>
        ))}

        {isError && (
          <div className="flex flex-col items-center gap-2 py-6">
            <p className="text-t2 font-medium text-gray600">예약 목록을 불러오지 못했어요.</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="rounded-[10px] bg-gray100 px-4 py-2 text-t2 font-medium text-gray700"
            >
              다시 시도
            </button>
          </div>
        )}
        {isEmpty && (
          <p className="py-16 text-t2 font-medium text-gray500">이 날짜에는 예약이 없어요</p>
        )}
        {(isLoading || isFetchingNextPage) && (
          <p className="py-6 text-t3 font-medium text-gray500">불러오는 중…</p>
        )}
        <div ref={sentinelRef} className="h-px w-full" />
      </div>
    </main>
  );
}
