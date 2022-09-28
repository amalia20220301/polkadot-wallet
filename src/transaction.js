import { ApiPromise, WsProvider } from '@polkadot/api';
import {getKeyPair} from "./address.js";
import { hexToU8a, u8aToHex } from '@polkadot/util'
import nacl from 'tweetnacl';
import {decodeAddress} from "@polkadot/util-crypto";

const network='westend'
const sender='5DPTrxKSNBYqJ4Jy4Yex5go8tKomGGzQX9tszt7ReJv6qKT1'
//https://github.com/polkadot-js/api/issues/1421#issuecomment-540545590
const getApi = async () => {
    const provider = new WsProvider(`wss://${network}-rpc.polkadot.io/`);
    const api =  ApiPromise.create({ provider });
    console.log((await api).genesisHash.toHex())
    return api;
};
const keyPair = getKeyPair(process.env.kidney, 1);

const generateTransactionPayload = async (to, amount) => {
    const api = await getApi();
    // fetch last signed block and account address
    const [signedBlock, address] = await Promise.all([
        api.rpc.chain.getBlock(),
        sender,
    ]);
    // create signer options
    const nonce = (await api.derive.balances.account(address)).accountNonce;
    const signerOptions = {
        blockHash: signedBlock.block.header.hash,
        era: api.createType('ExtrinsicEra', {
            current: signedBlock.block.header.number,
            period: 50,
        }),
        nonce,
    };
    const transaction = api.tx.balances.transfer(to, amount);
    //create the payload
    const signerPayload = api.createType('SignerPayload', {
        genesisHash: api.genesisHash,
        runtimeVersion: api.runtimeVersion,
        version: api.extrinsicVersion,
        ...signerOptions,
        address: to,
        blockNumber: signedBlock.block.header.number,
        method: transaction.method,
        signedExtensions: [],
        transactionVersion: transaction.version,
    });
    return {
        payload: signerPayload.toPayload(),
        tx: transaction,
    };
};


export const signTransaction = async ()=>{
    const convertedAmount = BigInt('100000');
    const api = await getApi();
    const { tx, payload } = await generateTransactionPayload(
        '5DVHh78wx4FcWYBtBsEdBEy8Vydk3DrGcd7scpMVDGM1Y4Ro',
        convertedAmount.toString(),
    );
    console.log('-----tx,payload----------');
    console.log({tx, payload});
    console.log('---------------');

    const signable = api.createType('ExtrinsicPayload', payload, { version: payload.version })
    const { signature } = signable.sign({
        address: sender,
        addressRaw: decodeAddress(sender),
        publicKey: hexToU8a(keyPair.publicKey),
        sign: (data, options) => {
            return nacl.sign.detached(data, hexToU8a(keyPair.secretKey))
        }
    });
    console.log('---------------');
    console.log(signature);
    console.log('---------------');
    const verifyData = signable.toU8a(true);
    console.log('-------verify--------');
    console.log(nacl.sign.detached.verify(
        verifyData,
        hexToU8a(signature),
        decodeAddress(sender),
    ))
    // const signedBytes = nacl.sign.detached(hexToU8a(extrinsicPayload.toJSON()), hexToU8a(keyPair.secretKey))
    // const signature = u8aToHex(signedBytes)
    // console.log('-----signature----------');
    // console.log(signature);
    // console.log('---------------');
    // tx.addSignature(sender,signature,payload)
}

signTransaction().then(console.log)
