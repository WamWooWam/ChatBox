import { ConfigContext, EmotesContext } from "./Contexts";
import { Emote, TwitchEmote } from './Types';
import React, { useContext } from 'react';

import { createEmoteSrcSet } from './Utils';

interface ContentProps {
  text: string;
  emotes?: string;
  me?: boolean;
}

export const Content = (props: ContentProps) => {
  let text = props.text;
  let rawEmotes = props.emotes ?? ""

  // this has to be done before you parse emotes
  let isMe = props.me !== undefined ? props.me : false;

  // emotes appear as <emoteid>:<start>-<end>,<start>-<end>/ (e.g. 302347771:16-26,33-43)
  let emotes: Array<TwitchEmote> = [];
  for (const emote of rawEmotes.split('/')) {
    if (!emote) continue;

    const [emoteId, indicies] = emote.split(':');
    for (const indexSet of indicies.split(',')) {
      const [start, end] = indexSet.split('-');
      emotes.push({
        id: emoteId,
        urls: [
          `https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/default/dark/1.0`,
          `https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/default/dark/2.0`,
          `https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/default/dark/3.0`,
        ],
        start: Math.max(+start, 0),
        end: Math.min(+end + 1, text.length)
      });
    }
  }

  let channelEmotes = useContext(EmotesContext);
  let idx = -1;
  let nextIdx = 0;
  do {
    nextIdx = text.indexOf(' ', idx + 1);
    if (nextIdx === -1) {
      nextIdx = text.length;
    }

    let name = text.slice(idx + 1, nextIdx);
    let emote = channelEmotes.get(name);
    if (emote) {
      emotes.push({
        id: name,
        urls: emote,
        start: Math.max(idx + 1, 0),
        end: Math.min(nextIdx, text.length)
      });
    }
  } while ((idx = text.indexOf(' ', nextIdx)) !== -1);

  emotes.sort((x, y) => x.start - y.start);

  let index = 0;
  let content: Array<string | Emote> = [];
  for (const emote of emotes) {
    content.push(text.slice(index, emote.start));
    content.push({
      id: emote.id,
      urls: emote.urls,
      key: `${emote.start}-${emote.end}`
    });
    index = emote.end;
  }

  content.push(text.substr(index, text.length - index));

  let config = useContext(ConfigContext);
  let emoteScale = Math.max(1, Math.min(4, Math.round(config!.fontSize / 15)))
  let elements: Array<any> = [];
  for (const item of content) {
    if (typeof item === 'string') {
      elements.push(item);
      continue;
    }

    let emote = item as Emote;
    elements.push(<img className={"emote emote-scale-" + emoteScale} key={(item.id + "-" + item.key)} alt={item.id} src={emote.urls[0]} srcSet={createEmoteSrcSet(emote.urls)} />);
  }

  return (
    <span className={"message-content " + (isMe ? "me" : "")}>{elements}</span>
  );
}