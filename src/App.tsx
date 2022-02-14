
import React from "react";
import { Chat } from "./Chat";
import { Configurator } from "./Configurator";
import { Configuration } from "./Types";
import { decode } from "@msgpack/msgpack"
import { DefaultConfig } from "./Constants";
import { ApiError } from "./ApiError";
import "./colors.css"

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