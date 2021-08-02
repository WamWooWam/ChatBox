import { BadgesContext, ConfigContext } from "./Chat";
import React, { useContext } from 'react';
import { createSrcSet } from "./Utils";

interface BadgesProps {
  badges?: string
}

export const Badges = (props: BadgesProps) => {
  const configContext = useContext(ConfigContext);
  const badgeContext = useContext(BadgesContext);

  if(!configContext?.showBadges) return null;

  let badges = props.badges ?? "";
  let badgeElements: Array<any> = [];
  for (const badge of badges.split(',')) {
    let badgeData = badgeContext.get(badge);
    if (!badgeData) continue;

    badgeElements.push(<img className="badge" alt={""} key={badge} srcSet={createSrcSet(badgeData)} src={badgeData[0]} />)
  }

  return (
    <>{badgeElements}</>
  )
}