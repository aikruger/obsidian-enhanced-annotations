import { Settings } from './settings-type';

export const DEFAULT_SETTINGS = (): Settings => ({
    editorSuggest: {
        enableAutoSuggest: true,
        triggerPhrase: '@',
        commentFormat: 'html',
    },
    decoration: {
        autoRegisterLabels: true,
        styles: {
            labels: {},
            tag: {
                style: { fontSize: 10, opacity: 40 },
                enableStyle: true,
            },
        },
        defaultPalette: 'bright',
    },
});
