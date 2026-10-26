import { Setting, Notice } from 'obsidian';
import { TagSettings } from './components/tag-settings';
import { DefaultPalette } from '../../../settings-type';
import { l } from '../../../../lang/lang';
import LabeledAnnotations from '../../../../main';
import { CommentTypeSettings } from './components/comment-type-settings';
import { isValidLabel } from '../../../../editor-suggest/helpers/is-valid-label';
type Props = {
    containerEl: HTMLElement;
    plugin: LabeledAnnotations;
};

export const LabelsSettings = ({ plugin, containerEl }: Props) => {
    const settings = plugin.settings.getValue();
    const render = () => {
        containerEl.empty();
        LabelsSettings({
            plugin,
            containerEl,
        });
    };

    // Comment Types Header
    new Setting(containerEl)
        .setName("Comment types")
        .setHeading()
        .settingEl.addClass('enhanced-annotations__settings-header');

    // Add Comment Type
    let newTypeName = '';
    const addSetting = new Setting(containerEl)
        .setName("Add comment type")
        .setDesc("Create a new comment type with custom formatting.")
        .addText(text => text
            .setPlaceholder("e.g. Question")
            .onChange(v => newTypeName = v)
        )
        .addButton(btn => btn
            .setButtonText("Create")
            .onClick(() => {
                const trimmed = newTypeName.trim();
                if (!trimmed) {
                    new Notice("Comment type name cannot be empty.");
                    return;
                }
                if (!isValidLabel(trimmed)) {
                    new Notice("Invalid comment type name.");
                    return;
                }

                const labels = Object.values(plugin.settings.getValue().decoration.styles.labels);
                if (labels.some(l => l.label.toLowerCase() === trimmed.toLowerCase())) {
                    new Notice("A comment type with this name already exists.");
                    return;
                }

                const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
                plugin.settings.dispatch({ type: 'NEW_GROUP', payload: { pattern: trimmed, id } });
                console.info("[CommentFormatting] Comment type created", { label: trimmed, id });
                render();
            })
        );

    const labels = Object.values(settings.decoration.styles.labels);
    if (labels.length === 0) {
        const emptyState = containerEl.createEl("p", {
            text: "No comment types have been configured. Add a type such as Question, Warning, or Evidence, then choose how comments of that type should appear.",
        });
        emptyState.style.color = "var(--text-muted)";
        emptyState.style.marginBottom = "2em";
    } else {
        // Render each comment type
        labels.forEach(label => {
            CommentTypeSettings({
                plugin,
                containerEl,
                labelSettings: label,
                globalTag: settings.decoration.styles.tag,
                render
            });
        });
    }

    new Setting(containerEl)
        .setName("Global label appearance")
        .setHeading()
        .settingEl.addClass('enhanced-annotations__settings-header');

    TagSettings({
        tag: settings.decoration.styles.tag,
        plugin,
        containerEl,
        render,
    });

    new Setting(containerEl)
        .setName("Advanced")
        .setHeading()
        .settingEl.addClass('enhanced-annotations__settings-header');

    new Setting(containerEl)
        .addDropdown((component) => {
            const options: Record<DefaultPalette, string> = {
                bright: 'Bright',
                dull: 'Dull',
            };
            component.addOptions(options);
            component.setValue(
                settings.decoration.defaultPalette,
            );
            component.onChange((v) => {
                plugin.settings.dispatch({
                    type: 'SET_DEFAULT_PALETTE',
                    payload: {
                        palette: v as DefaultPalette,
                    },
                });
            });
        })
        .setName(l.SETTINGS_DEFAULT_PALETTE)
        .setDesc(l.SETTINGS_DEFAULT_PALETTE_DESC);

    new Setting(containerEl)
        .setName(l.SETTINGS_AUTO_SUGGEST_AUTO_REGISTER)
        .setDesc(l.SETTINGS_AUTO_SUGGEST_AUTO_REGISTER_DESC)
        .addToggle((component) => {
            component
                .onChange((value) =>
                    plugin.settings.dispatch({
                        payload: { enable: value },
                        type: 'ENABLE_AUTO_REGISTER_LABELS',
                    }),
                )
                .setValue(settings.decoration.autoRegisterLabels);
        });
};
