import { fetchJSON } from "../Utils"

export interface SevenTVEmote {
    id: string,
    name: string,
    data: {
        host: {
            url: string
            files: {
                name: string,
                width: number,
                height: number,
                frame_count: number,
                format: 'WEBP' | 'AVIF' | 'GIF' | 'PNG',
            }[]
        }
    }
}

export default class SevenTV {
    static async fetchGlobalEmotes(): Promise<SevenTVEmote[]> {
        return (await fetchJSON(`https://7tv.io/v3/emote-sets/global`))?.emotes ?? []
    }
    static async fetchChannelEmotes(id: string): Promise<SevenTVEmote[]> {
        return (await fetchJSON(`https://7tv.io/v3/users/twitch/${id}`))?.emote_set?.emotes ?? []
    }
}