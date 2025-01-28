import "./colors.css"

import React, { useEffect } from "react";
import { Route, Router, lazy, useLocation } from 'preact-iso';

const Configurator = lazy(() => import("./Configurator").then((module) => (module.Configurator)));
const ChatContainer = lazy(() => import("./ChatContainer").then((module) => (module.ChatContainer)));

const NotFound = () => {
  const route = useLocation();
  useEffect(() => {
    console.log(window.location.hash);
    if (window.location.hash !== "") {
      route.route("/chatbox/" + window.location.hash.substring(1));
    }
    else {
      route.route("/chatbox/config");
    }
  }, []);

  return <div>Loading...</div>;
}

export const App = () => {
  return (
    <Router
      onRouteChange={(url) => console.log('Route changed to', url)}
      onLoadStart={(url) => console.log('Starting to load', url)}
      onLoadEnd={(url) => console.log('Finished loading', url)}>
      <Route path="/chatbox/config" component={Configurator} />
      <Route path="/chatbox/:config" component={ChatContainer} />
      <Route path="/chatbox" component={NotFound} />
    </Router>
  );
};