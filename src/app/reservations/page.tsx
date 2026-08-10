import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { redirect } from "next/navigation";
import moment from "moment";
import { PER_PAGE, getReservations } from "@/lib/service/reservation";
import ReservationList from "./_components/ReservationListClient";

export const dynamic = "force-dynamic";

async function ReservationPage({
  searchParams,
}: {
  searchParams: { date?: string; page?: string; per_page?: string };
}) {
  const { date, page, per_page } = searchParams;

  // 쿼리 파라미터가 없으면 최신 날짜 기준으로 셋팅해 URL에 반영한다.
  if (!date || page === undefined || per_page === undefined) {
    redirect(
      `/reservations?date=${moment().format("YYYY-MM-DD")}&page=0&per_page=${PER_PAGE}`,
    );
  }

  const queryClient = new QueryClient();
  await queryClient.prefetchInfiniteQuery({
    queryKey: ["reservations", date, Number(per_page)],
    queryFn: ({ pageParam }) =>
      getReservations(date, pageParam as number, Number(per_page)),
    initialPageParam: Number(page),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ReservationList />
    </HydrationBoundary>
  );
}

export default ReservationPage;
