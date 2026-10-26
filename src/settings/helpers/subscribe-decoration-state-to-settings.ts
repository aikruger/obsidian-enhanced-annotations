import LabeledAnnotations from '../../main';

export const subscribeDecorationStateToSettings = (
    plugin: LabeledAnnotations,
) => {
    const settings = plugin.settings;
    const previousValue = {
        current: '',
    };
    return settings.subscribe((value) => {
        const styles = value.decoration.styles;
        const stylesStr = JSON.stringify(styles);
        if (stylesStr !== previousValue.current) {
            previousValue.current = stylesStr;
            plugin.decorationSettings.setSettings(value.decoration.styles);
            console.info("[CommentFormatting] Editor decorations refreshed");
        }
    });
};
