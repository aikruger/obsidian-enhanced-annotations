import { refreshAnnotation } from '../../editor-plugin';
import { Decoration } from '@codemirror/view';
import { Settings } from '../../../settings/settings-type';
import { generateLabelStyleString } from './helpers/generate-label-style-string';
import LabeledAnnotations from '../../../main';

type StyleDecorations = {
    comment: Decoration | null;
    tag: Decoration | null;
    highlight: Decoration | null;
};

export class DecorationSettings {
    constructor(private plugin: LabeledAnnotations) {}

    private _enabled = true;

    get enabled(): boolean {
        return this._enabled;
    }

    set enabled(value: boolean) {
        this._enabled = value;
        this.decorate();
    }

    private _decorations: Record<string, StyleDecorations>;

    get decorations() {
        return this._decorations;
    }

    private _decorateTags: boolean;

    get decorateTags() {
        return this._decorateTags;
    }

    setSettings(styles: Settings['decoration']['styles']) {
        this._decorations = Object.values(styles.labels).reduce(
            (acc, val) => {
                if (val.enableStyle) {
                    const decorations: StyleDecorations = acc[val.label] || {
                        comment: null,
                        highlight: null,
                        tag: null,
                    };

                    if (!val.style.scope || val.style.scope === 'highlights') {
                        decorations.highlight = Decoration.mark({
                            attributes: {
                                style: generateLabelStyleString(
                                    val.style,
                                    true,
                                ),
                            },
                        });
                    }
                    if (!val.style.scope || val.style.scope === 'comments') {
                        decorations.comment = Decoration.mark({
                            attributes: {
                                style: generateLabelStyleString(
                                    val.style,
                                    false,
                                ),
                            },
                        });
                        decorations.tag = Decoration.mark({
                            attributes: {
                                style: generateLabelStyleString(
                                    {
                                        ...val.style,
                                        ...styles.tag.style,
                                    },
                                    false,
                                ),
                            },
                        });
                    }

                    acc[val.label] = decorations;
                }
                return acc;
            },
            {} as Record<string, StyleDecorations>,
        );
        this._decorateTags = styles.tag.enableStyle;

        this.decorate();
    }

    private decorate() {
        const editor = this.plugin.app.workspace.activeEditor?.editor;
        if (editor) {
            // @ts-ignore
            if (editor.cm && editor.cm.dispatch) {
                // @ts-ignore
                editor.cm.dispatch({
annotations: refreshAnnotation.of(true)
                });
}
}
}
}
