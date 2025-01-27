
export interface Configuration {
  channelName: string;
  accessToken?: string;

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