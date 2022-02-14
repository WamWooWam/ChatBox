import { ColorAdjustmentMode } from "./ColorAdjustmentMode";

declare module "Color"

export class ColorAdjuster {
    constructor(base?: string, mode?: ColorAdjustmentMode, contrast?: number);

    contrast: number;
    base: string;
    mode: ColorAdjustmentMode;
    dark: boolean;

    rebuildContrast(): void;
    process(color: string): string;
}