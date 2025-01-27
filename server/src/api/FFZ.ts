import { fetchJSON } from "./Utils.js";

export interface FFZEmote {
  id: number;
  code: string;
  images: FFZEmoteImages;
}

export interface FFZEmoteImages {
  "1x": string
  "2x": string
  "4x": string
}

export default class FFZ {
  static async fetchGlobalEmotes(): Promise<FFZEmote[]> {
    return await fetchJSON(`https://api.betterttv.net/3/cached/frankerfacez/emotes/global`)
  }
  static async fetchChannelEmotes(id: string): Promise<FFZEmote[]> {
    return await fetchJSON(`https://api.betterttv.net/3/cached/frankerfacez/users/twitch/${id}`)
  }
}