import React, { ChangeEvent, Component } from 'react';
import { Chat } from './Chat';
import { Configuration } from './Types';
import * as MsgPack from "@msgpack/msgpack"
import "./config.css"

interface ConfiguratorState {
  config: Configuration;
  chatConfig?: Configuration;
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
    this.state = {
      config: {
        channelName: "",
        fontName: "Segoe UI",
        fontSize: 15,
        fontWeight: 400,
        fontColor: "#FFFFFF",
        showBadges: true,
        showPronouns: true,

        dropShadow: true,
        dropShadowBlur: 1,
        dropShadowOffset: 1,
        dropShadowColour: "#000000",

        outline: false,
        outlineThickness: 1,
        outlineColour: "#000000",

        hideCommands: true,
        blockedUsers: ['streamelements', 'streamlabs', 'nightbot', 'moobot', 'fossabot']
      }
    };
    this.state = { ...this.state, chatConfig: this.state.config }
  }

  updateChat() {
    this.setState({ chatConfig: this.state.config });
  }

  onChannelNameChange(e) {
    this.setState({ config: { ...this.state.config, channelName: e.target.value } });
  }

  onValueChange<T>(name: string, newValue: T) {
    this.setState({ config: { ...this.state.config, [name]: newValue }, chatConfig: { ...this.state.config, [name]: newValue } });
  }

  onSubmit(e) {
    e.preventDefault();
  }

  render() {
    return (
      <div className="config-root">
        <div className="config-pane">
          <div className="config-main">
            <h1>Wam's Chat Thing</h1>

            <form onSubmit={this.onSubmit.bind(this)} className="config-input">
              <h4>A simple, easy to use chat box that supports <a href="http://betterttv.net/">BetterTTV</a>,&nbsp;
                <a href="https://frankerfacez.com/">FrankerFaceZ</a> and&nbsp;
                <a href="https://7tv.app/">7tv</a> emotes!</h4>

              <div className="form-group">
                <label className="form-label">
                  Channel Name
                  <input type="text"
                    className="config-input-text"
                    placeholder="wamwoowam"
                    value={this.state.config.channelName}
                    onChange={this.onChannelNameChange.bind(this)}
                    onBlur={this.updateChat.bind(this)} />
                </label>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ flex: 3 }}>
                  Font
                  <input type="text"
                    className="config-input-text"
                    placeholder="Font Name"
                    size={1}
                    value={this.state.config.fontName}
                    onChange={(e) => this.onValueChange("fontName", e.target.value)} />
                </label>

                <label className="form-label">
                  &nbsp;
                  <input type="text"
                    className="config-input-text"
                    placeholder="Font Size"
                    size={1}
                    value={this.state.config.fontSize}
                    onChange={(e) => this.onValueChange("fontSize", isNaN(+e.target.value) ? this.state.config.fontSize : +e.target.value)} />
                </label>

                <label className="form-label">
                  &nbsp;
                  <select className="config-input-text"
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
                </label>


                <label className="form-label">
                  &nbsp;
                  <input type="color"
                    className="config-input-text"
                    size={1}
                    value={this.state.config.fontColor}
                    onChange={(e) => this.onValueChange("fontColor", e.target.value)} />
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Blocked users (one per line)
                  <textarea className="config-input-text"
                    value={this.state.config.blockedUsers.join('\n')}
                    onChange={(e) => this.onValueChange("blockedUsers", e.target.value.split('\n'))} />
                </label>
              </div>

              <div className="form-group">
                <Checkbox label="Show badges" value={this.state.config.showBadges} onChange={(e) => this.onValueChange("showBadges", e.target.checked)} />
                <Checkbox label="Show pronouns" value={this.state.config.showPronouns} onChange={(e) => this.onValueChange("showPronouns", e.target.checked)} />
                <Checkbox label="Hide commands" value={this.state.config.hideCommands} onChange={(e) => this.onValueChange("hideCommands", e.target.checked)} />
                <Checkbox label="Drop shadow" value={this.state.config.dropShadow} onChange={(e) => this.onValueChange("dropShadow", e.target.checked)} />
                <Checkbox label="Outline" value={this.state.config.outline} onChange={(e) => this.onValueChange("outline", e.target.checked)} />
              </div>

              {this.state.config.dropShadow ? (
                <>
                  <h4 style={{ marginTop: "1em", marginBottom: "-0.5em" }}>Shadow Options</h4>

                  <div className="form-group">
                    <label className="form-label">
                      Offset
                      <input type="text"
                        className="config-input-text"
                        placeholder="Shadow Offset"
                        size={1}
                        value={this.state.config.dropShadowOffset}
                        onChange={(e) => this.onValueChange("dropShadowOffset", isNaN(+e.target.value) ? this.state.config.dropShadowOffset : +e.target.value)} />
                    </label>

                    <label className="form-label">
                      Blur Radius
                      <input type="text"
                        className="config-input-text"
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
                        onChange={(e) => this.onValueChange("dropShadowColor", e.target.value)} />
                    </label>
                  </div>
                </>
              ) : null}


              {this.state.config.outline ? (
                <>
                  <h4 style={{ marginTop: "1em", marginBottom: "-0.5em" }}>Outline Options</h4>

                  <div className="form-group">
                    <label className="form-label">
                      Thickness
                      <input type="text"
                        className="config-input-text"
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
            </form>

            <div className="config-footer">
              <p>Paste this into a browser source!</p>
              <input className="config-input-text" readOnly={true} value={`${window.location.href}chat#${btoa(String.fromCharCode(...MsgPack.encode(this.state.config)))}`} />
            </div>
          </div>
        </div>

        <div className="config-example">
          <Chat {...this.state.chatConfig!} />
        </div>
      </div>
    )
  }
}