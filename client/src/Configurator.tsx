import "./config.css"

import React, { ChangeEvent, Component, FormEvent } from 'react';

import { Chat } from './Chat';
import { Configuration } from './Types';
import { DefaultConfig } from './Constants';
import { encode } from "@msgpack/msgpack"

type FontData = {
  family: string,
}

declare global {
  interface Window {
    queryLocalFonts: () => Promise<FontData[]>
  }
}

interface ConfiguratorState {
  config: Configuration;
  chatConfig?: Configuration;
  window: Window | null;
  fonts: FontData[],
  showFontsButton?: boolean;
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

  constructor(props: {}) {
    super(props);
    this.state = { config: DefaultConfig, chatConfig: DefaultConfig, window: null, fonts: [] };
  }

  componentDidMount() {
    this.loadFonts();
  }

  private loadFonts() {
    if (typeof window.queryLocalFonts === "function") {
      window.queryLocalFonts()
        .then((fonts: FontData[]) => {
          this.setState({ fonts: fonts.filter((f, i, a) => a.findIndex(o => o.family == f.family) === i) });
        })
        .catch((e) => {
          this.setState({ showFontsButton: true });
        });
    }
  }

  updateChat() {
    this.setState((state) => ({ chatConfig: { ...state.config } }));
  }

  onValueChange<T>(name: keyof Configuration, newValue: T) {
    this.setState((state) => ({ config: { ...state.config, [name]: newValue }, chatConfig: { ...state.config, [name]: newValue } }));
  }

  showHelpDialog() {

  }

  getUrl() {
    let configDiff = {};
    for (const key in this.state.config) {
      const element = this.state.config[key];
      const element2 = DefaultConfig[key];
      if (element !== element2) {
        configDiff[key] = element;
      }
    }

    delete configDiff["accessToken"];

    let configString = btoa(String.fromCharCode(...encode(configDiff)));
    return window.location.protocol + "//" + window.location.host + "/chatbox/" + configString;
  }

  onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  render() {
    return (
      <>
        <div className="config-background" />
        <div className="config-root dark">
          <div className="config-pane">
            <div className="config-main">
              <form onSubmit={this.onSubmit.bind(this)} className="config-input">
                <h1>Wam's Chatbox</h1>
                <h4>A simple, easy to use chatbox that supports <a href="https://betterttv.net/">BetterTTV</a>, <a href="https://frankerfacez.com/">FrankerFaceZ</a> and <a href="https://7tv.app/">7tv</a> emotes!</h4>

                <div className="config-warning">
                  <p>This chatbox is not yet finished so links may break in future! Please don't use it in your layouts yet.</p>
                </div>

                {this.renderConfigSection()}

              </form>

              <div className="config-footer">
                <p>Paste this into a browser source!</p>
                <input className="config-input-text" readOnly={true} value={this.getUrl()} />
              </div>
            </div>
          </div>

          <div className="config-example">
            <Chat {...this.state.chatConfig!} />
          </div>
        </div>
      </>
    )
  }

  renderConfigSection() {
    return (<>
      <label className="form-group-label">
        Channel Name
      </label>
      <div className="form-group">
        <input type="text"
          className="config-input-text"
          placeholder="wamwoowam"
          value={this.state.config.channelName}
          onChange={(e) => this.setState((state) => ({ config: { ...state.config, channelName: (e.target as HTMLInputElement).value } }))}
          onBlur={this.updateChat.bind(this)} />
      </div>

      <div className="form-group-label form-group-font">
        <label className="form-group-font-label">Font</label>
        {/* <button className="form-group-font-help" onClick={this.showHelpDialog.bind(this)}>Help!</button> */}
      </div>
      <div className="form-group">
        {this.state.fonts.length ?
          <select className="config-input-text"
            style={{ flex: 3 }}
            value={this.state.config.fontName}
            onChange={(e) => this.onValueChange("fontName", (e.target as HTMLInputElement).value)}>
            {this.state.fonts.map((font) => <option value={font.family}>{font.family}</option>)}
          </select>
          : <input type="text"
            className="config-input-text"
            placeholder="Font Name"
            size={1}
            style={{ flex: 3 }}
            value={this.state.config.fontName}
            onChange={(e) => this.onValueChange("fontName", (e.target as HTMLInputElement).value)} />
        }

        {this.state.showFontsButton && this.state.fonts.length === 0 ? <button className="btn" onClick={() => this.loadFonts()}>Load Fonts</button> : null}

        <input type="text"
          className="config-input-text config-input-number"
          placeholder="Font Size"
          size={1}
          value={this.state.config.fontSize}
          onChange={(e) => this.onValueChange("fontSize", isNaN(+(e.target as HTMLInputElement).value) ? this.state.config.fontSize : +(e.target as HTMLInputElement).value)} />

        <select title="font weight" className="config-input-text"
          value={this.state.config.fontWeight}
          onChange={(e) => this.onValueChange("fontWeight", +(e.target as HTMLInputElement).value)}>
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
          onChange={(e) => this.onValueChange("fontColor", (e.target as HTMLInputElement).value)} />
      </div>

      <label className="form-group-label">
        Ignored users (one per line)
      </label>
      <div className="form-group">
        <textarea title="blocked users" className="config-input-text"
          value={this.state.config.blockedUsers.join('\n')}
          onChange={(e) => this.onValueChange("blockedUsers", (e.target as HTMLTextAreaElement).value.split('\n'))} />
      </div>

      <div className="form-group">
        <Checkbox label="Show badges" value={this.state.config.showBadges} onChange={(e) => this.onValueChange("showBadges", (e.target as HTMLInputElement).checked)} />
        <Checkbox label="Show pronouns" value={this.state.config.showPronouns} onChange={(e) => this.onValueChange("showPronouns", (e.target as HTMLInputElement).checked)} />
        <Checkbox label="Show user colours" value={this.state.config.showUserColours} onChange={(e) => this.onValueChange("showUserColours", (e.target as HTMLInputElement).checked)} />

        {
          this.state.config.showUserColours ?
            <Checkbox label="Readable colours" value={this.state.config.readableColours} onChange={(e) => this.onValueChange("readableColours", (e.target as HTMLInputElement).checked)} /> : null
        }

        <Checkbox label="Hide commands" value={this.state.config.hideCommands} onChange={(e) => this.onValueChange("hideCommands", (e.target as HTMLInputElement).checked)} />
        <Checkbox label="Temporary messages" value={this.state.config.hideMessages} onChange={(e) => this.onValueChange("hideMessages", (e.target as HTMLInputElement).checked)} />
        <Checkbox label="Drop shadow" value={this.state.config.dropShadow} onChange={(e) => this.onValueChange("dropShadow", (e.target as HTMLInputElement).checked)} />
        <Checkbox label="Outline" value={this.state.config.outline} onChange={(e) => this.onValueChange("outline", (e.target as HTMLInputElement).checked)} />
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
                onBlur={(e) => this.onValueChange("hideMessagesTimeout", isNaN(+(e.target as HTMLInputElement).value) ? this.state.config.hideMessagesTimeout : +(e.target as HTMLInputElement).value * 1000)} />
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
                onChange={(e) => this.onValueChange("readableContrast", +(e.target as HTMLInputElement).value)} />
            </label>

            <label className="form-label">
              Background Colour
              <input type="color"
                className="config-input-text"
                size={1}
                value={this.state.config.readableBackground}
                onChange={(e) => this.onValueChange("readableBackground", (e.target as HTMLInputElement).value)} />
            </label>

            <label className="form-label">
              Adjustment Mode

              <select className="config-input-text"
                value={this.state.config.readableMode}
                onChange={(e) => this.onValueChange("readableMode", +(e.target as HTMLInputElement).value)}>
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
                onChange={(e) => this.onValueChange("dropShadowOffset", isNaN(+(e.target as HTMLInputElement).value) ? this.state.config.dropShadowOffset : +(e.target as HTMLInputElement).value)} />
            </label>

            <label className="form-label">
              Blur Radius
              <input type="text"
                className="config-input-text config-input-number"
                placeholder="Shadow Blur Radius"
                size={1}
                value={this.state.config.dropShadowBlur}
                onChange={(e) => this.onValueChange("dropShadowBlur", isNaN(+(e.target as HTMLInputElement).value) ? this.state.config.dropShadowBlur : +(e.target as HTMLInputElement).value)} />
            </label>

            <label className="form-label">
              Colour
              <input type="color"
                className="config-input-text"
                size={1}
                value={this.state.config.dropShadowColour}
                onChange={(e) => this.onValueChange("dropShadowColour", (e.target as HTMLInputElement).value)} />
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
                onChange={(e) => this.onValueChange("outlineThickness", isNaN(+(e.target as HTMLInputElement).value) ? this.state.config.outlineThickness : +(e.target as HTMLInputElement).value)} />
            </label>

            <label className="form-label">
              Colour
              <input type="color"
                className="config-input-text"
                size={1}
                value={this.state.config.outlineColour}
                onChange={(e) => this.onValueChange("outlineColour", (e.target as HTMLInputElement).value)} />
            </label>
          </div>
        </>
      ) : null}
    </>)
  }
}