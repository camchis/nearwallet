import { useEffect, useState } from 'react';
import { getAccount } from '../../Helpers/Account';
import { getAccountID, getPrivateKey } from '../../Helpers/Storage';

export default function useAccount() {
  const [accountDetails, setAccountDetails] = useState();
  const [accountBalance, setAccountBalance] = useState();
  const [accountID, setAccountID] = useState();
  const [account, setAccount] = useState();

  console.log('useAccount');

  const retrieveAccount = async () => {
    if (accountDetails) {
      return;
    }
    console.log('retrieveAccount');
    const newAccountID = await getAccountID();
    const privateKey = await getPrivateKey();
    const acct = await getAccount(privateKey, newAccountID);
    const newAccountDetails = await acct.getAccountDetails();
    const newAccountBalance = await acct.getAccountBalance();
    setAccountDetails(newAccountDetails);
    setAccountBalance(newAccountBalance);
    setAccountID(newAccountID);
    setAccount(acct);
  };

  useEffect(() => {
    retrieveAccount();
  });

  return { accountID, accountDetails, accountBalance, account };
}
