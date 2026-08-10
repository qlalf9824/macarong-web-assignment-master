import BackButton from "./_components/BackButtonClient";

function NotFound() {
  return (
    <main className="device-frame flex flex-col items-center justify-center gap-3 bg-white">
      <p className="text-t2 font-medium text-gray600">
        예약 정보를 찾을 수 없어요.
      </p>
      <BackButton className="rounded-[10px] bg-gray100 px-4 py-2 text-t2 font-medium text-gray700">
        돌아가기
      </BackButton>
    </main>
  );
}

export default NotFound;
