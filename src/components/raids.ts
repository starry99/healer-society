import { buildRaidGuideSections } from "../guide/raidSectionLayout";
import { boss1GuideContent } from "../midnight_s1/boss1Guide";
import { boss2GuideContent } from "../midnight_s1/boss2Guide";
import { boss3GuideContent } from "../midnight_s1/boss3Guide";
import { boss4GuideContent } from "../midnight_s1/boss4Guide";
import { boss5GuideContent } from "../midnight_s1/boss5Guide";
import { boss6GuideContent } from "../midnight_s1/boss6Guide";
import { boss7GuideContent } from "../midnight_s1/boss7Guide";
import { boss8GuideContent } from "../midnight_s1/boss8Guide";
import { boss9GuideContent } from "../midnight_s1/boss9Guide";

export type RaidMember = {
  slug: string;
  name: string;
  fullName: string;
  loc: string;       
  icon: string;
  color: string;
  enabled: boolean;
  sections: ReturnType<typeof buildRaidGuideSections>;
};

export const raidMembers: RaidMember[] = [
  {
    slug: "raid-boss-1",
    name: "아베르지안",
    fullName: "전제군주 아베르지안",
    loc: "공허첨탑",
    icon: "https://wow.zamimg.com/images/wow/journal/ui-ej-boss-host-general.png",
    color: "#845ef7",
    enabled: false,
    sections: buildRaidGuideSections(boss1GuideContent),
  },

  {
    slug: "raid-boss-2",
    name: "보라시우스",
    fullName: "보라시우스",
    loc: "공허첨탑",
    icon: "https://wow.zamimg.com/images/wow/journal/ui-ej-boss-kaiju.png",
    color: "#845ef7",
    enabled: false,
    sections: buildRaidGuideSections(boss2GuideContent),
  },

  {
    slug: "raid-boss-3",
    name: "살라다르",
    fullName: "몰락한 왕 살라다르",
    loc: "공허첨탑",
    icon: "https://wow.zamimg.com/images/wow/journal/ui-ej-boss-salhadaar.png",
    color: "#845ef7",
    enabled: false,
    sections: buildRaidGuideSections(boss3GuideContent),
  },
  {
    slug: "raid-boss-4",
    name: "바 & 에",
    fullName: "바엘고어와 에조라크",
    loc: "공허첨탑",
    icon: "https://wow.zamimg.com/images/wow/journal/ui-ej-boss-dragon-duo.png",
    color: "#845ef7",
    enabled: false,
    sections: buildRaidGuideSections(boss4GuideContent),
  },

  {
    slug: "raid-boss-5",
    name: "선봉대",
    fullName: "빛에 눈이 먼 선봉대",
    loc: "공허첨탑",
    icon: "https://wow.zamimg.com/images/wow/journal/ui-ej-boss-paladin-trio.png",
    color: "#845ef7",
    enabled: false,
    sections: buildRaidGuideSections(boss5GuideContent),
  },

  {
    slug: "raid-boss-6",
    name: "우주의 왕관",
    fullName: "우주의 왕관",
    loc: "공허첨탑",
    icon: "https://wow.zamimg.com/images/wow/journal/ui-ej-boss-alleria.png",
    color: "#845ef7",
    enabled: false,
    sections: buildRaidGuideSections(boss6GuideContent),
  },

  {
    slug: "raid-boss-7",
    name: "카이메루스",
    fullName: "꿈결을 벗어난 신 카이메루스",
    loc: "꿈의 균열",
    icon: "https://wow.zamimg.com/images/wow/journal/ui-ej-boss-malformed-manifestation.png",
    color: "#845ef7",
    enabled: false,
    sections: buildRaidGuideSections(boss7GuideContent),
  },

  {
    slug: "raid-boss-8",
    name: "벨로렌",
    fullName: "알라르의 자손 벨로렌",
    loc: "진격로",
    icon: "https://wow.zamimg.com/images/wow/journal/ui-ej-boss-light-void-phoenix.png",
    color: "#845ef7",
    enabled: false,
    sections: buildRaidGuideSections(boss8GuideContent),
  },

  {
    slug: "raid-boss-9",
    name: "르우라",
    fullName: "한밤의 도래",
    loc: "진격로",
    icon: "https://wow.zamimg.com/images/wow/journal/ui-ej-boss-lura-midnight.png",
    color: "#f783ac",
    enabled: false,
    sections: buildRaidGuideSections(boss9GuideContent),
  },
];

export const raidMemberMap: Record<string, RaidMember> = raidMembers.reduce(
  (acc, member) => {
    acc[member.slug] = member;
    return acc;
  },
  {} as Record<string, RaidMember>,
);
