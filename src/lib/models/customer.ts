export interface ApiCustomer {
  serverId: number;
  name: string;
  phone: string;
  vehicle: ApiVehicle;
  visitCount: number;
}

export interface ApiVehicle {
  brand: string;
  model: string;
  number: string;
  fuelType: string;
}

export const FUEL_LABEL: Record<string, string> = {
  PREMIUM_GASOLINE: "고급 휘발유",
  GASOLINE: "일반 휘발유",
  DIESEL: "경유",
  LPG: "LPG",
  ELECTRICITY: "전기",
};

export function fuelLabel(fuelType: string): string {
  return FUEL_LABEL[fuelType] ?? "";
}

export function visitLabel(visitCount: number): string {
  if (visitCount === 0) return "신규 고객";
  return `${visitCount}회 방문`;
}
