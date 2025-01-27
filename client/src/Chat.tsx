import './Chat.css';

import { BadgesContext, ColorContext, ConfigContext, EmotesContext, PronounsContext } from './Contexts';
import { ChatMessage, Cheer, Configuration, EmoteEventUpdate } from "./Types"
import { ChatUserstate, Client as TMIClient } from "tmi.js"
import React, { Component } from 'react';

import BTTV from './api/BTTV';
import { ClientId } from './ClientId';
import { ColorAdjuster } from './Color';
import ErrorIcon from './ErrorIcon';
import FFZ from './api/FFZ';
import { Message } from "./Message"
import SevenTV from './api/7TV';
import TwitchApi from './api/Twitch';
import { fetchJSON } from "./Utils"

interface ChatState {
  connected: boolean;
  messages: Array<ChatMessage>
  badges: Map<string, string[][]>;
  emotes: Map<string, string[]>;
  cheers: Map<string, Cheer>;
  colorAdjuster: ColorAdjuster;

  tmiClient?: TMIClient;
  twitchApi?: TwitchApi;

  pronounDisplay: Map<string, string>;
  pronounUsers: Map<string, Pronoun>;

  channelId?: string;
  channelName?: string;
  sevenTvEvents?: EventSource;

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
    if (this.props.accessToken !== previousProps.accessToken) {
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

    if (!this.props.accessToken) {
      this.setState({ errorMessage: "No channel specifed!" });
      return;
    }

    let channelId: string, channelName: string, twitchApi: TwitchApi;
    try {
      twitchApi = new TwitchApi(ClientId, this.props.accessToken);

      let users = await twitchApi.getUsers();
      if (!users || !users.length) {
        this.setState({ errorMessage: "Specified channel doesn't exist!" });
        return;
      }

      channelId = users[0].id;
      channelName = users[0].login;

      this.setState({ channelId, channelName, twitchApi });
      this.connect(channelName);
    } catch (error) {
      // BUGBUG this is terrible
      localStorage.removeItem("access_token");
      window.location.reload();
      return;
    }

    let encodedId = encodeURIComponent(channelId!);
    await Promise.all([this.loadBadges(encodedId, twitchApi), this.loadEmotes(encodedId), this.loadCheers(encodedId), this.loadPronouns()]);
  }

  private cleanup() {
    let events = this.state.sevenTvEvents;
    let tmiClient = this.state.tmiClient;

    this.setState({
      errorMessage: undefined,
      messages: [],
      colorAdjuster: new ColorAdjuster(this.props.readableBackground, this.props.readableMode, this.props.readableContrast),
      sevenTvEvents: undefined,
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

    if (events) {
      events.close();
    }
  }

  private connect(channelName: string) {
    let client = new TMIClient({
      options: { debug: true, clientId: ClientId, skipUpdatingEmotesets: true },
      identity: { username: channelName!, password: this.props.accessToken },
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

  private async loadBadges(encodedId: string, twitchApi: TwitchApi) {
    let badgeSets = await Promise.all([ // TODO: FFZ custom badges
      twitchApi.getGlobalBadges(),
      twitchApi.getUserBadges(encodedId)
    ]);

    let badges = new Map<string, string[][]>();
    for (const badgeSetList of badgeSets) {
      for (const badgeSet of badgeSetList) {
        let badgeName = badgeSet.set_id;
        let badgeVersions: string[][] = [];
        for (const badgeVersion in badgeSet.versions) {
          badgeVersions.push([
            badgeSet.versions[badgeVersion].image_url_1x,
            badgeSet.versions[badgeVersion].image_url_2x,
            badgeSet.versions[badgeVersion].image_url_4x,
          ]);
        }

        badges.set(badgeName, badgeVersions);
      }
    }

    console.log("Loaded badges", badges);
    this.setState({ badges });
  }

  private async loadCheers(encodedId: string) {
    //let cheers = await fetchTwitch(`https://api.twitch.tv/helix/bits/cheermotes?channel_id=${encodedId}`)
    // for (const action of cheers.actions) {
    //   let cheer: Cheer = { prefixes: new Map() }
    //   for (const tier of action.tiers) {

    //   }
    // }
  }

  private async loadEmotes(encodedId: string) {
    console.log("Loading emotes", encodedId);
    let emotes = new Map<string, string[]>();

    let ffzEmotes = await FFZ.fetchGlobalEmotes();
    ffzEmotes.push(...await FFZ.fetchChannelEmotes(encodedId))
    for (const emote of ffzEmotes) {
      emotes.set(emote.code, [emote.images['1x'], emote.images['2x'], emote.images['4x']])
    }

    let bttvUser = await BTTV.fetchUser(encodedId);
    let bttvEmotes = await BTTV.fetchGlobalEmotes();
    bttvEmotes.push(...bttvUser.channelEmotes);
    bttvEmotes.push(...bttvUser.sharedEmotes);

    for (const emote of bttvEmotes) {
      emotes.set(emote.code, [
        `https://cdn.betterttv.net/emote/${emote.id}/1x`,
        `https://cdn.betterttv.net/emote/${emote.id}/2x`,
        `https://cdn.betterttv.net/emote/${emote.id}/3x`
      ]);
    }

    let sevenTVEmotes = await SevenTV.fetchGlobalEmotes();
    sevenTVEmotes.push(...await SevenTV.fetchChannelEmotes(encodedId));
    for (const emote of sevenTVEmotes) {
      let baseUrl = emote.data.host.url;
      let files = emote.data.host.files.filter(f => f.format === 'WEBP');
      if (!files.length) continue;

      emotes.set(emote.name, files.map(e => `${baseUrl}/${e.name}`));
    }

    // this.sevenTVSubscribe();

    console.log("Loaded emotes", emotes);
    this.setState({ emotes });
  }

  private async sevenTVSubscribe() {
    let eventSource = new EventSource(`https://events.7tv.app/v1/channel-emotes?channel=${this.state.channelName!}`);

    eventSource.addEventListener('ready', (ev: Event) => {
      let message = ev as MessageEvent; // this is stupid lol
      console.log(`7TV ready, ${message.data}`);
    })

    eventSource.addEventListener('update', (ev: Event) => {
      let message = ev as MessageEvent; // this is stupid lol
      let eventUpdate = JSON.parse(message.data) as EmoteEventUpdate;
      if (eventUpdate === undefined) return;

      let emotes = new Map<string, string[]>(this.state.emotes);

      if (eventUpdate.action === "ADD") {
        emotes.set(eventUpdate.name, [
          `https://cdn.7tv.app/emote/${eventUpdate.emote_id}/1x`,
          `https://cdn.7tv.app/emote/${eventUpdate.emote_id}/2x`,
          `https://cdn.7tv.app/emote/${eventUpdate.emote_id}/3x`,
        ]);

        console.log(`7TV emotes: added ${eventUpdate.name}!`)
      }
      else if (eventUpdate.action === "REMOVE") {
        emotes.delete(eventUpdate.name);
        console.log(`7TV emotes: removed ${eventUpdate.name}!`)
      }

      this.setState({ emotes });
    })

    this.setState({ sevenTvEvents: eventSource });
  }

  private async loadPronouns() {
    let pronouns = new Map<string, string>();
    let pronounsJson = await fetchJSON("https://pronouns.alejo.io/api/pronouns");
    for (const value of pronounsJson) {
      pronouns.set(value.name, value.display);
    }

    this.setState({ pronounDisplay: pronouns });
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