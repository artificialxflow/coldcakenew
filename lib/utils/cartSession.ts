/**
 * Get or create cart session ID
 * This should be called from client-side code
 */
export function getCartSessionId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  let sessionId = document.cookie
    .split('; ')
    .find((row) => row.startsWith('cart_session_id='))
    ?.split('=')[1];

  if (!sessionId) {
    sessionId = `cart_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    // Set cookie for 1 year
    document.cookie = `cart_session_id=${sessionId}; path=/; max-age=31536000; SameSite=Lax`;
  }

  return sessionId;
}
