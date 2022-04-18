import * as nearAPI from 'near-api-js';

export const getAccount = async (privateKey, accountID) => {
  const keyStore = new nearAPI.keyStores.InMemoryKeyStore();
  const keyPair = nearAPI.KeyPair.fromString(privateKey);

  console.log('keyStore1: ' + keyStore);

  await keyStore.setKey('testnet', accountID, keyPair);

  console.log('keyStore2: ' + keyStore);

  console.log('private key: ', privateKey);

  const config = {
    networkId: 'testnet',
    keyStore,
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://wallet.testnet.near.org',
    helperUrl: 'https://helper.testnet.near.org',
    explorerUrl: 'https://explorer.testnet.near.org',
  };

  const near = await nearAPI.connect(config);
  const account = await near.account(accountID);
  return account;
};
