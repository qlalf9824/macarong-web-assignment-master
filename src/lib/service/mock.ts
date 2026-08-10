/**
 * BFF가 내려주는 목(mock) 예약 데이터.
 *
 * 외부 서버를 호출하는 대신, 요청받은 날짜를 보고 그 자리에서 예약 데이터를 "만들어" 돌려줍니다.
 * 응답 형태는 README의 API 스펙(예약 목록 / 예약 상세 / 고객 방문 정보)과 똑같이 맞췄습니다.
 *
 * 동작 방식
 *  - 어떤 날짜를 조회하든 항상 데이터가 나옵니다. (조회 가능한 기간 제한이 없습니다.)
 *  - 같은 날짜는 언제나 똑같은 데이터가 나오도록, "날짜"를 씨앗(seed) 삼아 규칙적으로 생성합니다.
 *    덕분에 페이지를 넘기거나 새로고침해도 목록이 흔들리지 않습니다.
 *  - 예약 id(serverId)에 "며칠치인지 + 그날 몇 번째 예약인지"를 함께 담아 둡니다.
 *    (id = 날짜번호 * ID_BASE + 그날의 순번)
 *    그래서 목록을 거치지 않고 상세 URL로 바로 들어와도, id만 보고 그 예약을 다시 만들어 낼 수 있습니다.
 */
import "server-only";

import type {
  ApiCustomer,
  ApiProduct,
  ApiReservationDetail,
  ApiReservationListItem,
  ApiReservationListPage,
} from "@/lib/models";

const CUSTOMER_COUNT = 120;
/** 예약 id 인코딩에 쓰는 자릿수 기준. "하루 예약은 10만 건을 넘지 않는다"는 전제로 잡았다. */
const ID_BASE = 100000;

/** 예약이 잡히는 시간대: 09:00 ~ 18:00, 30분 간격 */
const TIME_SLOTS = (() => {
  const slots: string[] = [];
  for (let h = 9; h <= 18; h += 1) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    if (h !== 18) slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots;
})();

// ── 난수/해시 유틸 ───────────────────────────────────────────
// 아래 두 함수는 "같은 입력이면 항상 같은 결과"를 보장하기 위한 도구입니다.
// 내부 구현(어떤 수식인지)은 몰라도 사용에는 지장이 없습니다.

/**
 * 같은 seed(숫자)를 넣으면 항상 같은 난수 순서를 돌려주는 난수 생성기.
 * (mulberry32 — 짧고 잘 알려진 구현체)
 */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 날짜 문자열 같은 텍스트를 난수 생성기에 넣을 숫자 seed로 바꿔 준다.
 * (FNV-1a — 표준 문자열 해시)
 */
function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** 배열에서 난수로 하나 고른다. */
function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

/** min ~ max 사이의 정수를 난수로 하나 만든다. */
function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

// ── 날짜 ↔ 날짜번호 변환 ─────────────────────────────────────
// "날짜번호"는 1970-01-01부터 며칠째인지를 나타내는 정수입니다. (예약 id 인코딩에 사용)
const MS_PER_DAY = 86_400_000;

/** "YYYY-MM-DD" 형식의 올바른 날짜인지 검사한다. (null·잘못된 값이면 false) */
function isValidDate(date: string | null): date is string {
  return (
    !!date &&
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    !Number.isNaN(Date.parse(`${date}T00:00:00Z`))
  );
}

/** 날짜("YYYY-MM-DD")를 날짜번호(1970-01-01부터 며칠째)로 바꾼다. */
function toDayNumber(date: string): number {
  return Math.floor(new Date(`${date}T00:00:00Z`).getTime() / MS_PER_DAY);
}

/** 날짜번호를 다시 "YYYY-MM-DD" 문자열로 되돌린다. */
function fromDayNumber(dayNum: number): string {
  return new Date(dayNum * MS_PER_DAY).toISOString().slice(0, 10);
}

// ── 데이터를 채울 후보 값들 ──────────────────────────────────
// 정비소 도메인에 어울리는 상품·차량·고객 이름 등을 모아 둔 풀(pool)입니다.
// 예약을 만들 때 여기서 난수로 골라 채웁니다.
const SERVICE_POOL: { group: string; names: string[] }[] = [
  {
    group: "엔진오일 교체",
    names: [
      "쉘 힐릭스 울트라 5W-40",
      "모빌1 5W-30",
      "킥스 PAO 5W-30",
      "지크 X7 5W-30",
      "캐스트롤 엣지 5W-30",
    ],
  },
  {
    group: "브레이크오일 교체",
    names: [
      "액트루브 SUPER DOT4",
      "보쉬 DOT4",
      "수노코 브레이크 플루이드",
      "ATE TYP200",
    ],
  },
  {
    group: "타이어 교체",
    names: [
      "한국타이어 키너지 GT",
      "금호 마제스티9",
      "미쉐린 프라이머시4",
      "콘티넨탈 UC6",
      "넥센 엔페라",
    ],
  },
  {
    group: "에어컨 점검",
    names: [
      "에어컨 가스 충전 R134a",
      "에어컨 시스템 진단",
      "에어컨 컴프레서 점검",
    ],
  },
  {
    group: "배터리 교체",
    names: ["로케트 AGM 80", "델코 DF60L", "아트라스 BX 90", "보쉬 AGM 70"],
  },
  {
    group: "미션오일 교체",
    names: ["ZF 라이프가드8", "현대 ATF SP-4", "기아 CVT 오일"],
  },
  {
    group: "휠 얼라인먼트",
    names: ["전륜 휠 얼라인먼트", "4륜 휠 얼라인먼트"],
  },
  {
    group: "엔진 점검",
    names: ["엔진 진단 및 점검", "점화플러그 교체", "타이밍벨트 점검"],
  },
  {
    group: "냉각수 교체",
    names: ["부동액 교체 (사계절용)", "냉각수 라인 클리닝"],
  },
];

const ADDON_POOL: ApiProduct[] = [
  { group: "엔진오일 필터", name: "순정 오일필터", price: 18000, quantity: 1 },
  { group: "에어컨 필터", name: "보쉬 에어컨필터", price: 22000, quantity: 1 },
  {
    group: "와이퍼 교체",
    name: "보쉬 에어로트윈 와이퍼",
    price: 28000,
    quantity: 1,
  },
  {
    group: "워셔액 보충",
    name: "불스원 사계절 워셔액",
    price: 9000,
    quantity: 2,
  },
  {
    group: "타이어 위치교환",
    name: "타이어 로테이션",
    price: 20000,
    quantity: 1,
  },
  { group: "하부 점검", name: "하체 육안 점검", price: 15000, quantity: 1 },
  { group: "실내 살균", name: "에어컨 살균 코팅", price: 35000, quantity: 1 },
];

const REQUIREMENTS_POOL = [
  "",
  "",
  "",
  "꼼꼼하게 봐주세용!!",
  "엔진 소음이 조금 있어요. 같이 봐주세요.",
  "시간 맞춰서 가겠습니다.",
  "지난번에도 여기서 받았어요. 잘 부탁드려요!",
  "대기 오래 걸릴까요? 일정이 좀 빠듯합니다.",
  "정품 부품으로 부탁드립니다.",
  "차에서 진동이 느껴져요. 점검 부탁드려요.",
];

const FAMILY_NAMES = [
  "김",
  "이",
  "박",
  "최",
  "정",
  "강",
  "조",
  "윤",
  "장",
  "임",
  "한",
  "오",
  "서",
  "신",
  "권",
];
const GIVEN_NAMES = [
  "민준",
  "서연",
  "도윤",
  "지우",
  "하준",
  "지호",
  "예준",
  "수아",
  "지훈",
  "유진",
  "현우",
  "서윤",
  "준서",
  "지민",
  "은지",
  "태현",
  "다은",
  "성민",
  "하늘",
  "지아",
];

const VEHICLE_POOL: { brand: string; model: string; fuelType: string }[] = [
  { brand: "현대", model: "그랜저 IG", fuelType: "GASOLINE" },
  { brand: "현대", model: "쏘나타 DN8", fuelType: "GASOLINE" },
  { brand: "현대", model: "아반떼 CN7", fuelType: "GASOLINE" },
  { brand: "현대", model: "투싼 NX4", fuelType: "DIESEL" },
  { brand: "기아", model: "올 뉴 카니발", fuelType: "DIESEL" },
  { brand: "기아", model: "쏘렌토 MQ4", fuelType: "DIESEL" },
  { brand: "기아", model: "K5 DL3", fuelType: "GASOLINE" },
  { brand: "기아", model: "스포티지 NQ5", fuelType: "LPG" },
  { brand: "제네시스", model: "제네시스 GV80", fuelType: "PREMIUM_GASOLINE" },
  { brand: "제네시스", model: "제네시스 G80", fuelType: "PREMIUM_GASOLINE" },
  { brand: "쉐보레", model: "트레일블레이저", fuelType: "GASOLINE" },
  { brand: "르노코리아", model: "QM6", fuelType: "LPG" },
  { brand: "테슬라", model: "모델 3", fuelType: "ELECTRICITY" },
  { brand: "BMW", model: "5시리즈 (G30)", fuelType: "DIESEL" },
  { brand: "벤츠", model: "E-클래스 (W213)", fuelType: "GASOLINE" },
];

const PAYMENT_METHODS = ["CARD", "BANK", "VBANK", "ONSITE"];
const PLATE_HANGUL = [
  "가",
  "나",
  "다",
  "라",
  "어",
  "거",
  "허",
  "호",
  "바",
  "사",
];

/**
 * 예약 상태를 정한다. 대부분은 예약 요청(CREATED)이고, 취소·연기·확정·완료가 섞이도록
 * 확률을 다르게 줬다. (CANCELLED / DEFERRED 는 화면에서 "취소된 예약"으로 처리됨)
 */
function weightedStatus(rng: () => number): string {
  const r = rng();
  if (r < 0.62) return "CREATED";
  if (r < 0.74) return "CANCELLED";
  if (r < 0.82) return "DEFERRED";
  if (r < 0.93) return "CONFIRMED";
  return "COMPLETED";
}

/** 휴대폰 번호(010-XXXX-XXXX)를 난수로 만든다. */
function makePhone(rng: () => number): string {
  return `010${String(randInt(rng, 1000, 9999))}${String(randInt(rng, 1000, 9999))}`;
}

/** 차량 번호(예: 123가4567)를 난수로 만든다. */
function makePlate(rng: () => number): string {
  return `${randInt(rng, 100, 999)}${pick(rng, PLATE_HANGUL)}${randInt(rng, 1000, 9999)}`;
}

/**
 * 예약 한 건의 상품 목록을 만든다.
 * 첫 번째가 메인 상품, 나머지는 추가 상품이다. (추가 상품은 0~3개)
 */
function makeProducts(rng: () => number): ApiProduct[] {
  const service = pick(rng, SERVICE_POOL);
  const main: ApiProduct = {
    group: service.group,
    name: pick(rng, service.names),
    price: randInt(rng, 6, 52) * 5000, // 30,000원 ~ 260,000원
    quantity: 1,
  };
  const addonCount = randInt(rng, 0, 3);
  const addons: ApiProduct[] = [];
  for (let i = 0; i < addonCount; i += 1) {
    addons.push({ ...pick(rng, ADDON_POOL) });
  }
  return [main, ...addons];
}

// ── 고객 데이터 ──────────────────────────────────────────────
// 고객은 날짜와 무관하게 고정된 명단(CUSTOMER_COUNT명)입니다.
// 한 번 만들어 두고 재사용합니다(캐시). 예약은 이 중 한 명을 customerId 로 가리킵니다.
let cachedCustomers: Map<number, ApiCustomer> | null = null;

function getCustomers(): Map<number, ApiCustomer> {
  if (cachedCustomers) return cachedCustomers;
  const rng = mulberry32(hashSeed("customers"));
  const customers = new Map<number, ApiCustomer>();
  for (let i = 1; i <= CUSTOMER_COUNT; i += 1) {
    const vehicle = pick(rng, VEHICLE_POOL);
    customers.set(i, {
      serverId: i,
      name: `${pick(rng, FAMILY_NAMES)}${pick(rng, GIVEN_NAMES)}`,
      phone: makePhone(rng),
      vehicle: { ...vehicle, number: makePlate(rng) },
      visitCount: rng() < 0.35 ? 0 : randInt(rng, 1, 12), // 약 35%는 신규(0회) 고객
    });
  }
  cachedCustomers = customers;
  return customers;
}

// ── 예약 데이터 ──────────────────────────────────────────────
type MockReservation = ApiReservationListItem;

// 한 번 만든 날짜의 예약 목록은 캐시해 둔다. (같은 날짜를 또 요청하면 재사용)
const dayCache = new Map<string, MockReservation[]>();

/** 특정 날짜의 예약 목록을 만든다. (날짜를 seed 로 쓰므로 같은 날짜는 항상 같은 결과) */
function generateDay(date: string): MockReservation[] {
  const cached = dayCache.get(date);
  if (cached) return cached;

  const dayNum = toDayNumber(date);
  const rng = mulberry32(hashSeed(date));
  const count = randInt(rng, 80, 240); // 하루 80~240건 → 무한 스크롤을 확인하기에 넉넉한 양

  const reservations: MockReservation[] = [];
  let remaining = count; // 아직 시간대에 배치하지 못한 예약 수
  let index = 0; // 그날의 순번 (1부터)

  // 예약을 시간대(TIME_SLOTS)에 적당히 흩어서 배치한다.
  for (let s = 0; s < TIME_SLOTS.length; s += 1) {
    const slotsLeft = TIME_SLOTS.length - s;
    const avg = remaining / slotsLeft; // 남은 시간대당 평균 배치 수
    let n =
      s === TIME_SLOTS.length - 1
        ? remaining
        : Math.round(avg * (0.4 + rng() * 1.2));
    n = Math.max(0, Math.min(n, remaining));

    for (let j = 0; j < n; j += 1) {
      index += 1;
      reservations.push({
        // id 에 "날짜번호 + 그날 순번"을 담아, id 만으로 어느 날 몇 번째 예약인지 알 수 있게 한다.
        serverId: dayNum * ID_BASE + index,
        customerId:
          rng() < 0.01
            ? CUSTOMER_COUNT + randInt(rng, 1, 8)
            : randInt(rng, 1, CUSTOMER_COUNT),
        status: weightedStatus(rng),
        reservedAt: `${date}T${TIME_SLOTS[s]}:00`,
        requirements: pick(rng, REQUIREMENTS_POOL),
        products: makeProducts(rng),
        paymentMethod: pick(rng, PAYMENT_METHODS),
      });
    }
    remaining -= n;
  }

  dayCache.set(date, reservations);
  return reservations;
}

/**
 * 예약 id(serverId)로 예약 한 건을 찾는다.
 * id 에 날짜가 인코딩돼 있어, 어느 날짜인지 역으로 계산해 그 날을 다시 만들면
 * 캐시가 없어도(새로고침·상세 URL 직접 접근) 해당 예약을 복원할 수 있다.
 */
function findReservation(serverId: number): MockReservation | null {
  if (!Number.isInteger(serverId) || serverId <= 0) return null;
  const dayNum = Math.floor(serverId / ID_BASE); // 날짜번호
  const index = serverId % ID_BASE; // 그날의 순번 (1부터)
  if (index < 1) return null;
  const day = generateDay(fromDayNumber(dayNum));
  const reservation = day[index - 1];
  return reservation && reservation.serverId === serverId ? reservation : null;
}

// ── Route Handler 에서 호출하는 조회 함수들 ──────────────────

/** 예약 목록 (날짜 + 페이지). page 는 0부터 시작하며, per_page 개수만큼 잘라서 내려준다. */
export function getReservationsPage(
  date: string | null,
  page: number,
  perPage: number,
): ApiReservationListPage {
  const all = isValidDate(date) ? generateDay(date) : [];
  const totalPages = perPage > 0 ? Math.ceil(all.length / perPage) : 0;
  const start = page * perPage;
  const data = all.slice(start, start + perPage);

  return {
    data,
    totalPages,
    hasPrevious: page > 0,
    hasNext: page < totalPages - 1,
  };
}

/** 예약 상세 (목록 항목 + 고객 정보를 합쳐 상세 응답 형태로 만든다.) */
export function getReservationDetail(
  serverId: number,
): ApiReservationDetail | null {
  const reservation = findReservation(serverId);
  if (!reservation) return null;

  const customer = getCustomers().get(reservation.customerId);
  if (!customer) return null;

  return {
    serverId: reservation.serverId,
    status: reservation.status,
    reservedAt: reservation.reservedAt,
    requirements: reservation.requirements,
    customer: {
      serverId: customer.serverId,
      name: customer.name,
      phone: customer.phone,
    },
    vehicle: customer.vehicle,
    products: reservation.products,
    paymentMethod: reservation.paymentMethod,
  };
}

/** 고객 방문 정보 */
export function getCustomer(serverId: number): ApiCustomer | null {
  return getCustomers().get(serverId) ?? null;
}
