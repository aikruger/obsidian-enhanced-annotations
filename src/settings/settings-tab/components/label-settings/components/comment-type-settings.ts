import { Setting, Notice } from 'obsidian';
import LabeledAnnotations from '../../../../../main';
import { LabelSettings, TagSettings } from '../../../../settings-type';
import { generateLabelStyleString } from '../../../../../editor-plugin/helpers/decorate-annotations/helpers/generate-label-style-string';

type Props = {
    plugin: LabeledAnnotations;
    containerEl: HTMLElement;
    labelSettings: LabelSettings;
    globalTag: TagSettings;
    render: () => void;
};

export const CommentTypeSettings = ({
    plugin,
    containerEl,
    labelSettings,
    globalTag,
    render,
}: Props) => {
    const card = containerEl.createEl('div', { cls: 'enhanced-annotations__comment-card' });
    card.style.border = '1px solid var(--background-modifier-border)';
    card.style.padding = '10px';
    card.style.marginBottom = '10px';
    card.style.borderRadius = '5px';

    // Header / Basic info
    const headerEl = card.createEl('div');
    headerEl.style.display = 'flex';
    headerEl.style.justifyContent = 'space-between';
    headerEl.style.alignItems = 'center';
    headerEl.style.marginBottom = '10px';

    // Name setting (renaming)
    const nameSetting = new Setting(headerEl)
        .setName(labelSettings.label)
        .setHeading();
    nameSetting.settingEl.style.border = 'none';
    nameSetting.settingEl.style.padding = '0';

    const controlsEl = card.createEl('div');

    // Preview
    const previewEl = controlsEl.createEl('div');
    previewEl.style.marginBottom = '10px';
    previewEl.style.padding = '10px';
    previewEl.style.backgroundColor = 'var(--background-secondary)';
    previewEl.style.borderRadius = '5px';

    const updatePreview = () => {
        previewEl.empty();
        const combinedTagStyle = { ...labelSettings.style, ...globalTag.style };

        const previewText = previewEl.createEl('span');

        // Tag portion
        const tagSpan1 = previewText.createEl('span', { text: `%%${labelSettings.label}: ` });
        tagSpan1.style.cssText = generateLabelStyleString(combinedTagStyle, false);

        // Comment body
        const bodySpan = previewText.createEl('span', { text: "Sample comment text" });
        bodySpan.style.cssText = generateLabelStyleString(labelSettings.style, false);

        // Tag portion 2
        const tagSpan2 = previewText.createEl('span', { text: `%%` });
        tagSpan2.style.cssText = generateLabelStyleString(combinedTagStyle, false);

        if (labelSettings.style.scope === 'highlights' || !labelSettings.style.scope) {
             const highlightSpan = previewEl.createEl('div', { text: "Sample highlight text" });
             highlightSpan.style.cssText = generateLabelStyleString(labelSettings.style, true);
             highlightSpan.style.marginTop = '5px';
        }
    };
    updatePreview();

    // Type name
    new Setting(controlsEl)
        .setName("Type name")
        .setDesc("Renaming changes the label offered for new comments. Existing comments retain their original text and may no longer match this type’s formatting.")
        .addText(text => {
            text.setValue(labelSettings.label);
            let val = labelSettings.label;
            text.onChange(v => val = v);
            text.inputEl.onblur = () => {
                const trimmed = val.trim();
                if (!trimmed) {
                    text.setValue(labelSettings.label);
                    new Notice("Name cannot be empty.");
                    return;
                }
                const labels = Object.values(plugin.settings.getValue().decoration.styles.labels);
                if (trimmed.toLowerCase() !== labelSettings.label.toLowerCase() && labels.some(l => l.label.toLowerCase() === trimmed.toLowerCase())) {
                    text.setValue(labelSettings.label);
                    new Notice("A comment type with this name already exists.");
                    return;
                }
                plugin.settings.dispatch({ type: 'SET_PATTERN', payload: { id: labelSettings.id, pattern: trimmed } });
                nameSetting.setName(trimmed);
                updatePreview();
            };
        });

    new Setting(controlsEl)
        .setName("Enable formatting")
        .addToggle(toggle => toggle
            .setValue(labelSettings.enableStyle)
            .onChange(v => {
                plugin.settings.dispatch({ type: 'ENABLE_LABEL_STYLES', payload: { id: labelSettings.id, enable: v } });
            })
        );

    new Setting(controlsEl)
        .setName("Color")
        .addColorPicker(color => color
            .setValue(labelSettings.style.color || '#000000')
            .onChange(v => {
                plugin.settings.dispatch({ type: 'SET_COLOR', payload: { id: labelSettings.id, color: v } });
                updatePreview();
            })
        );

    new Setting(controlsEl)
        .setName("Font weight")
        .addDropdown(dd => {
            dd.addOptions({ 'default': 'Inherit/Default', 'thin': 'Light', 'bold': 'Bold' });
            dd.setValue(labelSettings.style.fontWeight || 'default');
            dd.onChange(v => {
                plugin.settings.dispatch({ type: 'SET_LABEL_FONT_WEIGHT', payload: { id: labelSettings.id, weight: v === 'default' ? undefined : v as any } });
                updatePreview();
            });
        });

    new Setting(controlsEl)
        .setName("Italic")
        .addToggle(toggle => toggle
            .setValue(!!labelSettings.style.italic)
            .onChange(v => {
                plugin.settings.dispatch({ type: 'SET_LABEL_ITALIC', payload: { id: labelSettings.id, italic: v } });
                updatePreview();
            })
        );

    new Setting(controlsEl)
        .setName("Underline")
        .addToggle(toggle => toggle
            .setValue(!!labelSettings.style.underline)
            .onChange(v => {
                plugin.settings.dispatch({ type: 'SET_LABEL_UNDERLINE', payload: { id: labelSettings.id, underline: v } });
                updatePreview();
            })
        );

    new Setting(controlsEl)
        .setName("Font family")
        .addDropdown(dd => {
            dd.addOptions({ 'default': 'Inherit/Default', 'sans-serif': 'Sans-serif', 'serif': 'Serif', 'monospace': 'Monospace' });
            dd.setValue(labelSettings.style.fontFamily || 'default');
            dd.onChange(v => {
                plugin.settings.dispatch({ type: 'SET_LABEL_FONT_FAMILY', payload: { id: labelSettings.id, family: v === 'default' ? undefined : v as any } });
                updatePreview();
            });
        });

    new Setting(controlsEl)
        .setName("Font size")
        .addText(text => text
            .setPlaceholder("e.g. 14")
            .setValue(labelSettings.style.fontSize ? String(labelSettings.style.fontSize) : '')
            .onChange(v => {
                const parsed = parseInt(v);
                plugin.settings.dispatch({ type: 'SET_LABEL_FONT_SIZE', payload: { id: labelSettings.id, fontSize: isNaN(parsed) ? undefined : parsed } });
                updatePreview();
            })
        );

    new Setting(controlsEl)
        .setName("Opacity")
        .addDropdown(dd => {
            dd.addOptions({ 'default': 'Inherit/Default', '80': '80%', '60': '60%', '40': '40%', '20': '20%' });
            dd.setValue(labelSettings.style.opacity ? String(labelSettings.style.opacity) : 'default');
            dd.onChange(v => {
                plugin.settings.dispatch({ type: 'SET_LABEL_FONT_OPACITY', payload: { id: labelSettings.id, opacity: v === 'default' ? undefined : parseInt(v) as any } });
                updatePreview();
            });
        });

    new Setting(controlsEl)
        .setName("Text case")
        .addDropdown(dd => {
            dd.addOptions({ 'default': 'Unchanged', 'upper': 'Uppercase', 'lower': 'Lowercase', 'title': 'Capitalize Words' });
            dd.setValue(labelSettings.style.case || 'default');
            dd.onChange(v => {
                plugin.settings.dispatch({ type: 'SET_LABEL_CASE', payload: { id: labelSettings.id, case: v === 'default' ? undefined : v as any } });
                updatePreview();
            });
        });

    new Setting(controlsEl)
        .setName("Apply formatting to")
        .addDropdown(dd => {
            dd.addOptions({ 'default': 'Both', 'comments': 'Comments only', 'highlights': 'Highlights only' });
            dd.setValue(labelSettings.style.scope || 'default');
            dd.onChange(v => {
                plugin.settings.dispatch({ type: 'SET_LABEL_SCOPE', payload: { id: labelSettings.id, scope: v === 'default' ? undefined : v as any } });
                updatePreview();
            });
        });

    new Setting(controlsEl)

        .addButton(btn => btn
            .setButtonText("Reset formatting")
            .onClick(() => {
                // To reset, we can dispatch multiple actions or a new reset action.
                // It's cleaner to add a RESET_LABEL_STYLE action, but we can also just set everything to undefined.
                plugin.settings.dispatch({ type: 'SET_LABEL_FONT_WEIGHT', payload: { id: labelSettings.id, weight: undefined } });
                plugin.settings.dispatch({ type: 'SET_LABEL_ITALIC', payload: { id: labelSettings.id, italic: false } });
                plugin.settings.dispatch({ type: 'SET_LABEL_UNDERLINE', payload: { id: labelSettings.id, underline: false } });
                plugin.settings.dispatch({ type: 'SET_LABEL_FONT_FAMILY', payload: { id: labelSettings.id, family: undefined } });
                plugin.settings.dispatch({ type: 'SET_LABEL_FONT_SIZE', payload: { id: labelSettings.id, fontSize: undefined } });
                plugin.settings.dispatch({ type: 'SET_LABEL_FONT_OPACITY', payload: { id: labelSettings.id, opacity: undefined } });
                plugin.settings.dispatch({ type: 'SET_LABEL_CASE', payload: { id: labelSettings.id, case: undefined } });
                plugin.settings.dispatch({ type: 'SET_LABEL_SCOPE', payload: { id: labelSettings.id, scope: undefined } });
                render();
            })
        )
        .addButton(btn => btn
            .setButtonText("Delete type")
            .setWarning()
            .onClick(() => {
                if (confirm("Delete this comment type? Existing comments will remain in your notes, but this saved type and its custom formatting will be removed.")) {
                    plugin.settings.dispatch({ type: 'DELETE_GROUP', payload: { id: labelSettings.id } });
                    render();
                }
            })
        );
};
