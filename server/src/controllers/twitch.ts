import { Request, Response, Router } from 'express';

import BTTV from '../api/BTTV.js';
import FFZ from '../api/FFZ.js';
import SevenTV from '../api/7TV.js';

export interface User {
    id: string;
    login: string;
    display_name: string;
    type: string;
    broadcaster_type: string;
    description: string;
    profile_image_url: string;
    offline_image_url: string;
    view_count: number;
    email: string;
    created_at: Date;
}

export interface BadgeSet {
    set_id: string;
    versions: BadgeVersion[]
}

export interface BadgeVersion {
    id: string;
    image_url_1x: string;
    image_url_2x: string;
    image_url_4x: string;
}

const TWITCH_HELIX_ROOT = 'https://api.twitch.tv/helix';
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID || '';
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET || '';

let access_token: string | null = null;
let token_expires: number | null = null;

const getAccessToken = async () => {
    const url = `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`;
    const resp = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!resp.ok) throw await resp.json();

    const json = await resp.json();
    access_token = json.access_token;
    token_expires = Date.now() + json.expires_in * 1000;
};

const ensureAccessToken = async () => {
    if (
        access_token == null ||
        token_expires == null ||
        token_expires < Date.now()
    ) {
        await getAccessToken();
    }

    return access_token;
};

async function getUsers(logins: string[] = [], ids: string[] = []): Promise<User[]> {
    const params = new URLSearchParams();
    for (const login of logins)
        params.append("login", login);
    for (const id of ids)
        params.append("id", id);

    let uri = "/users?" + params.toString();
    return await doFetch(uri);
}

async function getUserBadges(id: string): Promise<BadgeSet[]> {
    return await doFetch(`/chat/badges?broadcaster_id=${id}`);
}

async function getGlobalBadges(): Promise<BadgeSet[]> {
    return await doFetch("/chat/badges/global");
}

async function doFetch(path: string) {
    let response = await fetch(TWITCH_HELIX_ROOT + path, {
        headers: {
            "Client-Id": TWITCH_CLIENT_ID,
            "Authorization": "Bearer " + (await ensureAccessToken())
        }
    });
    let data = await response.json();
    if (!response.ok) {
        throw data;
    }

    return data.data;
}

// /chatbox-info/:channel
const fetchData = async (req: Request, res: Response) => {
    const channel = req.params.channel;
    if (!channel) {
        res.status(400)
            .send('Missing channel');
        return;
    }

    const userInfo = await getUsers([channel]);
    if (userInfo.length === 0) {
        res.status(404)
            .send('Channel not found');
        return;
    }

    let data = {};

    const user = userInfo[0];
    const encodedId = encodeURIComponent(user.id);

    data = {
        ...data,
        id: encodedId,
        username: user.login,
        displayName: user.display_name
    };

    let [badges, [ffz, bttv, sevenTv], pronouns] = await Promise.all([
        fetchBadges(encodedId),
        Promise.all([
            fetchFFZEmotes(encodedId),
            fetchBttvEmotes(encodedId),
            fetchSevenTVEmotes(encodedId)
        ]),
        fetchPronouns()
    ]);

    data = {
        ...data,
        badges: Object.fromEntries(badges),
        emotes: Object.fromEntries([...ffz, ...bttv, ...sevenTv]),
        pronouns: Object.fromEntries(pronouns)
    };

    res.json(data);
};

async function fetchPronouns() {
    let pronouns = new Map<string, string>();
    let pronounsJson = await fetch("https://pronouns.alejo.io/api/pronouns")
        .then(res => res.json());

    for (const value of pronounsJson) {
        pronouns.set(value.name, value.display);
    }
    return pronouns;
}

async function fetchSevenTVEmotes(encodedId: string) {
    let emotes = new Map<string, string[]>();
    let sevenTVEmotes = await SevenTV.fetchGlobalEmotes();
    sevenTVEmotes.push(...await SevenTV.fetchChannelEmotes(encodedId));
    for (const emote of sevenTVEmotes) {
        let baseUrl = emote.data.host.url;
        let files = emote.data.host.files.filter(f => f.format === 'WEBP');
        if (!files.length) continue;

        emotes.set(emote.name, files.map(e => `${baseUrl}/${e.name}`));
    }

    return emotes;
}

async function fetchFFZEmotes(encodedId: string) {
    console.log("Loading emotes", encodedId);
    let emotes = new Map<string, string[]>();

    let ffzEmotes = await FFZ.fetchGlobalEmotes() ?? [];
    ffzEmotes.push(...(await FFZ.fetchChannelEmotes(encodedId) ?? []));
    for (const emote of ffzEmotes) {
        emotes.set(emote.code, [emote.images['1x'], emote.images['2x'], emote.images['4x']]);
    }
    return emotes;
}

async function fetchBttvEmotes(encodedId: string) {
    let bttvUser = await BTTV.fetchUser(encodedId);
    let bttvEmotes = await BTTV.fetchGlobalEmotes();
    bttvEmotes.push(...(bttvUser?.channelEmotes ?? []));
    bttvEmotes.push(...(bttvUser?.sharedEmotes ?? []));

    let emotes = new Map<string, string[]>();
    for (const emote of bttvEmotes) {
        emotes.set(emote.code, [
            `https://cdn.betterttv.net/emote/${emote.id}/1x`,
            `https://cdn.betterttv.net/emote/${emote.id}/2x`,
            `https://cdn.betterttv.net/emote/${emote.id}/3x`
        ]);
    }

    return emotes;
}

async function fetchBadges(encodedId: string) {
    let badgeSets = await Promise.all([
        getGlobalBadges(),
        getUserBadges(encodedId)
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
    return badges;
}

export default function registerRoutes(router: Router) {
    router.get('/state/:channel', fetchData);
}
