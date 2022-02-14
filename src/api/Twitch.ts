import { User, BadgeSet } from "./TwitchModels";

const HelixBaseUri = "https://api.twitch.tv/helix";

export class TwitchApi {
    private clientId: string;
    private accessToken: string;

    constructor(clientId: string, accessToken: string) {
        this.clientId = clientId;
        this.accessToken = accessToken;
    }

    async getUsers(logins: string[] = [], ids: string[] = []) : Promise<User[]> {
        const params = new URLSearchParams();
        for (const login of logins)
            params.append("login", login);
        for (const id of ids)
            params.append("id", id);
        
        let uri = "/users?" + params.toString();
        return await this.doFetch(uri);
    }    

    async getUserBadges(id: string): Promise<BadgeSet[]> {
        return await this.doFetch(`/chat/badges?broadcaster_id=${id}`);
    }

    async getGlobalBadges(): Promise<BadgeSet[]> {
        return await this.doFetch("/chat/badges/global");
    }

    async doFetch(path: string) {
      let response = await fetch(HelixBaseUri + path, { headers: { "Client-Id": this.clientId, "Authorization" : "Bearer " + this.accessToken } });
      let data = await response.json();
      if (!response.ok) {
        throw data;
      }

      return data.data;
    }
}