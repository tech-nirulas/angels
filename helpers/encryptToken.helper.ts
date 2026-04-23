// Generate encryption key
export async function generateKey() {
  return await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// Encrypt token
export async function encryptToken(key: CryptoKey, token?: string) {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(token)
  );

  return { iv, encryptedToken: new Uint8Array(encrypted) };
}

// Save encrypted token to storage
export async function saveEncryptedToken(token?: string) {
  const key = await generateKey();
  const { iv, encryptedToken } = await encryptToken(key, token);

  const ivBase64 = btoa(String.fromCharCode(...iv));
  const encryptedTokenBase64 = btoa(String.fromCharCode(...encryptedToken));

  localStorage.setItem('encryptionKey', JSON.stringify(await crypto.subtle.exportKey('jwk', key)));
  localStorage.setItem('iv', ivBase64);
  localStorage.setItem('encryptedToken', encryptedTokenBase64);
}
