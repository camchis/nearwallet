const { utils, transactions, Contract } = require('near-api-js');

export async function sendTx({ account, contract, toUser, amount }) {
  try {
    const args = {"request": {"receiver_id": "cameronchis.testnet", "actions": [{"type": "Transfer", "amount": "100000000"}]}}
    let tx = await account.signAndSendTransaction({
      receiverId: contract,
      actions: [
        transactions.functionCall(
          'add_request_and_confirm',
          Buffer.from(JSON.stringify(args)),
          10000000000000,
          '0',
        ),
      ],
    });
    console.log(tx);
  } catch (error) {
    console.log(error);
  }
}
