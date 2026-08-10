import { notFound } from "next/navigation";
import { getReservationDetail } from "@/lib/service/reservation";
import { formatWon } from "@/lib/utils/format";
import BackButton from "./_components/BackButtonClient";
import DecisionBar from "./_components/DecisionBarClient";
import InfoRow from "./_components/InfoRow";

function ReservationDetailPage({ params }: { params: { id: string } }) {
  const serverId = Number(params.id);
  if (!Number.isInteger(serverId)) notFound();

  const data = getReservationDetail(serverId);
  if (!data) notFound();

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
        <BackButton
          ariaLabel="뒤로가기"
          className="flex h-12 w-12 items-center justify-center"
        >
          <img
            src="/icons/ic_nav_back.svg"
            alt=""
            width={48}
            height={48}
            aria-hidden
          />
        </BackButton>
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

      <DecisionBar id={data.id} />
    </main>
  );
}

export default ReservationDetailPage;
