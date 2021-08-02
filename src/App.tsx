
import React from "react";
import { BrowserRouter as Router, Switch, Route, } from "react-router-dom";
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
    <Router>
      <Switch>
        <Route exact path="/" component={Configurator} />
        <Route path="/chat">
          <Chat {...config as Configuration} />
        </Route>
      </Switch>
    </Router>
  );
};