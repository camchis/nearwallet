export async function sendTx({ account, toUser, amount }) {
  try {
    await account.sendMoney(toUser, amount);
  } catch (error) {
    console.log(error);
  }
}
