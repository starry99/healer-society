export const mistweaverMonkGuideContent = {
  overview: {
    contentByMode: {
      raid:
        "운무 수도사는 지속 회복(핫)과 폭발 복구를 모두 다룰 수 있는 하이브리드 힐러입니다. [[소생의 안개#115151]] 기반 분산 치유와 [[정수의 샘#191837]]/[[재활#116670]] 기반 광역 복구를 상황에 맞게 전환하는 것이 핵심입니다.\n\n" +
        "Midnight 레이드 기준으로는 피해 타이밍 직전 준비(안개 배분)와 피해 직후 폭발 치유(재활/집중)가 성능 차이를 만듭니다.",
      mythic:
        "쐐기 운무는 근접 유지 시 딜 기여와 힐링을 동시에 가져가기 좋고, 위기 상황에서는 강한 단일 복구로 급사를 막는 능력이 뛰어납니다.\n\n" +
        "고단에서는 이동 중 즉시 대응 능력과 생존기 배분이 더 중요해지므로, 단순 회전보다 쿨기 타이밍 설계가 로그를 크게 좌우합니다."
    }
  },
  talents: {
    disabledModes: ["mythic"],
    contentByMode: {
      raid:
        "레이드 빌드는 광역 피해 주기에 맞춰 [[소생의 안개#115151]] 확산과 [[재활#116670]] 효율을 극대화하는 방향이 기본입니다. 영웅 특성은 공대 피해 패턴과 이동량을 기준으로 선택합니다.",
      mythic:
        "쐐기 빌드는 단일 생존 대응과 짧은 주기 광역 복구를 모두 챙기는 구성이 안정적입니다. 인터럽트/기동이 많은 구간에서는 즉시 반응 가능한 노드를 우선 배치합니다."
    },
    extraByMode: {
      raid:
        "- 광역 피해 간격이 짧으면 [[정수의 샘#191837]] 연계 노드 비중을 높입니다.\n" +
        "- 장기전이면 마나 효율 노드를 넣어 후반 붕괴를 방지합니다.",
      mythic:
        "- 폭군 주간: 단일 복구/외생기 비중 강화\n" +
        "- 강화 주간: 짧은 광역 복구와 기동 노드 비중 강화"
    }
  },
  "basic-operation": {
    contentByMode: {
      raid:
        "기본 운영은 '안개 유지 → 피해 직후 광역 복구'입니다.\n\n" +
        "1) 평시: [[소생의 안개#115151]] 유지\n" +
        "2) 중간 피해: [[정수의 샘#191837]]\n" +
        "3) 큰 피해: [[재활#116670]] + 후속 단일 정리",
      mythic:
        "쐐기 기본 운영은 탱커/위험 대상 우선 복구입니다.\n\n" +
        "1) 단일 급사: [[포용의 안개#124682]] + [[생명의 고치#116849]]\n" +
        "2) 파티 광역 피해: [[정수의 샘#191837]] 또는 [[재활#116670]]\n" +
        "3) 이동 구간: 즉발 주문으로 공백 최소화"
    },
    rotationByMode: {
      raid: {
        items: [
          {
            id: "raid-rem-cycle",
            label: "안개 유지 루틴",
            content:
              "1. [[소생의 안개#115151]] 유지\n" +
              "2. 피해 직전 [[정수의 샘#191837]] 준비\n" +
              "3. 피해 직후 [[재활#116670]]\n" +
              "4. 잔피는 단일 주문으로 정리"
          },
          {
            id: "raid-burst-heal",
            label: "광역 폭딜 대응",
            content:
              "1. 피해 전 안개 분배\n" +
              "2. [[재활#116670]] 또는 대형 광역기 사용\n" +
              "3. 후속 피해는 [[포용의 안개#124682]]로 고위험 대상 우선"
          }
        ]
      },
      mythic: {
        items: [
          {
            id: "mythic-tank-save",
            label: "탱커 생존 루틴",
            content:
              "1. 탱커 급락 시 [[포용의 안개#124682]]\n" +
              "2. 사망 위험이면 [[생명의 고치#116849]]\n" +
              "3. 안정화 후 파티 힐로 전환"
          },
          {
            id: "mythic-party-recover",
            label: "파티 광역 복구",
            content:
              "1. 광역 피해 직후 [[정수의 샘#191837]]\n" +
              "2. 추가 피해가 이어지면 [[재활#116670]]\n" +
              "3. 잔여 대상은 즉시 단일 치유"
          }
        ]
      }
    }
  },
  "advanced-usage": {
    contentByMode: {
      raid:
        "고급 운영은 '재활을 어디에 맞출지'보다 '재활 전에 안개를 얼마나 깔아두는지'가 더 중요합니다. 피해 직전 준비가 충분하면 같은 쿨다운으로 더 많은 유효힐을 확보할 수 있습니다.",
      mythic:
        "쐐기 고급 운영은 생존기와 기동기 소모를 구간 단위로 관리하는 것입니다. 큰 풀에서 전부 쓰고 다음 구간에서 비는 패턴을 피하려면, 강/약 구간을 나눠 쿨기를 분산 사용해야 합니다."
    }
  },
  stats: {
    extraByMode: {
      raid:
        "운무는 가속과 치명이 기본 체감이 좋고, 특화는 운용 방식에 따라 가치가 크게 바뀝니다. 고정 우선순위보다 자신의 로그(과치유/주문 비중)를 같이 보면서 조정하는 편이 정확합니다.",
      mythic:
        "쐐기에서는 생존 압박으로 유연성 가치가 올라갑니다. 다만 가속이 너무 낮으면 대응 템포가 끊기므로 최소 템포를 유지한 뒤 유연성을 보강하는 방식이 일반적입니다."
    },
    raid: {
      summary: "레이드 기준 운무 수도사 기본 스탯 우선순위입니다.",
      cards: [
        {
          id: "raid-main",
          title: "Mistweaver Raid Priority",
          icon: "https://wow.zamimg.com/images/wow/icons/large/spell_monk_uplift.jpg",
          accent: "#57f7b4",
          priorities: [
            { label: "Haste" },
            { label: "Crit", note: "폭발 복구 안정화" },
            { label: "Mastery", note: "플레이 스타일 따라 변동" },
            { label: "Versatility" }
          ]
        }
      ]
    },
    mythic: {
      summary: "쐐기 기준 운무 수도사 기본 스탯 우선순위입니다.",
      cards: [
        {
          id: "mythic-main",
          title: "Mistweaver Mythic+ Priority",
          icon: "https://wow.zamimg.com/images/wow/icons/large/spell_monk_uplift.jpg",
          accent: "#8ef57e",
          priorities: [
            { label: "Haste" },
            { label: "Versatility", note: "고단 생존 안정화" },
            { label: "Crit" },
            { label: "Mastery" }
          ]
        }
      ]
    }
  },
  "recommended-sites": {
    intro: "빌드 업데이트와 로그 복기를 위해 아래 사이트를 기준으로 확인하면 편합니다.",
    items: [
      {
        title: "Wowhead Mistweaver Monk",
        url: "https://www.wowhead.com/guide/classes/monk/mistweaver/overview-pve-healer",
        description: "특성/주문/로테이션 기준 정리"
      },
      {
        title: "Warcraft Logs",
        url: "https://www.warcraftlogs.com/",
        description: "재활 타이밍, 과치유, 쿨기 효율 분석"
      }
    ]
  }
};
