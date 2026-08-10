import "server-only";

import type { ApiCustomer } from "@/lib/models";
import * as mock from "@/lib/service/mock";

/** 고객 방문 정보. 없으면 null */
export function getCustomer(serverId: number): ApiCustomer | null {
  return mock.getCustomer(serverId);
}
