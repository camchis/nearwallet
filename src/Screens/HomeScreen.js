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
  const { accountID, accountDetails, accountBalance, account } = useAccount();
  const { signOut } = React.useContext(AuthContext);

  useEffect(() => {
    console.log(accountID, accountDetails, accountBalance, account);
  }, [accountID, accountDetails, accountBalance, account]);

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
                  toUser: 'unitesting1.testnet',
                  amount: nearAPI.utils.format.parseNearAmount('100'),
                });
              }}
            />
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
