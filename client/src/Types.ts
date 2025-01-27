
export interface Configuration {
  channelName?: string;
  accessToken: string;

  fontName: string
  fontSize: number
  fontColor: string
  fontWeight: number

  showBadges: boolean
  showPronouns: boolean
  showUserColours: boolean;
  hideCommands: boolean

  dropShadow: boolean
  dropShadowColour?: string
  dropShadowOffset?: number
  dropShadowBlur?: number

  outline: boolean
  outlineThickness?: number;
  outlineColour?: string;

  readableColours: boolean;
  readableBackground: string;
  readableContrast: number;
  readableMode: ColorAdjustmentMode;

  hideMessages: boolean;
  hideMessagesTimeout: number;

  blockedUsers: string[]
}

export interface ChatMessage {
  id: string
  content: string  
  type: string;

  authorName?: string;
  authorDisplayName?: string;
  authorColour?: string;

  rawBadges?: string;
  rawEmotes?: string;
}

export interface TwitchEmote {
  id: string
  urls: string[]
  start: number
  end: number
}

export interface Emote {
  id: string;
  urls: string[]
  key: string
}

export interface CheerTier {
  color: string;
  light: string[];
  dark: string[];
}

export interface Cheer {
  prefixes: Map<string, CheerTier>
}

export enum ColorAdjustmentMode {
  none,
  hslLuma,
  luv,
  hslLoop,
  rgbLoop
}

export interface EmoteEventUpdate {
  // The channel this update affects.
  channel: string;
  // The ID of the emote.
  emote_id: string;
  // The name or channel alias of the emote.
  name: string;
  // The action done.
  action: "ADD" | "REMOVE" | "UPDATE";
  // The user who caused this event to trigger.
  actor: string;
  // An emote object. Null if the action is "REMOVE".
  emote?: ExtraEmoteData;
}

interface ExtraEmoteData {
  // Original name of the emote.
  name: string;
  // The visibility bitfield of this emote.
  visibility: number;
  // The MIME type of the images.
  mime: string;
  // The TAGs on this emote.
  tags: string[];
  // The widths of the images.
  width: [number, number, number, number];
  // The heights of the images.
  height: [number, number, number, number];
  // The animation status of the emote.
  animated: boolean;
  // Infomation about the uploader.
  owner: {
    // 7TV ID of the owner.
    id: string;
    // Twitch ID of the owner.
    twitch_id: string;
    // Twitch DisplayName of the owner.
    display_name: string;
    // Twitch Login of the owner. 
    login: string;
  }
}