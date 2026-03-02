export const restorationDruidGuideContent = {
  overview: {
    contentByMode: {
      raid:
        "회복 드루이드는 광범위한 지속 치유(핫) 운용에 강한 힐러입니다. Midnight 레이드에서도 핵심은 [[회복#774]], [[재생#8936]], [[피어나는 생명#33763]]을 피해 패턴보다 앞서 깔아 두고, 피해가 들어오는 순간 핫을 증폭해 유효힐로 전환하는 것입니다.\n\n" +
        "즉발 대응력과 넓은 커버리지가 장점이지만, 사전 준비가 부족하면 동일한 스킬셋으로도 성능 격차가 크게 납니다.",
      mythic:
        "쐐기에서 회드는 이동이 많은 구간에서도 힐 공백이 적고, 점진적 피해 처리에 매우 안정적입니다. 탱커 유지와 파티 광역 회복을 동시에 가져가기 쉽지만, 즉시 폭발 복구가 필요한 구간은 쿨다운 계획이 필요합니다.\n\n" +
        "고단에서는 핫 유지율과 생존기 분배가 딜러 생존률에 직접적으로 연결됩니다."
    }
  },
  talents: {
    contentByMode: {
      raid:
        "레이드 빌드는 광역 핫 유지와 대형 피해 대응을 동시에 강화하는 방향이 기본입니다. 네임드 피해 간격에 맞춰 대형 쿨다운 간격과 핫 확산 노드를 조정하세요.",
      mythic:
        "쐐기 빌드는 탱커 단일 안정성, 파티 광역 복구, 생존 유틸을 균형 있게 맞춥니다. 주간 affix와 던전 특성에 따라 해제/생존 노드를 유동적으로 교체합니다."
    },
    extraByMode: {
      raid:
        "- 장기전: 마나 효율 노드 비중을 높여 후반 핫 유지력을 확보합니다.\n" +
        "- 주기 폭딜: 대형 광역 복구 특성을 우선해 공대 체력선 복구 시간을 줄입니다.",
      mythic:
        "- 폭군: 단일 생존/보스 대응 노드 강화\n" +
        "- 강화: 짧은 주기 광역 복구와 이동 대응 노드 강화"
    }
  },
  "basic-operation": {
    contentByMode: {
      raid:
        "레이드 기본 운영은 '핫 선배치 → 피해 직후 증폭'입니다.\n\n" +
        "1) 평시: [[회복#774]] 유지\n" +
        "2) 탱커/위험 대상: [[피어나는 생명#33763]] + [[재생#8936]]\n" +
        "3) 광역 피해: 대형 쿨다운과 광역 주문으로 체력선 복구",
      mythic:
        "쐐기 기본 운영은 탱커 핫 유지와 파티 분산 피해 관리입니다.\n\n" +
        "1) 탱커 기본 유지: [[피어나는 생명#33763]] + [[회복#774]]\n" +
        "2) 파티 피해: 광역 힐/즉발 핫 확산\n" +
        "3) 급사 직전: 생존기/외생기 우선"
    },
    rotationByMode: {
      raid: {
        items: [
          {
            id: "raid-hot-maintain",
            label: "핫 유지 루틴",
            content:
              "1. [[회복#774]]와 핵심 핫 유지\n" +
              "2. 탱커에 [[피어나는 생명#33763]] 고정\n" +
              "3. 피해 직전 대상 확장\n" +
              "4. 피해 직후 광역 복구 쿨다운 사용"
          },
          {
            id: "raid-burst-response",
            label: "광역 피해 대응",
            content:
              "1. 피해 3~5초 전 핫 분배\n" +
              "2. 피해 직후 광역 힐 스킬 사용\n" +
              "3. 잔여 대상은 단일 즉시 주문으로 정리"
          }
        ]
      },
      mythic: {
        items: [
          {
            id: "mythic-tank-loop",
            label: "탱커 안정 루틴",
            content:
              "1. [[피어나는 생명#33763]] 유지\n" +
              "2. [[회복#774]]/[[재생#8936]]로 연계\n" +
              "3. 급사 위험 시 외생기 선사용"
          },
          {
            id: "mythic-party-recover",
            label: "파티 광역 정리",
            content:
              "1. 파티 피해 직후 광역 회복기 사용\n" +
              "2. 이동 중 즉발 핫으로 공백 최소화\n" +
              "3. 과치유 구간은 저비용 주문으로 전환"
          }
        ]
      }
    }
  },
  "advanced-usage": {
    contentByMode: {
      raid:
        "고급 운용은 대형 쿨다운을 '피해가 터진 뒤'가 아니라 '피해가 시작되는 타이밍'에 맞추는 것입니다. 핫이 이미 깔려 있어야 쿨다운 가치가 극대화되므로, 쿨기보다 사전 배치가 우선입니다.",
      mythic:
        "쐐기 고급 운용은 풀 단위로 마나와 생존기를 쪼개 쓰는 것입니다. 쉬운 풀에서 과소모를 줄이고, 위험 풀/보스에 회복 예산을 남겨 두면 전체 성공률이 높아집니다."
    }
  },
  stats: {
    extraByMode: {
      raid:
        "회드는 가속/특화/치명의 상호작용이 핫 중첩 구조에 크게 영향을 줍니다. 단일 고정값보다 자신의 로그에서 핫 가동률과 과치유를 보고 조정하는 편이 정확합니다.",
      mythic:
        "쐐기에서는 생존 압박 때문에 유연성 가치가 올라가지만, 캐스트 템포를 유지할 가속이 너무 낮아지지 않게 밸런스를 유지해야 합니다."
    },
    raid: {
      summary: "레이드 기준 회복 드루이드 영웅 특성별 스탯 우선순위입니다.",
      cards: [
        {
          id: "wildstalker",
          title: "Wildstalker Priority",
          icon: "https://wow.zamimg.com/images/wow/icons/large/spell_nature_rejuvenation.jpg",
          accent: "#f59f42",
          priorities: [
            { label: "Haste" },
            { label: "Mastery", note: "핫 중첩 전투에서 강함" },
            { label: "Crit" },
            { label: "Versatility" }
          ]
        },
        {
          id: "keeper-of-the-grove",
          title: "Keeper of the Grove Priority",
          icon: "https://wow.zamimg.com/images/wow/icons/large/spell_nature_rejuvenation.jpg",
          accent: "#7ad18f",
          priorities: [
            { label: "Haste" },
            { label: "Crit" },
            { label: "Mastery", note: "네임드 패턴 따라 변동" },
            { label: "Versatility" }
          ]
        }
      ]
    },
    mythic: {
      summary: "쐐기 기준 회복 드루이드 기본 스탯 우선순위입니다.",
      cards: [
        {
          id: "mythic-main",
          title: "Resto Druid Mythic+ Priority",
          icon: "https://wow.zamimg.com/images/wow/icons/large/spell_nature_rejuvenation.jpg",
          accent: "#56e39f",
          priorities: [
            { label: "Haste" },
            { label: "Versatility", note: "생존/안정성" },
            { label: "Mastery", note: "파티 체력 분포 의존" },
            { label: "Crit" }
          ]
        }
      ]
    }
  },
  "recommended-sites": {
    intro: "패치 직후 빌드 변경이 잦으므로 아래 자료를 함께 보는 것을 권장합니다.",
    items: [
      {
        title: "Wowhead Restoration Druid",
        url: "https://www.wowhead.com/guide/classes/druid/restoration/overview-pve-healer",
        description: "특성/주문/운영 기준"
      },
      {
        title: "Warcraft Logs",
        url: "https://www.warcraftlogs.com/",
        description: "핫 유지율, 쿨다운 타이밍, 과치유 복기"
      }
    ]
  }
};
