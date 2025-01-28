import { BadgesContext, ConfigContext } from "./Contexts";
import React, { memo, useContext } from 'react';

import { BadgeInfo } from "tmi.js";
import { createBadgeSrcSet } from "./Utils";

interface BadgesProps {
  badges?: string
}

export const Badges = memo((props: BadgesProps) => {
  const configContext = useContext(ConfigContext);
  const badgeContext = useContext(BadgesContext);

  if (!configContext?.showBadges) return null;

  let emoteScale = Math.max(1, Math.min(4, Math.round(configContext!.fontSize / 15)))
  let badges = props.badges ?? "";
  let badgeElements: Array<any> = [];
  for (const badge of badges.split(',')) {
    let badgeSplit = badge.split("/")
    let badgeName = badgeSplit[0];
    let badgeData = badgeContext.get(badgeName);
    if (!badgeData) continue;

    let badgeVersionNum = parseInt(badgeSplit[1]);
    let badgeVersion = badgeData[Math.max(0, Math.min(badgeVersionNum, badgeData.length - 1))];
    
    if(badgeVersion === undefined) continue;
    badgeElements.push(<img className={"badge badge-scale-" + emoteScale} alt={""} key={badge} src={badgeVersion[0]} srcSet={createBadgeSrcSet(badgeVersion)} />)
  }

  return (
    <>{badgeElements}</>
  )
})