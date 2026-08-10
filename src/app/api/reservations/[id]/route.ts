import { NextResponse } from "next/server";
import { getReservationDetail } from "@/app/api/_lib/mock";

/** GET /api/reservations/{serverId} */
export function GET(_request: Request, { params }: { params: { id: string } }) {
  const detail = getReservationDetail(Number(params.id));
  if (!detail) {
    return NextResponse.json({ message: "예약을 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json(detail);
}
