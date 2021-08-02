
import React from "react";
import { Chat } from "./Chat";
import { Configurator } from "./Configurator";
import { Configuration } from "./Types";
import { decode } from "@msgpack/msgpack"

export const App = () => {
  let config: Partial<Configuration> = {};
  try {
    config = decode(Buffer.from(window.location.hash.substring(1), 'base64')) as Configuration
  }
  catch (e) { }

  return (
    config.channelName !== undefined ? <Chat {...config as Configuration} /> : <Configurator />
  );
};