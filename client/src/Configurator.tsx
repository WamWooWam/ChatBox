import "./config.css"

import * as MsgPack from "@msgpack/msgpack"

import { ClientId, Scopes } from './ClientId';
import React, { ChangeEvent, Component } from 'react';

import { Chat } from './Chat';
import { Configuration } from './Types';
import { DefaultConfig } from './Constants';
import TwitchApi from './api/Twitch';

type FontData = {
  family: string,
}

declare global {
  interface Window {
    queryLocalFonts: () => Promise<FontData[]>
  }
}

interface ConfiguratorState {
  connecting: boolean;
  config: Configuration;
  chatConfig?: Configuration;
  window: Window | null;
  fonts: FontData[]
}


const Checkbox = (props: { label: string, value: boolean, onChange: (event: ChangeEvent<HTMLInputElement>) => void }) => {
  return (
    <label className="checkbox">
      <input type="checkbox"
        checked={props.value}
        onChange={props.onChange} />
      <span className="checkmark"></span> {props.label}
    </label>
  )
}


export class Configurator extends Component<{}, ConfiguratorState> {

  constructor(props) {
    super(props);
    this.state = { connecting: true, config: DefaultConfig, chatConfig: DefaultConfig, window: null, fonts: [] };
    this.onWindowMessage = this.onWindowMessage.bind(this);
  }

  componentDidMount() {
    let token = localStorage.getItem("access_token");
    if (token != null) {
      this.validateToken(token);
    }
    else {
      this.setState({ connecting: false });
    }

    if (typeof window.queryLocalFonts === "function") {
      window.queryLocalFonts().then((fonts: FontData[]) => {
        this.setState({ fonts: fonts.filter((f, i, a) => a.findIndex(o => o.family == f.family) === i) });
      });
    }
  }

  async validateToken(token: string) {
    try {
      await new TwitchApi(ClientId, token).getUsers(["wamwoowam"]);

      this.onValueChange("accessToken", token);
      localStorage.setItem("access_token", token);
      this.setState({ connecting: false });
    }
    catch (e) {
      // we dont have a valid token, kick back to the login screen
    }
  }

  updateChat() {
    this.setState({ chatConfig: this.state.config });
  }

  onValueChange<T>(name: string, newValue: T) {
    if (this.state[name] !== newValue)
      this.setState({ config: { ...this.state.config, [name]: newValue }, chatConfig: { ...this.state.config, [name]: newValue } });
  }

  showOAuthWindow() {
    if (this.state.window !== null && !this.state.window.closed) {
      this.state.window.focus();
      return;
    }

    window.addEventListener("message", this.onWindowMessage);

    let redirectUrl = `${window.location.origin}/chatbox-v2/auth.html`
    let wnd = window.open(
      `https://id.twitch.tv/oauth2/authorize?client_id=${ClientId}&redirect_uri=${redirectUrl}&response_type=token&scope=${Scopes}`,
      "sign in",
      "toolbar=no, menubar=no, width=600, height=700")

    if (wnd != null) {
      this.setState({ window: wnd });
    }
  }

  onWindowMessage(event: MessageEvent) {
    if (typeof event.data !== 'string') return;
    if (event.origin !== window.location.origin) return;

    window.removeEventListener("message", this.onWindowMessage);
    let queryParams = new URLSearchParams(event.data.substring(1));
    let accessToken = queryParams.get("access_token");
    if (accessToken != null) {
      this.validateToken(accessToken);
    }
  }

  showHelpDialog() {

  }

  onSubmit(e) {
    e.preventDefault();
  }

  render() {
    let configDiff = {};
    for (const key in this.state.config) {
      const element = this.state.config[key];
      const element2 = DefaultConfig[key];
      if (element !== element2) {
        configDiff[key] = element;
      }
    }

    let configString = btoa(String.fromCharCode(...MsgPack.encode(configDiff)));

    return (
      <>
        <div className="config-background" />
        <div className="config-root dark">
          <div className="config-pane">
            <div className="config-main">
              <form onSubmit={this.onSubmit.bind(this)} className="config-input">
                <h1>Wam's Chat Thing</h1>
                <h4>A simple, easy to use chat box that supports <a href="https://betterttv.net/">BetterTTV</a>, <a href="https://frankerfacez.com/">FrankerFaceZ</a> and <a href="https://7tv.app/">7tv</a> emotes!</h4>

                <div className="config-warning">
                  <p>This chat box is not yet finished so links may break in future! Please don't use it in your layouts yet.</p>
                </div>

                {
                  this.state.connecting ?
                    <p>Loading...</p> :
                    <>
                      {this.state.config.accessToken ? null : (this.renderSignInButton())}
                      {this.state.config.accessToken ? (this.renderConfigSection()) : null}
                    </>
                }

              </form>

              {this.state.config.accessToken ?
                (<div className="config-footer">
                  <p>Paste this into a browser source!</p>
                  <input className="config-input-text" readOnly={true} value={`${window.location.href}#${configString}`} />
                </div>) : null}
            </div>
          </div>

          <div className="config-example">
            <Chat {...this.state.chatConfig!} />
          </div>
        </div>
      </>
    )
  }

  renderSignInButton() {
    return (<>
      <div className="config-error">
        <p>Sorry! Because the legacy Twitch API has been deprecated and is in the process of being decommissioned and limitations of the new API, you will now need to Sign in with Twitch to use this chatbox. You can read more about this <a href="https://blog.twitch.tv/en/2021/07/15/legacy-twitch-api-v5-shutdown-details-and-timeline/">on their blog</a>.</p>
      </div>
      <button className="btn btn-accent"
        style={{ margin: "1em 0" }}
        onClick={this.showOAuthWindow.bind(this)}>
        Sign in with Twitch
      </button>
    </>);
  }

  renderConfigSection() {
    return (<>
      <div className="form-group-label form-group-font">
        <label className="form-group-font-label">Font</label>
        {/* <button className="form-group-font-help" onClick={this.showHelpDialog.bind(this)}>Help!</button> */}
      </div>
      <div className="form-group">
        {this.state.fonts.length ?
          <select className="config-input-text" style={{ flex: 3 }} value={this.state.config.fontName} onChange={(e) => this.onValueChange("fontName", e.target.value)}>
            {this.state.fonts.map((font) => <option value={font.family}>{font.family}</option>)}
          </select>
          : <input type="text"
            className="config-input-text"
            placeholder="Font Name"
            size={1}
            style={{ flex: 3 }}
            value={this.state.config.fontName}
            onChange={(e) => this.onValueChange("fontName", e.target.value)} />
        }

        <input type="text"
          className="config-input-text config-input-number"
          placeholder="Font Size"
          size={1}
          value={this.state.config.fontSize}
          onChange={(e) => this.onValueChange("fontSize", isNaN(+e.target.value) ? this.state.config.fontSize : +e.target.value)} />

        <select title="font weight" className="config-input-text"
          value={this.state.config.fontWeight}
          onChange={(e) => this.onValueChange("fontWeight", +e.target.value)}>
          <option value="100">Thin</option>
          <option value="200">Light</option>
          <option value="300">Semilight</option>
          <option value="400">Regular</option>
          <option value="500">Semibold</option>
          <option value="600">Bold</option>
          <option value="700">Extra Bold</option>
          <option value="800">Black</option>
          <option value="900">Ultra Black</option>
        </select>

        <input title="font color" type="color"
          className="config-input-text"
          size={1}
          value={this.state.config.fontColor}
          onChange={(e) => this.onValueChange("fontColor", e.target.value)} />
      </div>

      <label className="form-group-label">
        Ignored users (one per line)
      </label>
      <div className="form-group">
        <textarea title="blocked users" className="config-input-text"
          value={this.state.config.blockedUsers.join('\n')}
          onChange={(e) => this.onValueChange("blockedUsers", e.target.value.split('\n'))} />
      </div>

      <div className="form-group">
        <Checkbox label="Show badges" value={this.state.config.showBadges} onChange={(e) => this.onValueChange("showBadges", e.target.checked)} />
        <Checkbox label="Show pronouns" value={this.state.config.showPronouns} onChange={(e) => this.onValueChange("showPronouns", e.target.checked)} />
        <Checkbox label="Show user colours" value={this.state.config.showUserColours} onChange={(e) => this.onValueChange("showUserColours", e.target.checked)} />

        {
          this.state.config.showUserColours ?
            <Checkbox label="Readable colours" value={this.state.config.readableColours} onChange={(e) => this.onValueChange("readableColours", e.target.checked)} /> : null
        }

        <Checkbox label="Hide commands" value={this.state.config.hideCommands} onChange={(e) => this.onValueChange("hideCommands", e.target.checked)} />
        <Checkbox label="Temporary messages" value={this.state.config.hideMessages} onChange={(e) => this.onValueChange("hideMessages", e.target.checked)} />
        <Checkbox label="Drop shadow" value={this.state.config.dropShadow} onChange={(e) => this.onValueChange("dropShadow", e.target.checked)} />
        <Checkbox label="Outline" value={this.state.config.outline} onChange={(e) => this.onValueChange("outline", e.target.checked)} />
      </div>

      {this.state.config.hideMessages ? (
        <>
          <h4 className="form-group-header">Temporary Messages</h4>

          <div className="form-group">
            <label className="form-label">
              Message Timeout (seconds)
              <input type="number"
                className="config-input-text config-input-number"
                placeholder="Message Timeout"
                size={1}
                defaultValue={this.state.config.hideMessagesTimeout / 1000}
                onBlur={(e) => this.onValueChange("hideMessagesTimeout", isNaN(+e.target.value) ? this.state.config.hideMessagesTimeout : +e.target.value * 1000)} />
            </label>
          </div>
        </>
      ) : null}

      {this.state.config.showUserColours && this.state.config.readableColours ? (
        <>
          <h4 className="form-group-header">Readable Colour Options</h4>

          <div className="form-group">
            <label className="form-label">
              Target Contrast
              <input type="range"
                min={0}
                max={10}
                step={0.5}
                value={this.state.config.readableContrast}
                onChange={(e) => this.onValueChange("readableContrast", +e.target.value)} />
            </label>

            <label className="form-label">
              Background Colour
              <input type="color"
                className="config-input-text"
                size={1}
                value={this.state.config.readableBackground}
                onChange={(e) => this.onValueChange("readableBackground", e.target.value)} />
            </label>

            <label className="form-label">
              Adjustment Mode

              <select className="config-input-text"
                value={this.state.config.readableMode}
                onChange={(e) => this.onValueChange("readableMode", +e.target.value)}>
                <option value="1">HSL Luma (FFZ Default)</option>
                <option value="2">Luv Luma</option>
                <option value="3">HSL Loop (BTTV-like)</option>
                <option value="4">RGB Loop</option>
              </select>
            </label>
          </div>
        </>
      ) : null}

      {this.state.config.dropShadow ? (
        <>
          <h4 className="form-group-header">Shadow Options</h4>

          <div className="form-group">
            <label className="form-label">
              Offset
              <input type="text"
                className="config-input-text config-input-number"
                placeholder="Shadow Offset"
                size={1}
                value={this.state.config.dropShadowOffset}
                onChange={(e) => this.onValueChange("dropShadowOffset", isNaN(+e.target.value) ? this.state.config.dropShadowOffset : +e.target.value)} />
            </label>

            <label className="form-label">
              Blur Radius
              <input type="text"
                className="config-input-text config-input-number"
                placeholder="Shadow Blur Radius"
                size={1}
                value={this.state.config.dropShadowBlur}
                onChange={(e) => this.onValueChange("dropShadowBlur", isNaN(+e.target.value) ? this.state.config.dropShadowBlur : +e.target.value)} />
            </label>

            <label className="form-label">
              Colour
              <input type="color"
                className="config-input-text"
                size={1}
                value={this.state.config.dropShadowColour}
                onChange={(e) => this.onValueChange("dropShadowColour", e.target.value)} />
            </label>
          </div>
        </>
      ) : null}


      {this.state.config.outline ? (
        <>
          <h4 className="form-group-header">Outline Options</h4>

          <div className="form-group">
            <label className="form-label">
              Thickness
              <input type="text"
                className="config-input-text config-input-number"
                placeholder="Outline Thickness"
                size={1}
                value={this.state.config.outlineThickness}
                onChange={(e) => this.onValueChange("outlineThickness", isNaN(+e.target.value) ? this.state.config.outlineThickness : +e.target.value)} />
            </label>

            <label className="form-label">
              Colour
              <input type="color"
                className="config-input-text"
                size={1}
                value={this.state.config.outlineColour}
                onChange={(e) => this.onValueChange("outlineColour", e.target.value)} />
            </label>
          </div>
        </>
      ) : null}
    </>)
  }
}