import { Plugin } from 'obsidian';
import { addInsertCommentCommands } from './commands/commands';
import { Settings } from './settings/settings-type';
import { SettingsTab } from './settings/settings-tab/settings-tab';
import { Store } from './helpers/store';
import { SettingsActions, settingsReducer } from './settings/settings-reducer';
import { AnnotationSuggest } from './editor-suggest/annotation-suggest';
import { DEFAULT_SETTINGS } from './settings/default-settings';
import { mergeDeep } from './settings/helpers/merge-objects';

import { subscribeDecorationStateToSettings } from './settings/helpers/subscribe-decoration-state-to-settings';
import { DecorationSettings } from './editor-plugin/helpers/decorate-annotations/decoration-settings';
import { EditorPlugin, editorPlugin } from './editor-plugin/editor-plugin';

export default class LabeledAnnotations extends Plugin {
    settings: Store<Settings, SettingsActions>;
    decorationSettings: DecorationSettings;
    editorSuggest: AnnotationSuggest;
    private unsubscribeCallbacks: Set<() => void> = new Set();

    async onload() {
        await this.loadSettings();

        this.editorSuggest = new AnnotationSuggest(this.app, this);
        this.registerEditorSuggest(this.editorSuggest);

        addInsertCommentCommands(this);

        this.app.workspace.onLayoutReady(async () => {
            // Detach any existing sidebar leaves for cleanup
            const SIDEBAR_OUTLINE_VIEW_TYPE = 'annotations-outline';
            const leaves = this.app.workspace.getLeavesOfType(SIDEBAR_OUTLINE_VIEW_TYPE);
            for (const leaf of leaves) {
                leaf.detach();
            }

            this.addSettingTab(new SettingsTab(this.app, this));
            this.loadPlugin(); // Load plugin features like decoration directly instead of conditionally

            console.info("[CommentFormatting] Plugin loaded", {
              commentTypeCount: Object.keys(this.settings.getValue().decoration.styles.labels).length,
              indexingEnabled: false,
              sidebarEnabled: false,
            });
            console.info("[CommentFormatting] Suggestion provider registered");
        });
    }

    onunload() {
        for (const callback of this.unsubscribeCallbacks) {
            callback();
        }
        console.info("[CommentFormatting] Plugin unloaded");
    }

    loadPlugin() {
        this.decorationSettings = new DecorationSettings(this);
        EditorPlugin.plugin = this;
        this.unsubscribeCallbacks.add(subscribeDecorationStateToSettings(this));
        this.registerEditorExtension([editorPlugin]);
    }

    async loadSettings() {
        const rawSettings = (await this.loadData()) || {};
        let needsMigration = false;

        // Remove obsolete properties
        const obsoleteKeys = ['outline', 'tts', 'notes', 'clipboard', 'idling'];
        for (const key of obsoleteKeys) {
            if (rawSettings.hasOwnProperty(key)) {
                delete rawSettings[key];
                needsMigration = true;
            }
        }

        this.settings = new Store<Settings, SettingsActions>(
            mergeDeep(rawSettings, DEFAULT_SETTINGS()),
            settingsReducer,
        );

        if (needsMigration) {
            console.info("[CommentFormatting] Settings migration completed");
            await this.saveSettings();
        }

        this.registerSubscription(
            this.settings.subscribe(() => {
                this.saveSettings();
            }),
        );
    }

    private saveSettingsTimeout: number | null = null;
    private saveSettingsPromise: Promise<void> | null = null;

    async saveSettings() {
        if (this.saveSettingsTimeout) {
            window.clearTimeout(this.saveSettingsTimeout);
        }

        this.saveSettingsTimeout = window.setTimeout(async () => {
            try {
                if (this.saveSettingsPromise) await this.saveSettingsPromise;

                const p = this.saveData(this.settings.getValue());
                this.saveSettingsPromise = p;
                await p;
            } catch (error) {
                console.error("[CommentFormatting] Settings save failed", { error });
            } finally {
                this.saveSettingsPromise = null;
            }
        }, 100);
    }

    registerSubscription(...callback: (() => void)[]) {
        callback.forEach((callback) => {
            this.unsubscribeCallbacks.add(callback);
        });
    }
}
