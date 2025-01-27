import { ChatMessage, Configuration } from './Types';
import { ColorContext, ConfigContext } from "./Contexts";
import React, { Component } from 'react';

import { Badges } from "./Badges"
import { Content } from "./Content"
import { Pronouns } from './Pronouns';
import { TwitchDefaultColors } from './Constants';

interface MessageProps {
  message: ChatMessage;
}
interface MessageState {
  timeout: number | NodeJS.Timeout;
  hidden: boolean;
}

// export const Message = (props: MessageProps) => {
// }

export class Message extends Component<MessageProps, MessageState> {

  static contextType = ConfigContext;

  constructor(props) {
    super(props);
    this.state = { hidden: false, timeout: 0 };
  }

  componentDidMount() {
    let config = this.context as Configuration;
    if (config.hideMessages) {
      this.setState({ timeout: setTimeout(() => console.log(this.setState({ hidden: true })), config.hideMessagesTimeout) })
    }
  }

  componentWillUnmount() {
    if (this.state.timeout) {
      clearTimeout(this.state.timeout as number);
    }
  }

  render() {
    return (
      <ConfigContext.Consumer>
        {(config =>
          <ColorContext.Consumer>
            {(adjuster => {
              let message = this.props.message;
              let authorName = message.authorName ?? "nobody";
              let rawNick = authorName.toLowerCase();

              if (config?.blockedUsers.includes(rawNick!.toLowerCase())) { return null; }
              if (config?.hideCommands && message.content.startsWith('!')) { return null; }

              let nick = message.authorDisplayName ?? rawNick;
              let color: string = "inherit";

              if (config?.showUserColours) {
                color = adjuster.process(!message.authorColour ? TwitchDefaultColors[nick.toLowerCase().charCodeAt(0) % 15] : message.authorColour);
              }

              return (
                <p className={"message" + (this.state.hidden ? " hidden" : "")}>
                  <Badges badges={message.rawBadges} />
                  <Pronouns nick={rawNick!} />
                  <span className="nick" style={{ color }}>{nick}</span>
                  <Content text={message.content} emotes={message.rawEmotes} me={message.type === "action"} />
                </p>
              );
            })}
          </ColorContext.Consumer>
        )}
      </ConfigContext.Consumer>
    )

  }
}