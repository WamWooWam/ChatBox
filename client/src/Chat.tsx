import './Chat.css';

import { BadgesContext, ColorContext, ConfigContext, EmotesContext, PronounsContext } from './Contexts';
import { ChatMessage, Cheer, Configuration } from "./Types"
import { ChatUserstate, Client as TMIClient } from "tmi.js"
import React, { Component } from 'react';

import { ClientId } from './ClientId';
import { ColorAdjuster } from './Color';
import ErrorIcon from './ErrorIcon';
import { Message } from "./Message"
import { fetchJSON } from "./Utils"

interface ChatState {
  connected: boolean;
  messages: Array<ChatMessage>
  badges: Map<string, string[][]>;
  emotes: Map<string, string[]>;
  cheers: Map<string, Cheer>;
  colorAdjuster: ColorAdjuster;

  tmiClient?: TMIClient;

  pronounDisplay: Map<string, string>;
  pronounUsers: Map<string, Pronoun>;

  channelId?: string;
  channelName?: string;

  errorMessage?: string;
}

interface Pronoun {
  pending: boolean;
  pronoun: string;
}

export interface Pronouns {
  displayMap: Map<string, string>;
  userMap: Map<string, Pronoun>;
  fetchPronouns: (nick: string) => void;
}

export class Chat extends Component<Configuration, ChatState> {
  constructor(props: Configuration) {
    super(props);
    let state: ChatState = {
      connected: false,
      messages: [],
      badges: new Map(),
      emotes: new Map(),
      cheers: new Map(),
      pronounUsers: new Map(),
      pronounDisplay: new Map(),
      colorAdjuster: new ColorAdjuster()
    };
    this.state = state;
  }

  async componentDidMount() {
    await this.load();
  }

  async componentDidUpdate(previousProps: Configuration) {
    if (this.props.channelName !== previousProps.channelName) {
      await this.load();
    }

    if (this.props.readableColours !== previousProps.readableColours ||
      this.props.readableContrast !== previousProps.readableContrast ||
      this.props.readableBackground !== previousProps.readableBackground ||
      this.props.readableMode !== previousProps.readableMode) {
      this.setState({ colorAdjuster: new ColorAdjuster(this.props.readableBackground, (!this.props.readableColours ? 0 : this.props.readableMode), this.props.readableContrast) });
    }
  }

  componentWillUnmount() {
    this.cleanup();
  }

  async load() {
    this.cleanup();

    if (!this.props.channelName) {
      this.setState({ errorMessage: "No channel specifed!" });
      return;
    }

    const data = await fetchJSON(`api/state/${this.props.channelName}`);
    if (data.error) {
      this.setState({ errorMessage: data.error });
      return;
    }

    this.setState({
      channelId: data.id,
      channelName: data.username,
      badges: new Map(Object.entries(data.badges)),
      emotes: new Map(Object.entries(data.emotes)),
      pronounDisplay: new Map(Object.entries(data.pronouns)),
    });

    this.connect(data.username);
  }

  private cleanup() {
    let tmiClient = this.state.tmiClient;

    this.setState({
      errorMessage: undefined,
      messages: [],
      colorAdjuster: new ColorAdjuster(this.props.readableBackground, this.props.readableMode, this.props.readableContrast),
      tmiClient: undefined,
      emotes: new Map(),
      badges: new Map(),
      pronounUsers: new Map(),
      pronounDisplay: new Map(),
      connected: false
    });

    if (tmiClient) {
      tmiClient.disconnect();
    }
  }

  private connect(channelName: string) {
    let client = new TMIClient({
      options: { debug: true, clientId: ClientId, skipUpdatingEmotesets: true },
      // identity: { username: channelName!, password: this.props.accessToken },
      channels: [channelName!]
    });

    client.addListener("message", this.onMessage.bind(this));
    // TODO:
    // client.addListener("messagedeleted")
    // client.addListener("clearchat")
    client.connect();

    this.setState({ tmiClient: client });
  }

  onMessage(channel: string, userstate: ChatUserstate, message: string, self: boolean) {
    console.log(userstate);
    let chatMessage: ChatMessage = {
      id: userstate.id!,
      content: message,
      type: userstate['message-type'] as string,
      authorName: userstate.username,
      authorDisplayName: userstate['display-name'],
      authorColour: userstate.color,
      rawBadges: userstate['badges-raw'],
      rawEmotes: userstate['emotes-raw']
    }

    if (chatMessage.type === "action" || chatMessage.type === "chat")
      this.setState(oldState => ({ messages: [...(oldState.messages.length >= 50 ? oldState.messages.slice(1, 50) : oldState.messages), chatMessage] }));
  }

  private async fetchPronouns(userName: string) {
    if (this.state.pronounUsers.has(userName)) return;
    const map = new Map(this.state.pronounUsers);
    map.set(userName, { pending: true, pronoun: "" });
    this.setState({ pronounUsers: map });

    let json = await fetchJSON(`https://pronouns.alejo.io/api/users/${userName}`);
    if (!Array.isArray(json)) return;

    const map2 = new Map(this.state.pronounUsers);
    map2.set(userName, { pending: false, pronoun: json[0]?.pronoun_id });
    this.setState({ pronounUsers: map2 });
  }

  render() {
    let style = {
      color: this.props.fontColor ?? "white",
      fill: this.props.fontColor ?? "white",
      fontFamily: `"${this.props.fontName}"`,
      fontSize: this.props.fontSize + "pt",
      fontWeight: this.props.fontWeight,
      filter: "",
      WebkitTextStroke: "",
      stroke: "",
      strokeWidth: "",
    }

    if (this.props.dropShadow) {
      style.filter = style.filter + `drop-shadow(${this.props.dropShadowOffset}px ${this.props.dropShadowOffset}px ${this.props.dropShadowBlur}px ${this.props.dropShadowColour})`
    }

    if (this.props.outline) {
      style.WebkitTextStroke = `${this.props.outlineThickness}px ${this.props.outlineColour}`
      style.stroke = this.props.outlineColour!
      style.strokeWidth = `${this.props.outlineThickness! * 7.5}px`
    }

    if (this.state.errorMessage) {
      return (
        <div className="chat-container" style={style}>
          <div className="chat-error">
            <ErrorIcon />
            <p>{this.state.errorMessage}</p>
          </div>
        </div>
      )
    }
    return (
      <div className="chat-container">
        <div className="chat-root" style={style}>
          <ConfigContext.Provider value={this.props}>
            <ColorContext.Provider value={this.state.colorAdjuster}>
              <BadgesContext.Provider value={this.state.badges}>
                <EmotesContext.Provider value={this.state.emotes}>
                  <PronounsContext.Provider value={{ userMap: this.state.pronounUsers, displayMap: this.state.pronounDisplay, fetchPronouns: this.fetchPronouns.bind(this) }}>
                    {this.state.messages.map(m => <Message key={m.id} message={m} />)}
                  </PronounsContext.Provider>
                </EmotesContext.Provider>
              </BadgesContext.Provider>
            </ColorContext.Provider>
          </ConfigContext.Provider>
        </div>
      </div>
    )
  }
}