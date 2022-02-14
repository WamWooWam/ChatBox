import React from 'react';
import { Configuration } from "./Types";
import { ColorAdjuster } from './Color';
import { Pronouns } from './Chat';

export const ConfigContext = React.createContext<Configuration | null>(null);
export const ColorContext = React.createContext<ColorAdjuster>(new ColorAdjuster());
export const BadgesContext = React.createContext<Map<string, string[][]>>(new Map());
export const EmotesContext = React.createContext<Map<string, string[]>>(new Map());
export const PronounsContext = React.createContext<Pronouns | null>(null);
