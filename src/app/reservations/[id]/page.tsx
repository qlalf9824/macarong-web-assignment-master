"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { type ReservationDetail, toReservationDetail } from "@/lib/models";
import { fetchReservation, writeDecision } from "@/lib/reservations";
import { formatWon } from "@/lib/utils/format";
import DecisionPopup from "./_components/DecisionPopupClient";
import InfoRow from "./_components/InfoRow";

function ReservationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const [popup, setPopup] = useState<"confirm" | "reject" | null>(null);

  const [data, setData] = useState<ReservationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setIsError(false);
    fetchReservation(id)
      .then((detail) => setData(toReservationDetail(detail)))
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  function submitDecision() {
    if (!popup) return;
    writeDecision(id, popup === "confirm" ? "confirmed" : "rejected");
    setPopup(null);
    router.back();
  }

  if (isLoading) {
    return (
      <main className="device-frame flex items-center justify-center bg-white">
        <p className="text-t2 font-medium text-gray500">불러오는 중…</p>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="device-frame flex flex-col items-center justify-center gap-3 bg-white">
        <p className="text-t2 font-medium text-gray600">
          예약 정보를 찾을 수 없어요.
        </p>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-[10px] bg-gray100 px-4 py-2 text-t2 font-medium text-gray700"
        >
          돌아가기
        </button>
      </main>
    );
  }

  const { productTitle, productName, additionalItems } = data;
  const carParts = [data.car.brand, data.car.model, data.car.fuelLabel].filter(
    Boolean,
  );

  return (
    <main className="device-frame flex min-h-[100dvh] flex-col bg-white">
      <img
        src="/icons/status_bar.svg"
        alt=""
        width={360}
        height={24}
        className="block w-full select-none"
        aria-hidden
      />
      <div className="flex h-14 items-center px-1">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => router.back()}
          className="flex h-12 w-12 items-center justify-center"
        >
          <img
            src="/icons/ic_nav_back.svg"
            alt=""
            width={48}
            height={48}
            aria-hidden
          />
        </button>
        <span className="text-t1 font-medium text-gray900">예약 요청 확인</span>
      </div>

      <div className="flex items-center gap-1 bg-primary-bg px-5 py-2.5">
        <img
          src="/icons/ic_clock_fill.svg"
          alt=""
          width={20}
          height={20}
          aria-hidden
        />
        <span className="text-t1 font-semibold text-primary">
          {data.reservedAtLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col pb-20">
        <div className="flex flex-col gap-4 px-5 py-8">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h1 className="text-h3 font-bold text-gray900">{productTitle}</h1>
              <p className="text-t1 font-medium text-gray600">{productName}</p>
            </div>
            {additionalItems.length > 0 && (
              <ul className="flex flex-col gap-1">
                {additionalItems.map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <img
                      src="/icons/ic_plus_circle.svg"
                      alt=""
                      width={16}
                      height={16}
                      aria-hidden
                    />
                    <span className="text-t1 font-medium text-gray600">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {data.requestMessage && (
            <div className="flex flex-col gap-1 rounded-[10px] border border-gray100 p-3">
              <p className="text-t2 font-medium text-gray500">요청사항</p>
              <p className="text-t2 font-medium text-gray600">
                {data.requestMessage}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-5">
          <div className="h-2 w-full bg-gray100" />

          <div className="flex w-[320px] flex-col gap-3">
            <section className="flex flex-col gap-3">
              <h2 className="text-h4 font-semibold text-gray900">고객 정보</h2>
              <div className="flex flex-col gap-1.5">
                <InfoRow label="고객 이름">
                  <span className="text-t1 font-semibold text-gray600">
                    {data.customer.name}
                  </span>
                </InfoRow>
                <InfoRow label="전화번호">
                  <span className="text-t1 font-medium text-gray600">
                    {data.customer.phone}
                  </span>
                </InfoRow>
              </div>
            </section>

            <div className="h-px w-full bg-gray100" />

            <section className="flex flex-col gap-3">
              <h2 className="text-h4 font-semibold text-gray900">차량 정보</h2>
              <div className="flex flex-col gap-1.5">
                <InfoRow label="차량 정보">
                  <span className="flex items-center gap-1.5">
                    {carParts.map((part, index) => (
                      <span key={part} className="flex items-center gap-1.5">
                        <span className="text-t1 font-medium text-gray600">
                          {part}
                        </span>
                        {index < carParts.length - 1 && (
                          <span className="h-[3px] w-[3px] rounded-full bg-gray300" />
                        )}
                      </span>
                    ))}
                  </span>
                </InfoRow>
                <InfoRow label="차량 번호">
                  <span className="text-t1 font-medium text-gray600">
                    {data.car.number}
                  </span>
                </InfoRow>
              </div>
            </section>
          </div>

          <div className="h-2 w-full bg-gray100" />

          <div className="w-[320px]">
            <section className="flex flex-col gap-3">
              <h2 className="text-h4 font-semibold text-gray900">결제 상세</h2>
              <div className="flex flex-col gap-1.5">
                <InfoRow label="결제방법">
                  <span className="text-t1 font-medium text-gray600">
                    {data.payment.methodLabel}
                  </span>
                </InfoRow>
                <div className="flex items-center justify-between">
                  <span className="text-t1 font-medium text-primary">
                    총 결제금액
                  </span>
                  <span className="text-h4 font-bold text-primary">
                    {formatWon(data.payment.totalAmount)}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 flex gap-2 border-t border-line-subtle bg-white px-4 py-3">
        <button
          type="button"
          onClick={() => setPopup("reject")}
          className="flex h-12 flex-1 items-center justify-center rounded-[10px] bg-gray100 text-t1 font-medium text-gray700"
        >
          예약 불가
        </button>
        <button
          type="button"
          onClick={() => setPopup("confirm")}
          className="flex h-12 flex-1 items-center justify-center rounded-[10px] bg-primary text-t1 font-medium text-white"
        >
          예약 확정
        </button>
      </div>

      {popup === "reject" && (
        <DecisionPopup
          title="작업이 어려우신가요?"
          description="고객의 신뢰 유지를 위해 예약이 불가능한 시간은 미리 표시해주세요."
          confirmLabel="예약 불가능"
          onCancel={() => setPopup(null)}
          onConfirm={submitDecision}
        />
      )}
      {popup === "confirm" && (
        <DecisionPopup
          title="예약을 확정할까요?"
          description="확정 후에는 고객에게 예약 완료 안내가 전송됩니다."
          confirmLabel="확정하기"
          onCancel={() => setPopup(null)}
          onConfirm={submitDecision}
        />
      )}
    </main>
  );
}

export default ReservationDetailPage;
