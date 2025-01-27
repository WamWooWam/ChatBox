import { fetchJSON } from "./Utils.js";

export interface BTTVUser {
    id: number
    channelEmotes: BTTVEmote[],
    sharedEmotes: BTTVEmote[]
}

export interface BTTVEmote {
    id: string,
    code: string,
}

export default class BTTV {
    static async fetchGlobalEmotes(): Promise<BTTVEmote[]> {
        return await fetchJSON(`https://api.betterttv.net/3/cached/emotes/global`)
    }
    static async fetchUser(id: string): Promise<BTTVUser> {
        return await fetchJSON(`https://api.betterttv.net/3/cached/users/twitch/${id}`)
    }
}