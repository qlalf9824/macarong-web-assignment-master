"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { writeDecision } from "@/lib/reservations";
import DecisionPopup from "./DecisionPopupClient";

function DecisionBarClient({ id }: { id: string }) {
  const router = useRouter();
  const [popup, setPopup] = useState<"confirm" | "reject" | null>(null);

  function submitDecision() {
    if (!popup) return;
    writeDecision(id, popup === "confirm" ? "confirmed" : "rejected");
    setPopup(null);
    router.back();
  }

  return (
    <>
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
    </>
  );
}

export default DecisionBarClient;
