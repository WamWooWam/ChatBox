import './index.css';

import { App } from './App';
import React from 'react';
import ReactDOM from 'react-dom';

// this isn't needed in prod, as on the server it will be handled by its own HTML document
if (window.location.pathname.startsWith("/chatbox-v2/auth")) {
  if (window.opener) {
    (window.opener as any).postMessage(window.location.hash);
    window.close();
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
