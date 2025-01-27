import "./colors.css"

import React, { useEffect, useState } from "react";

import { ApiError } from "./ApiError";
import { Chat } from "./Chat";
import { ClientId } from "./ClientId";
import { Configuration } from "./Types";
import { Configurator } from "./Configurator";
import { DefaultConfig } from "./Constants";
import TwitchApi from "./api/Twitch";
import { decode } from "@msgpack/msgpack"

export const App = () => {
  const [config, setConfig] = useState(null as Configuration | null);
  useEffect(() => {
    try {
      let newConfig = decode(Buffer.from(window.location.hash.substring(1), 'base64')) as Partial<Configuration>;
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
    catch (e) { }
  }, []);

  return (
    <>
      {config?.channelName ? <Chat {...config} /> : <Configurator />}
    </>
  );
};