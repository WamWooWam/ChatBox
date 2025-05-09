import { ColorAdjuster } from './Color';
import { Configuration } from "./Types";
import { Pronouns } from './Chat';
import { createContext } from 'preact';

export const ConfigContext = createContext<Configuration | null>(null);
export const ColorContext = createContext<ColorAdjuster>(new ColorAdjuster());
export const BadgesContext = createContext<Map<string, string[][]>>(new Map());
export const EmotesContext = createContext<Map<string, string[]>>(new Map());
export const PronounsContext = createContext<Pronouns | null>(null);
