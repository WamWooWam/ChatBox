import React, { useContext } from 'react';
import { IRCMessage } from "irc-message-ts";
import { TwitchDefaultColors } from './Constants';
import { Badges } from "./Badges"
import { Content } from "./Content"
import { Pronouns } from './Pronouns';
import { ConfigContext } from './Chat';

interface MessageProps {
  message: IRCMessage;
}

export const Message = (props: MessageProps) => {
  const config = useContext(ConfigContext);

  let message = props.message;
  let rawNick = message.prefix?.split('@')[0].split('!')[0];

  if (config?.blockedUsers.includes(rawNick!.toLowerCase())) { return null; }
  if (config?.hideCommands && message.params[1].startsWith('!')) { return null; }

  let nick = message.tags["display-name"] ?? rawNick;
  let color: string = "inherit";

  if (config?.showUserColours) {
    color = message.tags.color ?? TwitchDefaultColors[nick.toLowerCase().charCodeAt(0) % 15];
  }

  return (
    <p className="message">
      <Badges badges={message.tags.badges} />
      <Pronouns nick={rawNick!} />
      <span className="nick" style={{ color }}>{nick}</span>
      <Content text={message.params[1]} emotes={message.tags.emotes} />
    </p>
  );
}