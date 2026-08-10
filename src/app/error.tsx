"use client";

function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="device-frame flex flex-col items-center justify-center gap-3 bg-white">
      <p className="text-t2 font-medium text-gray600">문제가 발생했어요.</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-[10px] bg-gray100 px-4 py-2 text-t2 font-medium text-gray700"
      >
        다시 시도
      </button>
    </main>
  );
}

export default Error;
