import React, { Component } from 'react';
import { parse, IRCMessage } from "irc-message-ts";
import { Message } from "./Message"
import { BTTVEmote, BTTVUser, Configuration } from "./Types"
import { fetchJSON, fetchTwitch } from "./Utils"
import './Chat.css';

interface ChatState {
  connected: boolean;
  messages: Array<IRCMessage>
  badges: Map<string, string[]>;
  emotes: Map<string, string[]>;

  pronounDisplay: Map<string, string>;
  pronounUsers: Map<string, Pronoun>;

  channelId?: string;
  channelName?: string;
  webSocket?: WebSocket;

  errorMessage?: string;
}

interface Pronoun {
  pending: boolean;
  pronoun: string;
}

interface Pronouns {
  displayMap: Map<string, string>;
  userMap: Map<string, Pronoun>;
  fetchPronouns: (nick: string) => void;
}

export const ConfigContext = React.createContext<Configuration | null>(null);
export const BadgesContext = React.createContext<Map<string, string[]>>(new Map());
export const EmotesContext = React.createContext<Map<string, string[]>>(new Map());
export const PronounsContext = React.createContext<Pronouns | null>(null);

export class Chat extends Component<Configuration, ChatState> {
  constructor(props: any) {
    super(props);
    let state: ChatState = { connected: false, messages: [], badges: new Map(), emotes: new Map(), pronounUsers: new Map(), pronounDisplay: new Map() };
    this.state = state;
  }

  async componentDidMount() {
    await this.load();
  }

  async componentDidUpdate(previousProps) {
    if (this.props.channelName !== previousProps.channelName) {
      await this.load();
    }
  }

  async load() {
    this.setState({ errorMessage: undefined, messages: [] });

    if (!this.props.channelName) {
      this.setState({ errorMessage: "No channel specifed!" });
      return;
    }

    if (this.state.webSocket)
      this.state.webSocket.close();

    let data = await fetchTwitch(`https://api.twitch.tv/v5/users?login=${this.props.channelName}`);
    if (!data.users?.length) {
      this.setState({ errorMessage: "Specified channel doesn't exist!" });
      return;
    }

    this.setState({ channelId: data.users[0]._id, channelName: this.props.channelName });

    let socket = new WebSocket("wss://irc-ws.chat.twitch.tv", 'irc');
    socket.addEventListener("open", this.onSocketOpen.bind(this));
    socket.addEventListener("close", this.onSocketClose.bind(this));
    socket.addEventListener("message", this.onSocketMessage.bind(this));
    this.setState({ webSocket: socket });

    let encodedId = encodeURIComponent(this.state.channelId!);
    await Promise.all([this.loadBadges(encodedId), this.loadEmotes(encodedId), this.loadPronouns()]);
  }

  async loadBadges(encodedId: string) {
    let badgeSets = await Promise.all([ // TODO: FFZ custom badges
      fetchTwitch(`https://badges.twitch.tv/v1/badges/global/display`),
      fetchTwitch(`https://badges.twitch.tv/v1/badges/channels/${encodedId}/display`)
    ]);

    let badges = new Map<string, string[]>();
    for (const badgeSet of badgeSets) {
      let set = badgeSet.badge_sets;
      for (const badgeName in set) {
        for (const badgeVersion in set[badgeName].versions) {
          badges.set(`${badgeName}/${badgeVersion}`, [
            set[badgeName].versions[badgeVersion].image_url_1x,
            set[badgeName].versions[badgeVersion].image_url_2x,
            set[badgeName].versions[badgeVersion].image_url_4x,
          ]);
        }
      }
    }

    console.log("Loaded badges", badges);
    this.setState({ badges });
  }

  async loadEmotes(encodedId: string) {
    let emotes = new Map<string, string[]>();
    let bttvEmotes: Array<Array<BTTVEmote> | BTTVUser> = await Promise.all([
      fetchJSON('https://api.betterttv.net/3/cached/frankerfacez/emotes/global'),
      fetchJSON(`https://api.betterttv.net/3/cached/frankerfacez/users/twitch/${encodedId}`),
      fetchJSON('https://api.betterttv.net/3/cached/emotes/global'),
      fetchJSON(`https://api.betterttv.net/3/cached/users/twitch/${encodedId}`),
      fetchJSON('https://api.7tv.app/v2/emotes/global'),
      fetchJSON(`https://api.7tv.app/v2/users/${encodedId}/emotes`),
    ]);

    for (let emoteSet of bttvEmotes) {
      if (!Array.isArray(emoteSet)) {
        if (emoteSet.channelEmotes) {
          emoteSet = emoteSet.channelEmotes.concat(emoteSet.sharedEmotes);
        }
      }

      if (!Array.isArray(emoteSet)) continue;

      for (const emote of emoteSet as Array<BTTVEmote>) {
        if (emote.images) {
          emotes.set(emote.code, [emote.images['1x'], emote.images['2x'], emote.images['4x']]);
          continue;
        }

        if (emote.code) {
          emotes.set(emote.code, [
            `https://cdn.betterttv.net/emote/${emote.id}/1x`,
            `https://cdn.betterttv.net/emote/${emote.id}/2x`,
            `https://cdn.betterttv.net/emote/${emote.id}/3x`
          ]);

          continue;
        }

        if (emote.urls) {
          emotes.set(emote.name!, emote.urls.map(e => e[1]));
          continue;
        }
      }
    }

    console.log("Loaded emotes", emotes);
    this.setState({ emotes });
  }

  async loadPronouns() {
    let pronouns = new Map<string, string>();
    let pronounsJson = await fetchJSON("https://pronouns.alejo.io/api/pronouns");
    for (const value of pronounsJson) {
      pronouns.set(value.name, value.display);
    }

    this.setState({ pronounDisplay: pronouns });
  }

  async fetchPronouns(userName: string) {
    if (this.state.pronounUsers.has(userName)) return;
    this.state.pronounUsers.set(userName, { pending: true, pronoun: "" });

    let json = await fetchJSON(`https://pronouns.alejo.io/api/users/${userName}`);
    if (!Array.isArray(json)) return;

    this.state.pronounUsers.set(userName, { pending: false, pronoun: json[0]?.pronoun_id });
    this.setState({ pronounUsers: this.state.pronounUsers });
  }

  onSocketOpen(ev: Event) {
    this.sendIrc(`PASS ass`);
    this.sendIrc(`NICK justinfan${Math.floor(Math.random() * 65536)}`);
    this.sendIrc(`CAP REQ :twitch.tv/commands twitch.tv/tags`);
    this.sendIrc(`JOIN #${this.props.channelName}`);
  }

  onSocketClose(ev: Event) {

  }

  onSocketMessage(ev: MessageEvent<string>) {
    for (const message of ev.data.split('\r\n')) {
      if (!message) continue;
      let ircMessage = parse(message)!;
      if (ircMessage === null) continue;

      let command = ircMessage.command?.toLowerCase();
      if (!command) continue;

      switch (command) {
        case "ping":
          this.sendIrc(`PONG ${ircMessage.params[0]}`);
          continue;
        // case "clearchat":
        //   this.setState({ messages: [] });
        //   continue;
        case "privmsg":
          this.setState(oldState => ({ messages: [...(oldState.messages.length >= 50 ? oldState.messages.slice(1, 50) : oldState.messages), ircMessage] }));
          continue;
      }
    }
  }

  sendIrc(message: string) {
    if (this.state.webSocket === undefined) throw new Error("what the fuck lol");
    this.state.webSocket.send(message + '\r\n');
  }

  render() {
    let style = {
      color: this.props.fontColor ?? "white",
      fill: this.props.fontColor ?? "white",
      fontFamily: this.props.fontName,
      fontSize: this.props.fontSize + "pt",
      fontWeight: this.props.fontWeight,
      filter: "",
      webkitTextStroke: "",
      stroke: "",
      strokeWidth: "",
    }

    if (this.props.dropShadow) {
      style.filter = style.filter + `drop-shadow(${this.props.dropShadowOffset}px ${this.props.dropShadowOffset}px ${this.props.dropShadowBlur}px ${this.props.dropShadowColour})`
    }

    if(this.props.outline) {
      style.webkitTextStroke = `${this.props.outlineThickness}px ${this.props.outlineColour}`
      style.stroke = this.props.outlineColour!
      style.strokeWidth = `${this.props.outlineThickness! * 7.5}px`
    }

    if (this.state.errorMessage) {
      return (
        <div className="chat-container" style={style}>
          <div className="chat-error">
            <svg height="128px" viewBox="0 0 960 960" width="128px" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
              <path d="M0,480C0,435.667 5.66667,393.083 17,352.25C28.3333,311.417 44.4167,273.167 65.25,237.5C86.0833,201.833 111.083,169.417 140.25,140.25C169.417,111.083 201.833,86.0834 237.5,65.25C273.167,44.4167 311.417,28.3334 352.25,17C393.083,5.66669 435.667,0 480,0C524,0 566.417,5.75 607.25,17.25C648.083,28.75 686.333,44.9167 722,65.75C757.667,86.5834 790.083,111.583 819.25,140.75C848.417,169.917 873.417,202.333 894.25,238C915.083,273.667 931.25,311.917 942.75,352.75C954.25,393.583 960,436 960,480C960,524.333 954.333,566.917 943,607.75C931.667,648.583 915.583,686.833 894.75,722.5C873.917,758.167 848.917,790.583 819.75,819.75C790.583,848.917 758.167,873.917 722.5,894.75C686.833,915.583 648.583,931.667 607.75,943C566.917,954.333 524.333,960 480,960C435.667,960 393,954.333 352,943C311,931.667 272.75,915.583 237.25,894.75C201.75,873.917 169.417,848.917 140.25,819.75C111.083,790.583 86.0833,758.25 65.25,722.75C44.4167,687.25 28.3333,649 17,608C5.66667,567 0,524.333 0,480ZM896,480C896,441.667 891.083,404.75 881.25,369.25C871.417,333.75 857.417,300.583 839.25,269.75C821.083,238.917 799.417,210.917 774.25,185.75C749.083,160.583 721.083,138.917 690.25,120.75C659.417,102.583 626.25,88.5834 590.75,78.75C555.25,68.9167 518.333,64.0001 480,64C441.667,64.0001 404.75,68.9167 369.25,78.75C333.75,88.5834 300.583,102.5 269.75,120.5C238.917,138.5 210.833,160.167 185.5,185.5C160.167,210.833 138.5,238.917 120.5,269.75C102.5,300.583 88.5833,333.75 78.75,369.25C68.9167,404.75 64,441.667 64,480C64,518.333 68.9167,555.25 78.75,590.75C88.5833,626.25 102.5,659.417 120.5,690.25C138.5,721.083 160.167,749.167 185.5,774.5C210.833,799.833 238.917,821.5 269.75,839.5C300.583,857.5 333.75,871.417 369.25,881.25C404.75,891.083 441.667,896 480,896C518.333,896 555.25,891.083 590.75,881.25C626.25,871.417 659.417,857.417 690.25,839.25C721.083,821.083 749.083,799.417 774.25,774.25C799.417,749.083 821.083,721.083 839.25,690.25C857.417,659.417 871.417,626.25 881.25,590.75C891.083,555.25 896,518.333 896,480ZM448,544L448,288C448,279.333 451.167,271.833 457.5,265.5C463.833,259.167 471.333,256 480,256C488.667,256 496.167,259.167 502.5,265.5C508.833,271.833 512,279.333 512,288L512,544C512,552.667 508.833,560.167 502.5,566.5C496.167,572.833 488.667,576 480,576C471.333,576 463.833,572.833 457.5,566.5C451.167,560.167 448,552.667 448,544ZM432,672C432,658.667 436.667,647.333 446,638C455.333,628.667 466.667,624 480,624C493.333,624 504.667,628.667 514,638C523.333,647.333 528,658.667 528,672C528,685.333 523.333,696.667 514,706C504.667,715.333 493.333,720 480,720C466.667,720 455.333,715.333 446,706C436.667,696.667 432,685.333 432,672Z" />
            </svg>
            <p>{this.state.errorMessage}</p>
          </div>
        </div>
      )
    }
    return (
      <div className="chat-container">
        <div className="chat-root" style={style}>
          <ConfigContext.Provider value={this.props}>
            <BadgesContext.Provider value={this.state.badges}>
              <EmotesContext.Provider value={this.state.emotes}>
                <PronounsContext.Provider value={{ userMap: this.state.pronounUsers, displayMap: this.state.pronounDisplay, fetchPronouns: this.fetchPronouns.bind(this) }}>
                  {this.state.messages.map(m => <Message key={m.tags.id} message={m} />)}
                </PronounsContext.Provider>
              </EmotesContext.Provider>
            </BadgesContext.Provider>
          </ConfigContext.Provider>
        </div>
      </div>
    )
  }
}