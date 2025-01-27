import { ColorAdjustmentMode, Configuration } from "./Types";

export const TwitchDefaultColors = ["#FF0000", "#0000FF", "#008000", "#B22222", "#FF7F50", "#9ACD32", "#FF4500", "#2E8B57", "#DAA520", "#D2691E", "#5F9EA0", "#1E90FF", "#FF69B4", "#8A2BE2", "#00FF7F"];
export const DefaultConfig: Configuration = {
  channelName: null!,
  accessToken: "",
   
  fontName: "Segoe UI",
  fontSize: 15,
  fontWeight: 400,
  fontColor: "#FFFFFF",
  showBadges: true,
  showPronouns: true,
  showUserColours: true,

  dropShadow: true,
  dropShadowBlur: 1,
  dropShadowOffset: 1,
  dropShadowColour: "#000000",

  outline: false,
  outlineThickness: 1,
  outlineColour: "#000000",

  readableColours: true,
  readableBackground: "#212121",
  readableContrast: 4.5,
  readableMode: ColorAdjustmentMode.hslLuma,

  hideCommands: true,
  hideMessages: false,
  hideMessagesTimeout: 5000,

  blockedUsers: ['streamelements', 'streamlabs', 'nightbot', 'moobot', 'fossabot']
}