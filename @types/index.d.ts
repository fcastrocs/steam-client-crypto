export interface SessionKey {
  plain: Buffer;
  encrypted: Buffer;
}

export default abstract class SteamCrypto {
  /**
   * Generate a 32-byte symmetric sessionkey and encrypt it with Steam's public "System" key.
   * @param nonce - obtained in channelEncryptResponse when encrypting Steam TCP connection
   */
  static genSessionKey(nonce: Buffer): SessionKey;
  /**
   * Encrypt proto payload to be sent to Steam via TCP
   */
  static encrypt(data: Buffer, key: SessionKey["plain"]): Buffer;
  /**
   * Decrypt proto payload received from Steam via TCP
   */
  static decrypt(data: Buffer, key: SessionKey["plain"]): Buffer;

  /**
   * Compute a crc32 as an unsigned number
   */
  static crc32(str: Buffer): number;
}
