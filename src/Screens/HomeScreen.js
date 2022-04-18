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
import { deployContract, sendTx } from '../Helpers/Transactions';
import { gql, useMutation } from '@apollo/client';

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
  mutation ConfirmTx($requestId: String, $accountId: String, $phoneNumber: String, $code: String) {
    confirmTx(requestId: $requestId, accountId: $accountId, phoneNumber: $phoneNumber, code: $code)
  }
`;

function HomeScreen({ navigation }) {
  const { accountID, accountDetails, accountBalance, account, publicKey } =
    useAccount();
  const { signOut } = React.useContext(AuthContext);

  const [confirmTx, { data, loading, error }] = useMutation(CONFIRM_TX);
  const [sendSms, { send_data, send_loading, send_error }] = useMutation(SEND_SMS_CODE);
  const [confirmSms, { confirm_data, confirm_loading, confirm_error }] = useMutation(CONFIRM_SMS_CODE);

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
            <Button
              title="Send SMS"
              onPress={async () => {
                await sendSms({
                  variables: {
                    "phoneNumber": "+447429539138",
                  },
                });
              }}
            />
            <Button
              title="Confirm with code"
              onPress={async () => {
                await confirmSms({
                  variables: {
                    "requestId": "1",
                    "accountId": accountID,
                    "phoneNumber": "+447429539138",
                    "code": "576086",
                  },
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
            <Button
              title="Deploy"
              onPress={async () => {
                await deployContract({ account, accountId: accountID });
              }}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

export default HomeScreen;
