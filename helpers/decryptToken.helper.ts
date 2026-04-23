async function decryptToken(
  encryptedToken: BufferSource,
  key: CryptoKey,
  iv: Uint8Array,
) {
  const dec = new TextDecoder();

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encryptedToken,
  );

  return dec.decode(new Uint8Array(decrypted));
}

async function getDecryptedToken() {
  try {
    const keyDataString = localStorage.getItem("encryptionKey");
    const ivBase64 = localStorage.getItem("iv");
    const encryptedTokenBase64 = localStorage.getItem("encryptedToken");

    if (!keyDataString || !ivBase64 || !encryptedTokenBase64) {
      console.log("No token found in local storage");
      return;
    }

    const keyData = JSON.parse(keyDataString!);

    if (!keyData || !ivBase64 || !encryptedTokenBase64) {
      console.log("Invalid token data in local storage");
      return;
    }

    // Convert back from base64
    const key = await crypto.subtle.importKey(
      "jwk",
      keyData,
      { name: "AES-GCM" },
      true,
      ["encrypt", "decrypt"],
    );
    const iv = new Uint8Array(
      atob(ivBase64)
        .split("")
        .map((char) => char.charCodeAt(0)),
    );
    const encryptedToken = new Uint8Array(
      atob(encryptedTokenBase64)
        .split("")
        .map((char) => char.charCodeAt(0)),
    );

    const decryptedToken = await decryptToken(encryptedToken, key, iv);
    return decryptedToken;
  } catch (error) {
    console.error("Failed to decrypt token:", error);
    return null;
  }
}

export default getDecryptedToken;
