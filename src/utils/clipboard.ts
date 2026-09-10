/**
 * Universal clipboard copy utility supporting both Secure Context (HTTPS)
 * and Non-Secure Contexts (e.g. HTTP on local network / OpenMediaVault Docker)
 * as well as iOS Safari, Android, and desktop browsers.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  // 1. Try modern Async Clipboard API if available in secure context
  if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard.writeText failed, falling back:', err);
    }
  }

  // 2. Battle-tested fallback for HTTP / non-secure contexts / iOS Safari / Android
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    // Position off-screen but keep within render tree
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '-9999px';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.style.fontSize = '16px'; // Prevents auto-zoom on iOS
    textArea.setAttribute('readonly', '');

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, text.length);

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Universal copy fallback failed:', err);
    return false;
  }
}
