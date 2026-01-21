/**
 * Generate Venmo payment deep link
 * Opens Venmo app with prefilled recipient
 * @param handle - Venmo username (with or without @)
 * @param amount - Optional amount in dollars
 * @param note - Optional payment note
 */
export function generateVenmoLink(
  handle: string,
  amount?: number,
  note?: string
): string {
  // Remove @ prefix if present
  const cleanHandle = handle.startsWith('@') ? handle.slice(1) : handle;
  let url = `https://venmo.com/${cleanHandle}`;
  if (amount) {
    url += `/${amount}`;
  }
  if (note) {
    url += `?txn=pay&note=${encodeURIComponent(note)}`;
  }
  return url;
}

/**
 * Generate CashApp payment deep link
 * Opens CashApp with prefilled recipient
 * @param cashtag - CashApp $cashtag (with or without $)
 * @param amount - Optional amount in dollars
 */
export function generateCashAppLink(
  cashtag: string,
  amount?: number
): string {
  // Ensure $ prefix
  const cleanTag = cashtag.startsWith('$') ? cashtag : `$${cashtag}`;
  let url = `https://cash.app/${cleanTag}`;
  if (amount) {
    url += `/${amount}`;
  }
  return url;
}

/**
 * Zelle has no universal deep link - returns null
 * Display Zelle info with instructions to use bank app
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function generateZelleLink(email: string): null {
  // Zelle is bank-integrated only, no deep link available
  // Email parameter kept for API consistency with other payment link generators
  return null;
}
