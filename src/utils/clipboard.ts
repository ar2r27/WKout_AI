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

  // 2. Visible-in-viewport fallback for HTTP / non-secure contexts (e.g. OMV Docker)
  // Elements with left: -9999px are blocked by Chrome/Safari security checks.
  // Placing a 10px element inside viewport with opacity 0.01 passes the visibility checks.
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '10px';
    textArea.style.height = '10px';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.style.color = 'transparent';
    textArea.style.opacity = '0.01';
    textArea.style.zIndex = '-999';
    textArea.style.fontSize = '16px'; // Prevents auto-zoom on iOS
    textArea.setAttribute('readonly', '');

    document.body.appendChild(textArea);
    textArea.focus({ preventScroll: true });
    textArea.select();
    textArea.setSelectionRange(0, text.length);

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    if (successful) return true;
  } catch (err) {
    console.warn('Universal copy fallback failed:', err);
  }

  // 3. Last-resort fallback for stubborn mobile/HTTP environments
  try {
    if (typeof window !== 'undefined') {
      window.prompt('Skopiuj treść wiadomości (Ctrl+C / Cmd+C):', text);
      return true;
    }
  } catch (_) {}

  return false;
}
