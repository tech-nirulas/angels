import assert from 'node:assert';
import * as crypto from 'node:crypto';
import { computeClientConfigHash, md5 } from '../utils/cartHash.ts';

function nodeBackendComputeConfigurationHash(
  productId: string,
  variantId?: string | null,
  modifierOptionIds?: string[] | null
): string {
  const cleanVariantId = variantId && variantId.trim() ? variantId.trim() : null;
  const cleanOptions = (modifierOptionIds || []).filter(Boolean).sort();

  if (!cleanVariantId && cleanOptions.length === 0) {
    return productId;
  }

  const hashPayload = `${productId}:${cleanVariantId || ''}:${cleanOptions.join(',')}`;
  return crypto.createHash('md5').update(hashPayload).digest('hex');
}

// 1. Returns productId when variantId and modifierOptionIds are missing or empty
assert.strictEqual(computeClientConfigHash('prod-123'), 'prod-123');
assert.strictEqual(computeClientConfigHash('prod-123', null, []), 'prod-123');
assert.strictEqual(computeClientConfigHash('prod-123', '', []), 'prod-123');
assert.strictEqual(computeClientConfigHash('prod-123', '   ', []), 'prod-123');

// 2. Matches Node backend MD5 hash when a variantId is supplied
const prod1 = 'prod-cake-1';
const var500 = 'var-500g';
const expectedVariantHash = nodeBackendComputeConfigurationHash(prod1, var500, []);
assert.strictEqual(computeClientConfigHash(prod1, var500, []), expectedVariantHash);

// 3. Matches Node backend MD5 hash with modifiers
const var1kg = 'var-1kg';
const modifiers = ['opt-eggless', 'opt-candle'];
const expectedModHash = nodeBackendComputeConfigurationHash(prod1, var1kg, modifiers);
assert.strictEqual(computeClientConfigHash(prod1, var1kg, modifiers), expectedModHash);

// 4. Sorts modifier options identically regardless of input order
const hashA = computeClientConfigHash(prod1, var500, ['opt-z', 'opt-a']);
const hashB = computeClientConfigHash(prod1, var500, ['opt-a', 'opt-z']);
assert.strictEqual(hashA, hashB);
assert.strictEqual(hashA, nodeBackendComputeConfigurationHash(prod1, var500, ['opt-a', 'opt-z']));

// 5. Handles modifiers without a variant
const expectedNoVarWithMods = nodeBackendComputeConfigurationHash(prod1, null, ['opt-eggless']);
assert.strictEqual(computeClientConfigHash(prod1, null, ['opt-eggless']), expectedNoVarWithMods);

console.log('✅ All cart configuration hash tests passed successfully!');
