//const { utils, transactions, Contract } = require('near-api-js');
const {
  connect,
  Contract,
  KeyPair,
  keyStores,
  WalletConnection,
  utils,
  transactions,
} = require('near-api-js');

export async function sendTx({ account, contract, toUser, amount }) {
  try {
    const args = {
      request: {
        receiver_id: 'pochi.testnet',
        actions: [
          { type: 'Transfer', amount: utils.format.parseNearAmount('1') },
        ],
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
  } catch (error) {
    console.log(error);
  }
}
