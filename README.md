# 🔧 Mycle 웹 프론트엔드 사전과제

정비소 사장님이 들어온 예약 요청을 확인하고, 작업을 받을지(확정) 말지(불가) 처리하는 모바일 웹입니다. 예약 목록 화면과 상세 화면, 두 개로 이루어져 있어요.

이미 동작하는 코드가 들어 있는 저장소를 드립니다. 처음부터 새로 만드는 과제는 아니고, **이미 있는 코드를 직접 돌려 보고 읽으면서 문제를 찾아내고, 그걸 어떻게 풀지 정리해 주시는 것**이 핵심입니다.

<br/>

## 🎯 무엇을 해주시면 되나요

문제를 찾는 것에서 그치지 말고, 중요하다고 본 것들은 **실제로 고치거나 개선해 주세요.** 다만 발견한 문제를 전부 다 해결해야 하는 건 아닙니다. 얼마나 많이 고쳤는지보다, 무엇을 왜 그렇게 고쳤는지를 더 중요하게 봅니다.

- 코드를 돌려 보고 읽으면서 "이건 좀 이상한데", "이렇게 하면 더 낫겠다" 싶은 지점을 직접 찾아 주세요. 동작이든 성능이든 구조든 상태 관리든, 관점은 자유입니다.
- 우선순위가 높다고 본 문제는 직접 코드로 개선해 주세요. 시간이 부족해 다 못 했다면, 어떻게 풀려고 했는지 방향이라도 정리해 주시면 됩니다.
- 찾은 문제를 왜 문제라고 봤는지, 어떻게 풀었는지(또는 풀 생각인지)를 정리해 주세요. 결과물과 함께 그 판단 과정이 잘 보였으면 합니다.
- AI를 쓰셔도 괜찮습니다. 대신 사용하셨다면 어떤 질문을 주고받았는지 정도는 같이 남겨 주세요. 가능하면 대화 세션도 공유해 주시면 좋아요. (Claude Code는 `/export`로 내보낼 수 있습니다.)

<br/>

## 👀 어떤 점을 보나요

- 코드와 요구사항 사이에서 문제를 스스로 찾아내고, 그걸 납득되게 설명하는지
- 관심사를 어떻게 나누고 폴더·모듈 구조를 어떻게 잡는지
- 상태 관리와 비동기 처리, 데이터 흐름을 다루는 방식
- AI 같은 도구를 생산성과 품질로 잘 연결하는지
- 고민한 내용을 글로 정리하고, 남이 읽기 좋게 코드를 쓰는지
- README와 PR 설명 문서 작성 능력 (리뷰어에게 생각이 잘 전달되는지)

<br/>

## 🚀 시작하기

```bash
npm install
npm run dev          # http://localhost:3000

# 빌드 / 린트
npm run build
npm run lint
```

어떤 날짜를 선택해도 그 날짜의 예약이 내려오니, 헤더의 이전/다음 날짜로 옮겨 가며 자유롭게 확인해 주세요. (데이터 출처는 아래 **API** 섹션 참고)

<br/>

## 📋 기능 요구사항

아래는 이 서비스가 충족해야 할 기능 요구사항입니다. 실제 코드가 이 요구사항대로 동작하는지 직접 확인하고, 어긋나거나 더 나은 방법이 있다면 개선해 주세요.

### 예약 요청 리스트 (`/`)

- 선택한 날짜의 예약을 시간대별로 묶어서 보여줍니다. (`오전 9:00 · {n}건`)
- 상단 헤더에서 이전/다음 날짜로 옮기면 해당 날짜 데이터를 다시 불러옵니다.
- `취소된 예약 안보기` 토글(기본 켜짐) — 끄면 취소된 예약도 시간대 건수에 반영되어 함께 보입니다. 취소된 카드는 흐리게, `취소된 예약` 배지가 붙고, 눌러도 상세로 넘어가지 않습니다.
- 무한 스크롤로 다음 페이지(`page` / `per_page`)를 이어서 불러옵니다.
- 카드를 누르면 상세 화면으로 이동합니다.
- 스크롤 시 헤더 그림자, 마지막 카드 아래 여백, 긴 텍스트 말줄임 같은 디테일이 들어가 있습니다.

### 예약 상세 (`/reservations/[id]`)

- 예약 한 건의 상품·요청사항·고객·차량·결제 정보를 보여줍니다.
- 화면 아래 고정 버튼으로 `예약 불가` / `예약 확정`을 처리합니다.

### 확정 / 불가 처리

- 버튼을 누르면 확정/불가 팝업이 뜹니다. (`취소`, 딤 영역 클릭, `ESC`로 닫힘)
- 결정한 값은 로컬 저장소(localStorage)에 저장되어, 목록으로 돌아오면 그 예약에 결과가 반영되어야 합니다.

<br/>

## 💡 이런 방향으로 바꿔 보셔도 좋아요

문제를 찾는 것 외에, 아래처럼 구조 자체를 손봐 주셔도 환영합니다.

- 지금은 화면별 파일에 로직·상태·UI가 함께 들어 있는데, 컴포넌트·데이터 훅·API 레이어·도메인 매퍼처럼 관심사를 나눠 폴더 구조를 다시 잡아 주셔도 좋아요. BFF(`src/app/api`)를 포함한 전체 구조를 자유롭게 설계하셔도 됩니다. 어떤 기준으로 나눴는지 적어 주시면 좋아요.
- 지금은 확정/불가 결정값을 localStorage로 관리하고 있는데, Zustand나 Jotai 같은 전역 상태 관리 라이브러리로 바꿔서 풀어 주셔도 됩니다. 어떤 기준으로 선택했는지 적어 주시면 더 좋아요.
- Next.js로 만들어져 있으니 SSR, CSR, 서버 컴포넌트 등 Next가 제공하는 기능을 활용해 리팩토링하셔도 좋습니다. 데이터를 어디서 언제 가져오는 게 맞을지 같이 고민해 주세요.

<br/>

## 🔌 API

외부 서버를 직접 호출하지 않고, 앱 내부 BFF(Next.js Route Handler)가 만들어 주는 목 데이터를 사용합니다. 아래 엔드포인트·응답 형태는 실제 서버 스펙을 그대로 흉내 냅니다. (구현: `src/app/api/`)

- Base URL: `/api` (앱과 같은 서버에서 동작)
- 어떤 날짜를 조회해도 그 날짜를 기준으로 예약 목데이터가 생성됩니다.
- 목록 응답에는 고객의 방문 횟수가 없고 `customerId`만 내려옵니다. 방문 횟수는 고객 API(`/customers/{id}`)를 따로 호출해 채워 넣어야 합니다.

### 예약 목록 조회

```
GET /reservations?date={YYYY-MM-DD}&page={0}&per_page={10}
```

| 파라미터   | 타입    | 설명                     |
| ---------- | ------- | ------------------------ |
| `date`     | String  | 요청 날짜 (`YYYY-MM-DD`) |
| `page`     | Integer | 페이지 번호 (0부터 시작) |
| `per_page` | Integer | 페이지당 개수            |

```jsonc
{
  "data": [
    {
      "serverId": 35,
      "customerId": 464,
      "status": "CREATED",
      "reservedAt": "2024-07-14T09:00:00",
      "requirements": "",
      "products": [
        {
          "group": "엔진오일 교체",
          "name": "쉘 힐릭스 울트라 5W-40",
          "price": 105000,
          "quantity": 1,
        },
      ],
      "paymentMethod": "VBANK",
    },
  ],
  "totalPages": 9,
  "hasPrevious": false,
  "hasNext": true,
}
```

| 필드                   | 타입     | 설명                       |
| ---------------------- | -------- | -------------------------- |
| `data[].serverId`      | Long     | 예약 고유 ID               |
| `data[].customerId`    | Long     | 고객 ID (고객 API 조회 키) |
| `data[].status`        | String   | 예약 상태                  |
| `data[].reservedAt`    | String   | 예약 일시                  |
| `data[].requirements`  | String   | 고객 요청사항              |
| `data[].products`      | Object[] | 예약 상품 목록             |
| `data[].paymentMethod` | String   | 결제 방법                  |
| `totalPages`           | Integer  | 전체 페이지 수             |
| `hasPrevious`          | Boolean  | 이전 페이지 유무           |
| `hasNext`              | Boolean  | 다음 페이지 유무           |

- `status`가 `CANCELLED` 또는 `DEFERRED`면 취소된 예약으로 봅니다.
- 상품 목록의 첫 번째 항목이 메인 상품이고, 나머지는 모두 추가 상품입니다.

### 예약 상세 조회

```
GET /reservations/{serverId}
```

```jsonc
{
  "serverId": 1,
  "status": "CREATED",
  "reservedAt": "2024-07-14T09:00:00",
  "requirements": "꼼꼼하게 봐주세용!!",
  "customer": { "serverId": 2, "name": "김철수", "phone": "01033334444" },
  "vehicle": {
    "brand": "기아",
    "model": "올 뉴 카니발",
    "number": "123어5505",
    "fuelType": "DIESEL",
  },
  "products": [
    {
      "group": "브레이크오일 교체",
      "name": "액트루브 SUPER DOT4",
      "price": 261000,
      "quantity": 1,
    },
  ],
  "paymentMethod": "VBANK",
}
```

| 필드            | 타입     | 설명           |
| --------------- | -------- | -------------- |
| `serverId`      | Long     | 예약 고유 ID   |
| `status`        | String   | 예약 상태      |
| `reservedAt`    | String   | 예약 일시      |
| `requirements`  | String   | 고객 요청사항  |
| `customer`      | Object   | 고객 정보      |
| `vehicle`       | Object   | 차량 정보      |
| `products`      | Object[] | 예약 상품 목록 |
| `paymentMethod` | String   | 결제 방법      |

### 고객 방문 정보 조회

```
GET /customers/{id}
```

```jsonc
{
  "serverId": 1,
  "name": "홍길동",
  "phone": "01011112222",
  "vehicle": {
    "brand": "제네시스",
    "model": "제네시스 GV80",
    "number": "123모8199",
    "fuelType": "PREMIUM_GASOLINE",
  },
  "visitCount": 1,
}
```

| 필드         | 타입    | 설명          |
| ------------ | ------- | ------------- |
| `serverId`   | Long    | 고객 고유 ID  |
| `name`       | String  | 고객명        |
| `phone`      | String  | 고객 전화번호 |
| `vehicle`    | Object  | 차량 정보     |
| `visitCount` | Integer | 방문 횟수     |

- `visitCount`가 0이면 신규 고객, 0보다 크면 재방문 고객입니다.

### 공통 모델

상품 정보 (`products[]`)

| 필드       | 타입    | 설명     |
| ---------- | ------- | -------- |
| `group`    | String  | 서비스명 |
| `name`     | String  | 상품명   |
| `price`    | Integer | 가격     |
| `quantity` | Integer | 개수     |

차량 정보 (`vehicle`)

| 필드       | 타입   | 설명     |
| ---------- | ------ | -------- |
| `brand`    | String | 브랜드명 |
| `model`    | String | 모델명   |
| `number`   | String | 차량번호 |
| `fuelType` | String | 연료종류 |

### 상수

- 예약 상태: `CREATED`(예약 요청), `CANCELLED`(예약 취소), `CONFIRMED`(작업 가능), `DEFERRED`(작업 불가능), `COMPLETED`(작업 완료)
- 결제 수단: `CARD`(카드결제), `BANK`(계좌이체), `VBANK`(무통장입금), `ONSITE`(현장결제)
- 연료 종류: `PREMIUM_GASOLINE`(고급 휘발유), `GASOLINE`(일반 휘발유), `DIESEL`(경유), `LPG`, `ELECTRICITY`(전기)

<br/>

## 🛠️ 기술 스택과 구조

React, Next.js(App Router), TypeScript, Tailwind CSS로 만들어져 있고, 데이터 패칭은 `@tanstack/react-query`를 씁니다. 폰트는 Pretendard입니다.

화면 로직은 대부분 각 화면 파일 안에 들어 있습니다.

```
src/
  app/
    page.tsx                     # 목록 화면 진입점
    ReservationListClient.tsx    # 목록 화면 본체
    reservations/[id]/page.tsx   # 상세 화면
    api/                         # BFF: 목 데이터를 내려주는 Route Handler
      reservations/route.ts      #   예약 목록
      reservations/[id]/route.ts #   예약 상세
      customers/[id]/route.ts    #   고객 방문 정보
      _lib/mock.ts               #   목 데이터 생성기
    layout.tsx  globals.css
  lib/reservations.ts            # API 호출·데이터 가공 함수
  providers/                     # react-query Provider
```

구조에 정해진 정답은 없으니 자유롭게 바꾸셔도 좋아요. 바꿨다면 어떤 기준으로 나눴는지 적어 주세요.

<br/>

## 📮 제출


1. 본인 소유의 **비공개(Private)** GitHub 저장소에 올리고, 아래 세 명을 collaborator로 초대해 주세요. (과제가 외부로 새어 나가면 안 되니 public 저장소에는 올리지 말아 주세요)
   - kay.wock@macarong.net
   - summer@macarong.net
   - bay.kim@macarong.net
2. 코드 변경사항은 **Pull Request**로 올려 주세요.
   - **어떤 부분을, 왜 수정했는지** (어디가 문제였고 어떻게 고쳤는지)를 적어 주세요.
3. **README**에는 코드 단위 설명이 아니라, **작업 전체를 관통한 생각**을 적어 주세요.
   - 어떤 기준·관점을 중심으로 수정했는지
   - AI를 썼다면 어떤 식으로(어떤 질문을, 어디에) 썼는지, 가능하면 세션도 함께
4. PR은 모두 main 브랜치에 머지해주세요. 작업의 최종결과물은 main 브랜치입니다. 

완성도보다 "어떻게 생각했는지"가 더 궁금합니다. 부담 갖지 말고 적어 주세요.😃
