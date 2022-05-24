import { useEffect, useState } from 'react';
import { getAccount } from '../../Helpers/Account';
import {
  getAccountID,
  getPrivateKey,
  getPublicKey,
} from '../../Helpers/Storage';
import { Contract } from 'near-api-js';

export default function useAccount() {
  const [accountDetails, setAccountDetails] = useState();
  const [accountBalance, setAccountBalance] = useState();
  const [accountID, setAccountID] = useState();
  const [account, setAccount] = useState();
  const [publicKey, setPublicKey] = useState();
  const [spendLimit, setSpendLimit] = useState();
  const [spendLeft, setSpendLeft] = useState();

  console.log('useAccount');

  const retrieveAccount = async () => {
    if (accountDetails) {
      return;
    }
    console.log('retrieveAccount');
    const newAccountID = await getAccountID();
    const privateKey = await getPrivateKey();
    const newPublicKey = await getPublicKey();
    const acct = await getAccount(privateKey, newAccountID);
    const newAccountDetails = await acct.getAccountDetails();
    const newAccountBalance = await acct.getAccountBalance();
    const contract = new Contract(acct, newAccountID, {
      viewMethods: ['get_daily_spend_limit', 'get_daily_spend_amount'],
      sender: acct,
    });
    const newSpendLimit = await contract.get_daily_spend_limit();
    const newspendLeft = await contract.get_daily_spend_amount();
    setSpendLimit(newSpendLimit);
    setSpendLeft(newspendLeft);
    setAccountDetails(newAccountDetails);
    setAccountBalance(newAccountBalance);
    setAccountID(newAccountID);
    setAccount(acct);
    setPublicKey(newPublicKey);
    console.log('run');
  };

  useEffect(() => {
    retrieveAccount();
  });

  return {
    accountID,
    accountDetails,
    accountBalance,
    account,
    publicKey,
    spendLimit,
    spendLeft,
  };
}
