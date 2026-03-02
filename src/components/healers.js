import { discChoiceOverlayFromCopy } from "../data/discChoiceOverlay.fromCopy";
import { disciplinePriestTalentLayout } from "../data/discLayout.fromCopy";
import { disciplinePriestTreesFromCopy } from "../data/discTrees.fromCopy";
import { discChoiceOverlayFromCopy as discChoiceOverlayMythic } from "../data/discChoiceOverlay.mythic";
import { disciplinePriestTalentLayout as disciplinePriestTalentLayoutMythic } from "../data/discLayout.mythic";
import { disciplinePriestTreesFromCopy as disciplinePriestTreesMythic } from "../data/discTrees.mythic";
import { disciplinePriestGuideContent } from "../guide/disciplinePriestGuide";
import { holyPaladinGuideContent } from "../guide/holyPaladinGuide";
import { holyPriestGuideContent } from "../guide/holyPriestGuide";
import { mistweaverMonkGuideContent } from "../guide/mistweaverMonkGuide";
import { preservationEvokerGuideContent } from "../guide/preservationEvokerGuide";
import { restorationDruidGuideContent } from "../guide/restorationDruidGuide";
import { restorationShamanGuideContent } from "../guide/restorationShamanGuide";
import { buildGuideSections } from "../guide/sectionLayout";
import { hpalChoiceOverlayFromCopy } from "../data/hpalChoiceOverlay.fromCopy";
import { hpalChoiceOverlayFromCopy as hpalChoiceOverlayMythic } from "../data/hpalChoiceOverlay.mythic";
import { holyPaladinTalentLayout } from "../data/hpalLayout.fromCopy";
import { holyPaladinTalentLayout as holyPaladinTalentLayoutMythic } from "../data/hpalLayout.mythic";
import { holyPaladinTreesFromCopy } from "../data/hpalTrees.fromCopy";
import { holyPaladinTreesFromCopy as holyPaladinTreesMythic } from "../data/hpalTrees.mythic";
import { hpriestChoiceOverlayFromCopy } from "../data/hpriestChoiceOverlay.fromCopy";
import { holyPriestTalentLayout } from "../data/hpriestLayout.fromCopy";
import { holyPriestTreesFromCopy } from "../data/hpriestTrees.fromCopy";
import { mwChoiceOverlayFromCopy } from "../data/mwChoiceOverlay.fromCopy";
import { mistweaverTalentLayout } from "../data/mwLayout.fromCopy";
import { mistweaverTreesFromCopy } from "../data/mwTrees.fromCopy";
import { presChoiceOverlayFromCopy } from "../data/presChoiceOverlay.fromCopy";
import { preservationEvokerTalentLayout } from "../data/presLayout.fromCopy";
import { preservationEvokerTreesFromCopy } from "../data/presTrees.fromCopy";
import { rdruidChoiceOverlayFromCopy } from "../data/rdruidChoiceOverlay.fromCopy";
import { restorationDruidTalentLayout } from "../data/rdruidLayout.fromCopy";
import { restorationDruidTreesFromCopy } from "../data/rdruidTrees.fromCopy";
import { rshamChoiceOverlayFromCopy } from "../data/rshamChoiceOverlay.fromCopy";
import { restorationShamanTalentLayout } from "../data/rshamLayout.fromCopy";
import { restorationShamanTreesFromCopy } from "../data/rshamTrees.fromCopy";

const wowSpecIcons = {
  holyPaladin: "https://assets.rpglogs.com/img/warcraft/icons/large/Paladin-Holy.jpg",
  disciplinePriest: "https://assets.rpglogs.com/img/warcraft/icons/large/Priest-Discipline.jpg",
  holyPriest: "https://assets.rpglogs.com/img/warcraft/icons/large/Priest-Holy.jpg",
  restorationDruid: "https://assets.rpglogs.com/img/warcraft/icons/large/Druid-Restoration.jpg",
  restorationShaman: "https://assets.rpglogs.com/img/warcraft/icons/large/Shaman-Restoration.jpg",
  preservationEvoker: "https://assets.rpglogs.com/img/warcraft/icons/large/Evoker-Preservation.jpg",
  mistweaverMonk: "https://assets.rpglogs.com/img/warcraft/icons/large/Monk-Mistweaver.jpg"
};

export const healers = [
  {
    slug: "holy-paladin",
    shortName: "신기",
    name: "신성 성기사",
    classIcon: wowSpecIcons.holyPaladin,
    color: "#F58CBA",
    enabled: true,
    lastEdited: "2026-03-01",
    talentLayout: holyPaladinTalentLayout,
    talentTrees: holyPaladinTreesFromCopy,
    talentChoiceOverlay: hpalChoiceOverlayFromCopy,
    talentByMode: {
      raid: {
        talentLayout: holyPaladinTalentLayout,
        talentTrees: holyPaladinTreesFromCopy,
        talentChoiceOverlay: hpalChoiceOverlayFromCopy
      },
      mythic: {
        talentLayout: holyPaladinTalentLayoutMythic,
        talentTrees: holyPaladinTreesMythic,
        talentChoiceOverlay: hpalChoiceOverlayMythic
      }
    },
    sections: buildGuideSections(holyPaladinGuideContent)
  },
  {
    slug: "discipline-priest",
    shortName: "수사",
    name: "수양 사제",
    classIcon: wowSpecIcons.disciplinePriest,
    color: "#F4F8FF",
    enabled: true,
    lastEdited: "2026-03-01",
    talentLayout: disciplinePriestTalentLayout,
    talentTrees: disciplinePriestTreesFromCopy,
    talentChoiceOverlay: discChoiceOverlayFromCopy,
    talentByMode: {
      raid: {
        talentLayout: disciplinePriestTalentLayout,
        talentTrees: disciplinePriestTreesFromCopy,
        talentChoiceOverlay: discChoiceOverlayFromCopy
      },
      mythic: {
        talentLayout: disciplinePriestTalentLayoutMythic,
        talentTrees: disciplinePriestTreesMythic,
        talentChoiceOverlay: discChoiceOverlayMythic
      }
    },
    sections: buildGuideSections(disciplinePriestGuideContent)
  },
  {
    slug: "holy-priest",
    shortName: "신사",
    name: "신성 사제",
    classIcon: wowSpecIcons.holyPriest,
    color: "#E7FDFF",
    enabled: false,
    lastEdited: "2026-02-13",
    talentLayout: holyPriestTalentLayout,
    talentTrees: holyPriestTreesFromCopy,
    talentChoiceOverlay: hpriestChoiceOverlayFromCopy,
    sections: buildGuideSections(holyPriestGuideContent)
  },
  {
    slug: "restoration-druid",
    shortName: "회드",
    name: "회복 드루이드",
    classIcon: wowSpecIcons.restorationDruid,
    color: "#FF7C0A",
    enabled: false,
    lastEdited: "2026-02-13",
    talentLayout: restorationDruidTalentLayout,
    talentTrees: restorationDruidTreesFromCopy,
    talentChoiceOverlay: rdruidChoiceOverlayFromCopy,
    sections: buildGuideSections(restorationDruidGuideContent)
  },
  {
    slug: "restoration-shaman",
    shortName: "복술",
    name: "복원 주술사",
    classIcon: wowSpecIcons.restorationShaman,
    color: "#0070DD",
    enabled: false,
    lastEdited: "2026-02-13",
    talentLayout: restorationShamanTalentLayout,
    talentTrees: restorationShamanTreesFromCopy,
    talentChoiceOverlay: rshamChoiceOverlayFromCopy,
    sections: buildGuideSections(restorationShamanGuideContent)
  },
  {
    slug: "preservation-evoker",
    shortName: "용힐",
    name: "보존 기원사",
    classIcon: wowSpecIcons.preservationEvoker,
    color: "#33937F",
    enabled: false,
    lastEdited: "2026-02-13",
    talentLayout: preservationEvokerTalentLayout,
    talentTrees: preservationEvokerTreesFromCopy,
    talentChoiceOverlay: presChoiceOverlayFromCopy,
    sections: buildGuideSections(preservationEvokerGuideContent)
  },
  {
    slug: "mistweaver-monk",
    shortName: "운무",
    name: "운무 수도사",
    classIcon: wowSpecIcons.mistweaverMonk,
    color: "#00FF98",
    enabled: false,
    lastEdited: "2026-02-13",
    talentLayout: mistweaverTalentLayout,
    talentTrees: mistweaverTreesFromCopy,
    talentChoiceOverlay: mwChoiceOverlayFromCopy,
    sections: buildGuideSections(mistweaverMonkGuideContent)
  }
];

export const healerMap = healers.reduce((acc, healer) => {
  acc[healer.slug] = healer;
  return acc;
}, {});
