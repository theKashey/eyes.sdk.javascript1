export type FancyFromatter = {
    body: (body: Record<string, string[]>) => void;
    section: (title: string, data: string, key: string) => void;
    header: (header: string) => void;
    footer: (footer: string) => void;
    color: (text: string, color: string) => string;
    bold: (text: string, color?: string) => string;
    underline: (text: string, color?: string) => string;
    italic: (text: string, color?: string) => string;
    background: (text: string, color?: string) => string;
    dim: (text: string, color?: string) => string;
    green: (text: string) => string;
    yellow: (text: string) => string;
    red: (text: string) => string;
    gray: (text: string) => string;
    marine: (text: string) => string;
    white: (text: string) => string;
    cyan: (text: string) => string;
    pink: (text: string) => string;
    magenta: (text: string) => string;
    blue: (text: string) => string;
    teal: (text: string) => string;
    reset: (text: string) => string;
}

export type FancyOptions = {
    header: string;
    body: Record<string, string[]>;
    footer: string;
    indent: number;
    dull: boolean;
    template: string;
}

export type FancyFormatterFunction = (formatter: FancyFromatter, templateObject: Record<string, string | string[]>) => void

export default function fancy(options: FancyOptions, formatterFunction: FancyFormatterFunction): Record<string, string | Function>;