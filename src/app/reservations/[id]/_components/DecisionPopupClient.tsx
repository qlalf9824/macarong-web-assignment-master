"use client";

import { useEffect } from "react";

function DecisionPopupClient({
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-dim px-10"
      onClick={onCancel}
    >
      <div
        className="w-[280px] overflow-hidden rounded-2xl bg-white"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col gap-2.5 px-5 pb-2 pt-6">
          <p className="text-h3 font-bold text-gray900">{title}</p>
          <p className="text-t2 font-medium text-gray600">{description}</p>
        </div>
        <div className="flex gap-2 px-4 py-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-11 flex-1 items-center justify-center rounded-[10px] bg-gray100 text-t2 font-medium text-gray700"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-11 flex-1 items-center justify-center rounded-[10px] bg-primary text-t2 font-medium text-white"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DecisionPopupClient;
