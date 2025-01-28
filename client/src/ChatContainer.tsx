import React, { useEffect, useState } from "react";

import { Chat } from "./Chat";
import { ClientId } from "./ClientId";
import { Configuration } from "./Types";
import { DefaultConfig } from "./Constants";
import TwitchApi from "./api/Twitch";
import { decode } from "@msgpack/msgpack";
import { useLocation } from "preact-iso";

export const ChatContainer = (props: { config: string }) => {
    const route = useLocation();
    const [config, setConfig] = useState<Configuration | null>(null);
    useEffect(() => {
        if (!props.config) {
            route.route("/chatbox/config");
            return;
        }

        try {
            let newConfig = decode(Buffer.from(props.config, 'base64')) as Partial<Configuration>;
            let baseConfig = { ...DefaultConfig };
            console.log(baseConfig, newConfig);

            if (newConfig.accessToken && !newConfig.channelName) {
                var twitchApi = new TwitchApi(ClientId, newConfig.accessToken);
                twitchApi.getUsers().then(users => {
                    newConfig.channelName = users[0].login;
                    setConfig(Object.assign(baseConfig, newConfig));
                });
            }
            else {
                setConfig(Object.assign(baseConfig, newConfig));
            }
        }
        catch (e) {
            console.error(e);
            route.route("/chatbox/config");
        }
    }, [props.config]);

    return (
        config ? <Chat {...config} /> : <div>Loading...</div>
    )
}