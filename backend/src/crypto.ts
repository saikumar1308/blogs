// Web Crypto SHA-256 with salt helper, fully compatible with Cloudflare Workers / Edge runtime

export async function hashPassword(password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
    
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );

    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256",
        },
        keyMaterial,
        256
    );

    const hashArray = Array.from(new Uint8Array(derivedBits));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return `${saltHex}:${hashHex}`;
}

function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;

    let diff = 0;
    for (let index = 0; index < a.length; index += 1) {
        diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
    }

    return diff === 0;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    // Legacy support for plain-text passwords during migration
    if (!storedHash.includes(':')) {
        return timingSafeEqual(password, storedHash);
    }

    const [saltHex, originalHashHex] = storedHash.split(':');
    if (!saltHex || !originalHashHex) return false;

    const salt = new Uint8Array(
        saltHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
    );

    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );

    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256",
        },
        keyMaterial,
        256
    );

    const hashArray = Array.from(new Uint8Array(derivedBits));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return timingSafeEqual(hashHex, originalHashHex);
}
