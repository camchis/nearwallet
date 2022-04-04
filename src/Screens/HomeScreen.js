import React, { useEffect, useState, useCallback } from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import * as nearAPI from 'near-api-js';
import useAccount from './Hooks/useAccount';
import { resetAllStorage } from '../Helpers/Storage';
import { AuthContext } from '../App';
import { sendTx } from '../Helpers/Transactions';

function HomeScreen({ navigation }) {
  const { accountID, accountDetails, accountBalance, account, publicKey } =
    useAccount();
  const { signOut } = React.useContext(AuthContext);

  useEffect(() => {
    console.log(accountID, accountDetails, accountBalance, account, publicKey);
  }, [accountID, accountDetails, accountBalance, account, publicKey]);

  return (
    <SafeAreaView>
      <StatusBar />
      <View>
        {accountID && (
          <>
            <Text>{accountID}</Text>
            <Text>
              {'Balance: '}
              {parseFloat(
                nearAPI.utils.format.formatNearAmount(accountBalance.available),
              ).toFixed(2)}
            </Text>
            <Button
              title="Send"
              onPress={async () => {
                await sendTx({
                  account,
                  contract: accountID,
                  toUser: 'cameronchis.testnet',
                  amount: nearAPI.utils.format.parseNearAmount('1'),
                });
              }}
            />
            {/* <Button
              title="Deploy smart contract"
              onPress={async () => {
                await deploySmartContract({ accountID, publicKey, account });
              }}
            /> */}
            <Button
              title="Reset"
              onPress={async () => {
                await resetAllStorage();
                signOut();
              }}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

export default HomeScreen;
