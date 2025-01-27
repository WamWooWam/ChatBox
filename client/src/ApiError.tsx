import React, { Component } from 'react';

import ErrorSvg from "./images/error.svg"

export class ApiError extends Component {
  render() {
    return (
      <div className="chat-container">
        <div className="fatal-chat-error">
          <div>
            <img src={ErrorSvg} width={64} />
            <div>
              <h4>This isn't a chatbox!</h4>
              <p>Hi there, to continue using this chatbox, you'll need to reauthenticate with Twitch. Sorry! It's due to API requirements.</p>
              <p>To re-authenticate, <a href="/chatbox-v2" target='_blank'>click here</a>, or visit https://&#8203;wamwoowam.github.io&#8203;/chatbox-v2</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}