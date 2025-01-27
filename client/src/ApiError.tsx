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
              <p>To re-authenticate, <a href="/chatbox" target='_blank'>click here</a>, or visit https://wamwoowam.co.uk/chatbox</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}