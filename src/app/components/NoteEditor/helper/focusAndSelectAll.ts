export default function focusAndSelectAll(div: HTMLDivElement) {
    div.focus();
    const range = document.createRange();
    range.selectNodeContents(div); // select all content
    const sel = window.getSelection();
    if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
    }
}
