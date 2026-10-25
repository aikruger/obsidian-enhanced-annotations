
export type Case = 'upper' | 'lower' | 'title';
export type Opacity = 80 | 60 | 40 | 20;
export type FontWeight = 'thin' | 'bold';
export type FontFamily = 'sans-serif' | 'serif' | 'monospace';

export type TagStyle = {
    fontSize?: number;
    fontWeight?: FontWeight;
    fontFamily?: FontFamily;
    opacity?: Opacity;
};

export type TagSettings = {
    style: TagStyle;
    enableStyle: boolean;
};

export type StyleScope = 'comments' | 'highlights';

export type LabelStyle = {
    color?: string;
    italic?: boolean;
    underline?: boolean;
    fontSize?: number;
    case?: Case;
    fontWeight?: FontWeight;
    opacity?: Opacity;
    fontFamily?: FontFamily;
    scope?: StyleScope;
};
export type LabelSettings = {
    label: string;
    id: string;
    style: LabelStyle;
    enableStyle: boolean;
};
export type CommentFormat = 'markdown' | 'html';
export type DefaultPalette = 'bright' | 'dull';

export type Settings = {
    editorSuggest: {
        enableAutoSuggest: boolean;
        triggerPhrase: string;
        commentFormat: CommentFormat;
    };
    decoration: {
        autoRegisterLabels: boolean;
        styles: {
            labels: Record<string, LabelSettings>;
            tag: TagSettings;
        };
        defaultPalette: DefaultPalette;
    };
};