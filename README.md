# steam-client-crypto

A Node.js module that implements crypto used in the Steam client. Mainly TCP connection encryption handshake, and payload encryption/decryption. Also, password RSA encryption. It is used here https://github.com/fcastrocs/steam-client

## Installation

```sh
npm i @fcastrocs/steam-client-crypto
```

## Usage

```javascript
import SteamCrypto from "@fcastrocs/steam-client-crypto";

const sessionKey = SteamCrypto.genSessionKey(buffer);
...
```

## Abstract Class: SteamCrypto

### interface

```javascript
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

  /**
   * Encrypt password with RSA
   */
  static rsaEncrypt(password: string, publicKeyMod: string, publicKeyExp: string): string;
}
```
