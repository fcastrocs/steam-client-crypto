import Crypto from "crypto";
import ISteamCrypto, { SessionKey } from "../@types";

const SteamPublicKey = Buffer.from(`-----BEGIN PUBLIC KEY-----
MIGdMA0GCSqGSIb3DQEBAQUAA4GLADCBhwKBgQDf7BrWLBBmLBc1OhSwfFkRf53T
2Ct64+AVzRkeRuh7h3SiGEYxqQMUeYKO6UWiSRKpI2hzic9pobFhRr3Bvr/WARvY
gdTckPv+T1JzZsuVcNfFjrocejN1oWI0Rrtgt4Bo+hOneoo3S57G9F1fOpn5nsQ6
6WOiu4gZKODnFMBCiQIBEQ==
-----END PUBLIC KEY-----`);

export default abstract class SteamCrypto implements ISteamCrypto {
  /**
   * Generate a 32-byte symmetric sessionkey and encrypt it with Steam's public "System" key.
   * @param nonce - obtained in channelEncryptResponse when encrypting connection to Steam
   */
  static genSessionKey(nonce: Buffer): SessionKey {
    const sessionKey = Crypto.randomBytes(32);
    const encryptedSessionKey = Crypto.publicEncrypt(SteamPublicKey, Buffer.concat([sessionKey, nonce]));
    return {
      plain: sessionKey,
      encrypted: encryptedSessionKey,
    };
  }

  /**
   * Encrypt data to be sent to Steam
   */
  static encrypt(data: Buffer, key: SessionKey["plain"]): Buffer {
    const IV = this.generateHmacIV(data, key);

    // ECB cipher IV
    const cipherIV = Crypto.createCipheriv("aes-256-ecb", key, null);
    cipherIV.setAutoPadding(false);
    const encryptedIV = Buffer.concat([cipherIV.update(IV), cipherIV.final()]);

    // CBC cipher data
    const cipherData = Crypto.createCipheriv("aes-256-cbc", key, IV);
    const encryptedData = Buffer.concat([cipherData.update(data), cipherData.final()]);

    return Buffer.concat([encryptedIV, encryptedData]);
  }

  /**
   * Decrypt data received from Steam
   */
  static decrypt(data: Buffer, key: SessionKey["plain"]) {
    // decipher IV
    const decipherIV = Crypto.createDecipheriv("aes-256-ecb", key, null);
    decipherIV.setAutoPadding(false);
    const IV = Buffer.concat([decipherIV.update(data.subarray(0, 16)), decipherIV.final()]);

    // decipher data
    const decipherData = Crypto.createDecipheriv("aes-256-cbc", key, IV);
    const decryptedData = Buffer.concat([decipherData.update(data.subarray(16)), decipherData.final()]);

    return decryptedData;
  }

  /**
   * Hash a string or buffer with sha1
   * @returns hashed hex string
   */
  static sha1Hash(input: Buffer | string): string {
    let buffer;

    // convert to buffer
    if (!Buffer.isBuffer(input)) {
      buffer = Buffer.from(input, "utf8");
    } else {
      buffer = input;
    }

    const hash = Crypto.createHash("sha1");
    hash.update(buffer);
    return hash.digest("hex");
  }

  /**
   * IV is [HMAC-SHA1(Random(3) + Plaintext) + Random(3)]. (Same random values for both)
   */
  private static generateHmacIV(data: Buffer, key: SessionKey["plain"]): Buffer {
    // 16 bytes of sessionkey
    const hmacSecret = key.subarray(0, 16);

    const random = Crypto.randomBytes(3);
    const hmac = Crypto.createHmac("sha1", hmacSecret);
    hmac.update(random);
    hmac.update(data);

    // IV must be 16 bytes long, slice 13 bytes and concat random at the end
    return Buffer.concat([hmac.digest().subarray(0, 13), random]);
  }
}
