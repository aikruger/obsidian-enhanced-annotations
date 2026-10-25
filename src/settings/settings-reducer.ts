import {
    Case,
    CommentFormat,
    DefaultPalette,
    FontFamily,
    FontWeight,
    Opacity,
    Settings,
    StyleScope,
} from './settings-type';
import { getDefaultColor } from './helpers/get-default-color';
import { isValidLabel } from '../editor-suggest/helpers/is-valid-label';

export type SettingsActions =
    | {
          type: 'SET_PATTERN';
          payload: {
              id: string;
              pattern: string;
          };
      }
    | {
          type: 'SET_COLOR';
          payload: {
              id: string;
              color: string;
          };
      }
    | {
          type: 'DELETE_GROUP';
          payload: {
              id: string;
          };
      }
    | {
          type: 'NEW_GROUP';
          payload: {
              pattern: string;
              id: string; // ID passed in payload to keep reducer pure
          };
      }
    | { type: 'ENABLE_AUTO_SUGGEST'; payload: { enable: boolean } }
    | { type: 'SET_AUTO_SUGGEST_TRIGGER'; payload: { trigger: string } }
    | { type: 'ENABLE_AUTO_REGISTER_LABELS'; payload: { enable: boolean } }
    | {
          type: 'ENABLE_LABEL_STYLES';
          payload: { id: string; enable: boolean };
      }
    | {
          type: 'SET_LABEL_UNDERLINE';
          payload: {
              id: string;
              underline: boolean;
          };
      }
    | { type: 'SET_TAG_FONT_WEIGHT'; payload: { weight?: FontWeight } }
    | { type: 'SET_TAG_FONT_FAMILY'; payload: { family?: FontFamily } }
    | { type: 'SET_TAG_FONT_SIZE'; payload: { fontSize?: number } }
    | { type: 'SET_TAG_OPACITY'; payload: { opacity?: Opacity } }
    | { type: 'ENABLE_TAG_STYLES'; payload: { enable: boolean } }
    | {
          type: 'SET_LABEL_FONT_WEIGHT';
          payload: {
              id: string;
              weight?: FontWeight;
          };
      }
    | {
          type: 'SET_LABEL_FONT_FAMILY';
          payload: {
              id: string;
              family?: FontFamily;
          };
      }
    | {
          type: 'SET_LABEL_FONT_OPACITY';
          payload: {
              id: string;
              opacity?: Opacity;
          };
      }
    | {
          type: 'SET_LABEL_FONT_SIZE';
          payload: {
              id: string;
              fontSize?: number;
          };
      }
    | {
          type: 'SET_LABEL_ITALIC';
          payload: {
              id: string;
              italic: boolean;
          };
      }
    | {
          type: 'SET_LABEL_CASE';
          payload: {
              id: string;
              case?: Case;
          };
      }
    | {
          type: 'SET_LABEL_SCOPE';
          payload: {
              id: string;
              scope?: StyleScope;
          };
      }
    | {
          type: 'SET_AUTO_SUGGEST_COMMENT_TYPE';
          payload: { type: CommentFormat };
      }
    | { type: 'SET_DEFAULT_PALETTE'; payload: { palette: DefaultPalette } };

const updateState = (store: Settings, action: SettingsActions) => {
    const labels = store.decoration.styles.labels;
    const tag = store.decoration.styles.tag;

    // Helper to safely access label
    const safeLabel = (id: string) => {
        return labels[id];
    };

    if (action.type === 'SET_PATTERN') {
        const label = safeLabel(action.payload.id);
        if (label && (!action.payload.pattern || isValidLabel(action.payload.pattern)))
            label.label = action.payload.pattern;
    } else if (action.type === 'SET_COLOR') {
        const label = safeLabel(action.payload.id);
        if (label) label.style.color = action.payload.color;
    } else if (action.type === 'DELETE_GROUP') {
        delete labels[action.payload.id];
    } else if (action.type === 'NEW_GROUP') {
        if (!action.payload.pattern || isValidLabel(action.payload.pattern)) {
            const id = action.payload.id;
            labels[id] = {
                label: action.payload.pattern,
                id,
                enableStyle: true,
                style: {
                    color: getDefaultColor(store),
                    italic: true,
                    fontWeight: 'thin',
                },
            };
        }
    } else if (action.type === 'ENABLE_AUTO_SUGGEST') {
        store.editorSuggest.enableAutoSuggest = action.payload.enable;
    } else if (action.type === 'SET_AUTO_SUGGEST_TRIGGER') {
        if (action.payload.trigger)
            store.editorSuggest.triggerPhrase = action.payload.trigger;
    } else if (action.type === 'ENABLE_AUTO_REGISTER_LABELS') {
        store.decoration.autoRegisterLabels = action.payload.enable;
    } else if (action.type === 'ENABLE_LABEL_STYLES') {
        const label = safeLabel(action.payload.id);
        if (label) label.enableStyle = action.payload.enable;
    } else if (action.type === 'SET_LABEL_UNDERLINE') {
        const label = safeLabel(action.payload.id);
        if (label) label.style.underline = action.payload.underline;
    } else if (action.type === 'SET_LABEL_FONT_WEIGHT') {
        const label = safeLabel(action.payload.id);
        if (label) label.style.fontWeight = action.payload.weight;
    } else if (action.type === 'SET_LABEL_SCOPE') {
        const label = safeLabel(action.payload.id);
        if (label) label.style.scope = action.payload.scope;
    } else if (action.type === 'SET_LABEL_FONT_OPACITY') {
        const label = safeLabel(action.payload.id);
        if (label) label.style.opacity = action.payload.opacity;
    } else if (action.type === 'SET_LABEL_FONT_FAMILY') {
        const label = safeLabel(action.payload.id);
        if (label) label.style.fontFamily = action.payload.family;
    } else if (action.type === 'SET_LABEL_FONT_SIZE') {
        const label = safeLabel(action.payload.id);
        if (label) label.style.fontSize = action.payload.fontSize;
    } else if (action.type === 'SET_LABEL_ITALIC') {
        const label = safeLabel(action.payload.id);
        if (label) label.style.italic = action.payload.italic;
    } else if (action.type === 'SET_LABEL_CASE') {
        const label = safeLabel(action.payload.id);
        if (label) label.style.case = action.payload.case;
    } else if (action.type === 'SET_AUTO_SUGGEST_COMMENT_TYPE') {
        store.editorSuggest.commentFormat = action.payload.type;
    } else if (action.type === 'ENABLE_TAG_STYLES') {
        tag.enableStyle = action.payload.enable;
    } else if (action.type === 'SET_TAG_FONT_FAMILY') {
        tag.style.fontFamily = action.payload.family;
    } else if (action.type === 'SET_TAG_FONT_SIZE') {
        tag.style.fontSize = action.payload.fontSize;
    } else if (action.type === 'SET_TAG_FONT_WEIGHT') {
        tag.style.fontWeight = action.payload.weight;
    } else if (action.type === 'SET_TAG_OPACITY') {
        tag.style.opacity = action.payload.opacity;
    } else if (action.type === 'SET_DEFAULT_PALETTE') {
        store.decoration.defaultPalette = action.payload.palette;
    }
};



export const settingsReducer = (
    store: Settings,
    action: SettingsActions,
): Settings => {
    updateState(store, action);
    if (action.type === 'NEW_GROUP') {
        console.info("[CommentFormatting] Comment type created", { label: action.payload.pattern });
    } else if (action.type === 'DELETE_GROUP') {
        console.info("[CommentFormatting] Comment type deleted", { id: action.payload.id });
    } else if (action.type === 'SET_PATTERN') {
        console.info("[CommentFormatting] Comment type renamed", { id: action.payload.id, label: action.payload.pattern });
    } else if (action.type.startsWith('SET_LABEL_') || action.type === 'SET_COLOR' || action.type === 'ENABLE_LABEL_STYLES') {
        console.debug("[CommentFormatting] Comment type style updated", { id: (action.payload as any).id, changedKeys: [action.type] });
    }
    return store;
};
