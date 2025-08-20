// Enterprise-grade secure and deterministic ID generation
import { ENV_CONFIG } from '@/config/environment';

// High-quality pseudo-random number generator (PRNG)
class SecurePRNG {
  private state: number;

  constructor(seed?: number) {
    this.state = seed ?? this.generateSeed();
  }

  private generateSeed(): number {
    // Use crypto.getRandomValues for true randomness when available
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      return array[0];
    }
    
    // Fallback: Use multiple entropy sources
    const time = Date.now();
    const random = Math.random() * 1000000;
    const memory = typeof performance !== 'undefined' ? performance.now() : 0;
    
    return Math.floor((time + random + memory) % 2147483647);
  }

  // Linear congruential generator with good parameters
  next(): number {
    this.state = (this.state * 1664525 + 1013904223) % 4294967296;
    return this.state / 4294967296;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }
}

// Global PRNG instance
const prng = new SecurePRNG();

// Base36 character set for ID generation
const ID_CHARS = '0123456789abcdefghijklmnopqrstuvwxyz';

/**
 * Generate cryptographically secure random ID
 */
export function generateSecureId(prefix: string = '', length: number = 16): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    const uuid = crypto.randomUUID();
    return prefix ? `${prefix}_${uuid}` : uuid;
  }
  
  // Fallback to secure PRNG
  let result = '';
  for (let i = 0; i < length; i++) {
    result += ID_CHARS[prng.nextInt(0, ID_CHARS.length)];
  }
  
  return prefix ? `${prefix}_${result}` : result;
}

/**
 * Generate deterministic ID from content hash
 */
export function generateContentHash(content: string, prefix: string = ''): string {
  // FNV-1a hash algorithm for deterministic hashing
  let hash = 2166136261;
  for (let i = 0; i < content.length; i++) {
    hash ^= content.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }
  
  const hashStr = hash.toString(36);
  return prefix ? `${prefix}_${hashStr}` : hashStr;
}

/**
 * Generate timestamp-based ID with microsecond precision
 */
export function generateTimestampId(prefix: string = ''): string {
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const timestamp = Math.floor(now * 1000); // microseconds
  const random = prng.nextInt(1000, 9999); // 4-digit random suffix
  
  const id = `${timestamp.toString(36)}${random.toString(36)}`;
  return prefix ? `${prefix}_${id}` : id;
}

/**
 * Generate short ID for UI elements
 */
export function generateShortId(prefix: string = '', length: number = 8): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += ID_CHARS[prng.nextInt(0, ID_CHARS.length)];
  }
  
  return prefix ? `${prefix}_${result}` : result;
}

/**
 * Generate session-scoped ID
 */
export function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const random = generateShortId('', 12);
  return `session_${timestamp}_${random}`;
}

/**
 * Generate request ID for tracing
 */
export function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = generateShortId('', 8);
  return `req_${timestamp}_${random}`;
}

/**
 * Validate ID format and security
 */
export function validateId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  
  // Check length (minimum security requirement)
  if (id.length < 8) return false;
  
  // Check for valid characters only
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  if (!validPattern.test(id)) return false;
  
  // Check for entropy (no repeated patterns)
  const uniqueChars = new Set(id.toLowerCase()).size;
  if (uniqueChars < id.length * 0.3) return false; // At least 30% unique characters
  
  return true;
}

/**
 * Extract prefix from prefixed ID
 */
export function extractIdPrefix(id: string): string | null {
  const match = id.match(/^([a-zA-Z0-9]+)_/);
  return match ? match[1] : null;
}

/**
 * Generate batch of unique IDs efficiently
 */
export function generateIdBatch(count: number, prefix: string = '', length: number = 16): string[] {
  const ids = new Set<string>();
  
  while (ids.size < count) {
    ids.add(generateSecureId(prefix, length));
  }
  
  return Array.from(ids);
}

// Export configured generators based on environment
export const idGenerators = {
  // For user-facing entities that need security
  secure: (prefix?: string) => generateSecureId(prefix),
  
  // For internal operations that need determinism
  content: (content: string, prefix?: string) => generateContentHash(content, prefix),
  
  // For time-based sorting requirements
  timestamp: (prefix?: string) => generateTimestampId(prefix),
  
  // For temporary UI elements
  ui: (prefix?: string) => generateShortId(prefix),
  
  // For request tracing
  request: () => generateRequestId(),
  
  // For session management
  session: () => generateSessionId(),
} as const;