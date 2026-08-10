"use client";

import { useRouter } from "next/navigation";
import type { Reservation, UiStatus } from "@/lib/reservations";

const STATUS_BADGE: Partial<
  Record<UiStatus, { label: string; className: string }>
> = {
  confirmed: { label: "예약 확정", className: "bg-primary-bg text-primary" },
  rejected: { label: "예약 불가", className: "bg-gray100 text-gray600" },
  canceled: { label: "취소된 예약", className: "bg-danger-bg text-danger" },
};

function ReservationCardClient({ reservation }: { reservation: Reservation }) {
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
                <span className="truncate text-t1 font-medium text-gray600">
                  {item}
                </span>
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
            <p className="text-t3 font-medium text-gray600">
              {reservation.requestMessage}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

export default ReservationCardClient;
