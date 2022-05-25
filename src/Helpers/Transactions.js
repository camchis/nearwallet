//const { utils, transactions, Contract } = require('near-api-js');
const {
  connect,
  Contract,
  KeyPair,
  keyStores,
  WalletConnection,
  utils,
  providers,
  transactions,
} = require('near-api-js');

export async function sendTx({ account, contract, toUser, amount }) {
  try {
    const args = {
      request: {
        receiver_id: toUser,
        actions: [{ type: 'Transfer', amount }],
      },
    };
    let tx = await account.signAndSendTransaction({
      receiverId: contract,
      actions: [
        transactions.functionCall(
          'add_request_and_confirm',
          Buffer.from(JSON.stringify(args)),
          50000000000000,
          '0',
        ),
      ],
    });
    console.log(tx);
    return tx;
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function getTxStatus(txHash, accountId) {
  const provider = new providers.JsonRpcProvider(
    'https://archival-rpc.testnet.near.org',
  );
  const result = await provider.txStatus(txHash, accountId);
  console.log(result);
  return result;
}
