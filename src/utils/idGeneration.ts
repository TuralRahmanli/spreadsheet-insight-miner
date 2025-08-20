// Deterministic and secure ID generation utilities

/**
 * Generate a secure random ID using crypto.randomUUID when available
 * Falls back to timestamp + random for older browsers
 */
export function generateSecureId(prefix: string = ''): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    const uuid = crypto.randomUUID();
    return prefix ? `${prefix}-${uuid}` : uuid;
  }
  
  // Fallback for older browsers
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 9);
  const id = `${timestamp}-${randomPart}`;
  
  return prefix ? `${prefix}-${id}` : id;
}

/**
 * Generate a short ID for UI elements (non-cryptographic)
 */
export function generateShortId(prefix: string = ''): string {
  const id = Math.random().toString(36).substr(2, 8);
  return prefix ? `${prefix}-${id}` : id;
}

/**
 * Generate deterministic ID based on content hash
 */
export function generateContentId(content: string, prefix: string = ''): string {
  // Simple hash function for deterministic IDs
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const id = Math.abs(hash).toString(36);
  return prefix ? `${prefix}-${id}` : id;
}

/**
 * Generate timestamp-based ID (for sorting)
 */
export function generateTimestampId(prefix: string = ''): string {
  const timestamp = new Date().toISOString().replace(/[:-]/g, '').replace(/\./g, '');
  return prefix ? `${prefix}-${timestamp}` : timestamp;
}

/**
 * Validate ID format
 */
export function isValidId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  
  // Basic validation: should be non-empty string with valid characters
  return /^[a-zA-Z0-9_-]+$/.test(id) && id.length >= 3;
}

/**
 * Extract prefix from ID
 */
export function extractPrefix(id: string): string | null {
  const parts = id.split('-');
  return parts.length > 1 ? parts[0] : null;
}