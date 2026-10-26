import {
    DecorationSet,
    EditorView,
    PluginSpec,
    PluginValue,
    ViewPlugin,
    ViewUpdate,
} from '@codemirror/view';
import { decorateAnnotations } from './helpers/decorate-annotations/decorate-annotations';
import LabeledAnnotations from '../main';
import { Annotation, Transaction } from '@codemirror/state';

export const refreshAnnotation = Annotation.define<boolean>();

type AnnotatedTransaction = Transaction & {
    annotations?: Annotation<string>[];
};

export class EditorPlugin implements PluginValue {
    static plugin: LabeledAnnotations;
    decorations: DecorationSet;

    constructor(view: EditorView) {
        this.decorations = decorateAnnotations(view, EditorPlugin.plugin);
    }

    update(update: ViewUpdate) {
        if (
            update.docChanged ||
            update.viewportChanged ||
            update.transactions.some(tr => tr.annotation(refreshAnnotation))
        ) {
            this.decorations = decorateAnnotations(
                update.view,
                EditorPlugin.plugin,
            );
        }
    }

    destroy() {}
}

const pluginSpec: PluginSpec<EditorPlugin> = {
    decorations: (value: EditorPlugin) => value.decorations,
};

export const editorPlugin = ViewPlugin.fromClass(EditorPlugin, pluginSpec);
