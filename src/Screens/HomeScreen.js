import React, { useEffect, useState, useCallback } from 'react';
import {
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as nearAPI from 'near-api-js';
import useAccount from './Hooks/useAccount';
import { resetAllStorage } from '../Helpers/Storage';
import { AuthContext } from '../App';
import { deployContract, sendTx } from '../Helpers/Transactions';
import { gql, useMutation } from '@apollo/client';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button, LoaderScreen } from 'react-native-ui-lib';

const CONFIRM_TX = gql`
  mutation ConfirmTx($requestId: String, $accountId: String) {
    confirmTx(requestId: $requestId, accountId: $accountId)
  }
`;

const SEND_SMS_CODE = gql`
  mutation SendSmsCode($phoneNumber: String) {
    sendSmsCode(phoneNumber: $phoneNumber)
  }
`;

const CONFIRM_SMS_CODE = gql`
  mutation ConfirmTx(
    $requestId: String
    $accountId: String
    $phoneNumber: String
    $code: String
  ) {
    confirmTx(
      requestId: $requestId
      accountId: $accountId
      phoneNumber: $phoneNumber
      code: $code
    )
  }
`;

function HomeScreen({ navigation }) {
  const { accountID, accountDetails, account, publicKey } = useAccount();
  const { signOut } = React.useContext(AuthContext);

  const [accountBalance, setAccountBalance] = useState();
  const [spendLimit, setSpendLimit] = useState();
  const [spendLeft, setSpendLeft] = useState();
  const [loadingBalance, setLoadingBalance] = useState(false);

  const [confirmTx, { data, loading, error }] = useMutation(CONFIRM_TX);

  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    async function updateBalance() {
      setLoadingBalance(true);
      const contract = new nearAPI.Contract(account, accountID, {
        viewMethods: ['get_daily_spend_limit', 'get_daily_spend_amount'],
        sender: accountID,
      });
      const newAccountBalance = await account.getAccountBalance();
      const newSpendLimit = await contract.get_daily_spend_limit();
      const newspendLeft = await contract.get_daily_spend_amount();
      setSpendLimit(newSpendLimit);
      setSpendLeft(newspendLeft);
      setAccountBalance(newAccountBalance);
      setLoadingBalance(false);
    }
    const unsubscribe = navigation.addListener('focus', () => {
      updateBalance();
      console.log('refresh');
    });
    if (!accountBalance) {
      updateBalance();
    }
    console.log('running home screen');
    console.log(
      accountID,
      accountDetails,
      accountBalance,
      account,
      publicKey,
      spendLimit,
      spendLeft,
    );
    return unsubscribe;
  }, [
    accountID,
    accountDetails,
    accountBalance,
    account,
    publicKey,
    spendLimit,
    spendLeft,
    navigation,
  ]);

  return (
    <SafeAreaView flex={1}>
      <StatusBar />
      <View flex={1}>
        {accountID && !loadingBalance && (
          <View>
            <View
              marginTop={'15%'}
              style={{ alignItems: 'center' }}
              marginBottom={'15%'}
            >
              <Text style={styles.mainText}>{accountID}</Text>
              <Text style={styles.balanceUsdText}>
                $
                {(
                  parseFloat(
                    nearAPI.utils.format.formatNearAmount(
                      accountBalance?.available,
                    ),
                  ) * 6
                ).toFixed(2)}
              </Text>
              <Text style={styles.balanceText}>
                {parseFloat(
                  nearAPI.utils.format.formatNearAmount(
                    accountBalance?.available,
                  ),
                ).toFixed(2)}
                {' Ⓝ'}
              </Text>
              <Text style={styles.spendingLimitText}>
                ${parseFloat(spendLimit - spendLeft).toFixed(2)} Spend Remaining
                Today
              </Text>
            </View>
            <View
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
              paddingBottom={'50%'}
            >
              <Button
                label={'Send'}
                backgroundColor={'#56841d'}
                enableShadow={true}
                onPressOut={() => {
                  navigation.navigate('Send', {
                    accountID,
                    accountDetails,
                    accountBalance,
                    account,
                    publicKey,
                    spendLimit,
                    spendLeft,
                  });
                }}
              />
            </View>
            <Button
              size={Button.sizes.xSmall}
              marginL-5
              style={{ maxWidth: '10%' }}
              backgroundColor={'#b30018'}
              label="Reset"
              onPress={async () => {
                await resetAllStorage();
                signOut();
              }}
            />
          </View>
        )}
        {loadingBalance && <LoaderScreen color="black" />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainText: {
    fontSize: 30,
    marginBottom: '7%',
  },
  balanceText: {
    fontSize: 30,
    marginBottom: '10%',
  },
  balanceUsdText: {
    fontSize: 50,
    marginBottom: '2%',
  },
  spendingLimitText: {
    fontSize: 17,
  },
  labelText: {
    fontSize: 15,
  },
  button: {
    shadowColor: 'black',
    shadowOpacity: 0.3,
    shadowRadius: 7,
    shadowOffset: {
      height: 5,
      width: 0,
    },
  },
});

export default HomeScreen;
