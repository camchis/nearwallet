import bip39 from 'react-native-bip39';
import { derivePath } from 'near-hd-key';
import nacl from 'tweetnacl';
import * as bs58 from 'bs58';
import { KeyPair } from './key_pair';
const PATH = "m/44'/397'/0'";

export async function generateMnemonic() {
  const mnemonic = await bip39.generateMnemonic();
  return parseSeedPhrase(mnemonic);
}

export function normalizeSeedPhrase(seedPhrase) {
  // eslint-disable-next-line prettier/prettier
  return seedPhrase.trim().split(/\s+/).map(part => part.toLowerCase()).join(' ');
}

// export function parseSeedPhrase(seedPhrase, derivationPath) {
//   const normalize = normalizeSeedPhrase(seedPhrase);
//   const seed = bip39.mnemonicToSeed(normalize);
//   const {key} = derivePath(derivationPath || PATH, seed.toString('hex'));
//   const keyPair = nacl.sign.keyPair.fromSeed(key);
//   const publicKey = bs58.encode(Buffer.from(keyPair.publicKey));
//   const privateKey = bs58.encode(Buffer.from(keyPair.secretKey));
//   return {seedPhrase, publicKey, privateKey};
// }

export function parseSeedPhrase(seedPhrase, derivationPath) {
  const normalize = normalizeSeedPhrase(seedPhrase);
  const seed = bip39.mnemonicToSeed(normalize);
  const { key } = derivePath(derivationPath || PATH, seed.toString('hex'));
  const keyPair = nacl.sign.keyPair.fromSeed(key);
  const publicKey = 'ed25519:' + bs58.encode(Buffer.from(keyPair.publicKey));
  const privateKey = bs58.encode(Buffer.from(keyPair.secretKey));
  console.log(publicKey);
  console.log(privateKey);
  console.log(seedPhrase);
  return { seedPhrase, publicKey, privateKey };
}

// export function generateNearKeyPair(seedPhrase, derivationPath) {
//   const seed = bip39.mnemonicToSeed(normalizeSeedPhrase(seedPhrase));
//   const {key} = derivePath(derivationPath || PATH, seed.toString('hex'));
//   const keyPair = nacl.sign.keyPair.fromSeed(key);
//   const secretKey = 'ed25519:' + bs58.encode(Buffer.from(keyPair.secretKey));
//   const keys = KeyPair.fromString(secretKey);
//   const privateKey = bs58.encode(Buffer.from(keys.secretKey));
//   console.log(privateKey);
//   return {seedPhrase, privateKey};
// }
