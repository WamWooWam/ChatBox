import "./colors.css"

import { ApiError } from "./ApiError";
import { Chat } from "./Chat";
import { Configuration } from "./Types";
import { Configurator } from "./Configurator";
import { DefaultConfig } from "./Constants";
import React from "react";
import { decode } from "@msgpack/msgpack"

export const App = () => {
  let config: Configuration = DefaultConfig;
  try {
    let newConfig = decode(Buffer.from(window.location.hash.substring(1), 'base64')) as Partial<Configuration>;
    console.log(config, newConfig);
    config = Object.assign(config, newConfig);
  }
  catch (e) { }

  // return (
  //   !!config.accessToken ? <Chat {...config as Configuration} /> : <Configurator />
  // );

  if(!!config.accessToken) {
    return <Chat {...config as Configuration} />
  }
  else if(!!config.channelName) {
    return <ApiError/>
  }

  return <Configurator />;
};