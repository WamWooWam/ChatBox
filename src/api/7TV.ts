import { fetchJSON } from "../Utils"

export interface SevenTVEmote {
    id: string,
    name: string,
    urls: string[][]
}

export class SevenTV {
    static async fetchGlobalEmotes(): Promise<SevenTVEmote[]> {
        return await fetchJSON(`https://api.7tv.app/v2/emotes/global`)
    }
    static async fetchChannelEmotes(id: string): Promise<SevenTVEmote[]> {
        return await fetchJSON(`https://api.7tv.app/v2/users/${id}/emotes`)
    }
}