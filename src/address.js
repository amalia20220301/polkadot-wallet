import {getMasterKeyFromSeed, getPublicKey} from "ed25519-hd-key";
import {encodeAddress, hdLedger} from '@polkadot/util-crypto';
import { ripemd160 } from '@noble/hashes/ripemd160';
import {HDKey} from "@scure/bip32";
import * as bip39 from 'bip39';
import * as dotenv from 'dotenv'
import {sha256} from "@noble/hashes/sha256";
dotenv.config()

export const getLedgerAddress=(words)=>{
    const accountIndex = 0
    const polkadot = 354
    const addressIndex = 0
    const pair = hdLedger(words, `m/44'/${polkadot}'/${accountIndex}'/0'/${addressIndex}'`);
    console.log(Buffer.from(pair.publicKey).toString('hex'))
    console.log('\taddress (DOT)\t', encodeAddress(pair.publicKey, 0));
}

// getLedgerAddress(words)

const getFingerprint = (publicKey) => {
    return Buffer.from(ripemd160(sha256(publicKey))).readUInt32BE(0);
}

export const getMFP= (words)=>{
    console.log({words})
    const seed = bip39.mnemonicToSeedSync(words)
    const node = HDKey.fromMasterSeed(Buffer.from(seed));
    // 直接可以获取master fingerprint
    console.log(node.fingerprint.toString('16'))
    console.log(node.publicKey.toString())
    // console.log(node.publicKey.slice(2).toString())
    return getFingerprint(node.publicKey)
}

console.log(getMFP(process.env.kidney).toString(16))