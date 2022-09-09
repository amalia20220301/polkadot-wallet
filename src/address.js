const { encodeAddress, hdLedger } = require('@polkadot/util-crypto');

const words="kidney prosper snack glance stick piece chronic tape bachelor drama net cradle";
const accountIndex=0
const polkadot=354
const addressIndex=0
const pair = hdLedger(words, `m/44'/354'/${accountIndex}'/0'/${addressIndex}'`);
console.log(Buffer.from(pair.publicKey).toString('hex'))
console.log('\taddress (DOT)\t', encodeAddress(pair.publicKey, 0));
