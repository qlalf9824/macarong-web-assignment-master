import { type NextRequest, NextResponse } from "next/server";
import { getReservationsPage } from "@/app/api/_lib/mock";

/** GET /api/reservations?date={YYYY-MM-DD}&page={1}&per_page={20} */
export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const date = params.get("date");
  const page = Number(params.get("page"));
  const perPage = Number(params.get("per_page"));

  return NextResponse.json(getReservationsPage(date, page, perPage));
}
