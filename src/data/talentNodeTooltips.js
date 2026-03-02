// Optional custom tooltip override per healer/node.
// Key can be layout node id (e.g. "110424") or meta id (e.g. "rdruid-spec-199").
//
// Fields:
// - enabled?: boolean (default false)
// - title: string
// - subtitle?: string
// - body?: string (supports line breaks)
// - href?: string (click target override)
// - disableWowhead?: boolean (if true, built-in Wowhead hover is disabled for this node)

export const talentNodeTooltips = {
  "restoration-druid": {
    // Toggle this to true when you want to replace Wowhead tooltip with custom content.
    "rdruid-spec-199": {
      enabled: false,
      disableWowhead: true,
      href: "https://www.wowhead.com/ko/spell=392167/상록숲",
      title: "상록숲 (Everbloom)",
      subtitle: "커스텀 툴팁",
      body:
        "여기에 Maxroll 기준 설명을 직접 입력하세요.\n" +
        "예: 활성화 조건, 우선순위, 레이드/쐐기 차이, 시너지 특성."
    }
  }
};
