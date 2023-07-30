export function removeHtmlEntities(str) {
    return str.replace(/&ldquo;|&rdquo;/g, '');
}