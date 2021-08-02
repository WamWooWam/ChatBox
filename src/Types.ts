export interface Configuration {
  channelName: string

  fontName: string
  fontSize: number
  fontColor: string
  fontWeight: number

  showBadges: boolean
  showPronouns: boolean
  hideCommands: boolean

  dropShadow: boolean
  dropShadowColour?: string
  dropShadowOffset?: number
  dropShadowBlur?: number

  outline: boolean
  outlineThickness?: number;
  outlineColour?: string;

  blockedUsers: string[]
}

export interface BTTVUser {
  id: number
  name: string
  displayName: string
}

export interface BTTVEmoteImages {
  "1x": string
  "2x": string
  "4x": string
}

export interface BTTVUser {
  channelEmotes: BTTVEmote[]
  sharedEmotes: BTTVEmote[]
}

export interface BTTVEmote {
  id: number | string
  code: string
  imageType: string

  userId?: string

  user?: BTTVUser
  images?: BTTVEmoteImages

  name?: string
  urls?: [size: string, url: string]
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