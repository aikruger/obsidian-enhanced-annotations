import { CommentFormat } from '../../settings/settings-type';

export const cursorPosition = (
    text: string,
    commentType: CommentFormat,
    type?: string,
) => {
    return text.length - (type ? (commentType === 'html' ? 3 : 2) : 0);
};
