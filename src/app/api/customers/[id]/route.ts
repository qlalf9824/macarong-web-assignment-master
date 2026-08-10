import { NextResponse } from "next/server";
import { getCustomer } from "@/lib/service/customer";

/** GET /api/customers/{id} */
export function GET(_request: Request, { params }: { params: { id: string } }) {
  const customer = getCustomer(Number(params.id));
  if (!customer) {
    return NextResponse.json(
      { message: "고객을 찾을 수 없습니다." },
      { status: 404 },
    );
  }
  return NextResponse.json(customer);
}
