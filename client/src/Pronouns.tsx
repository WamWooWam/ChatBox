import { ConfigContext, PronounsContext } from "./Contexts";
import React, { memo, useContext } from 'react';

interface PronounsProps {
    nick: string;
}

export const Pronouns = memo((props: PronounsProps) => {
    const configContext = useContext(ConfigContext);
    const pronounsContext = useContext(PronounsContext);
    if(!configContext?.showPronouns) return null;

    let display = "";
    let pronouns = pronounsContext?.userMap.get(props.nick);
    if (!pronouns) pronounsContext?.fetchPronouns(props.nick);
    else {
        display = pronounsContext?.displayMap.get(pronouns.pronoun) ?? "";
    }

    return (display ? <span className="pronouns">{display}</span> : null);
})
