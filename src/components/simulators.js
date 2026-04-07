export const simulators = [
  {
    slug: "hpal-healer-practice",
    name: "힐러 연습 게임",
    description: "20인 프레임에 직접 힐을 해보는 연습 모드입니다. 일반/영웅/신화/월퍼킬 4가지 난이도로 즐길 수 있습니다.",
    enabled: true
  },
  {
    slug: "hps-lab",
    name: "힐파이 실험실",
    description: "힐파이 우선순위를 통계적으로 분석",
    enabled: false
  },
  {
    slug: "disc-ramp-planner",
    name: "수사 램프 시뮬레이터",
    description: "마나, 램프 주기를 기준으로 전투시간내 최적화 운영을 계산합니다.",
    enabled: false
  },
];

export const simulatorMap = simulators.reduce((acc, simulator) => {
  acc[simulator.slug] = simulator;
  return acc;
}, {});
