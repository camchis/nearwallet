import React, { useEffect, useState, useCallback } from 'react';
import {
  Button,
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
  const {
    accountID,
    accountDetails,
    accountBalance,
    account,
    publicKey,
    spendLimit,
    spendLeft,
  } = useAccount();
  const { signOut } = React.useContext(AuthContext);

  const [confirmTx, { data, loading, error }] = useMutation(CONFIRM_TX);
  const [sendSms, { send_data, send_loading, send_error }] = useMutation(SEND_SMS_CODE);
  const [confirmSms, { confirm_data, confirm_loading, confirm_error }] = useMutation(CONFIRM_SMS_CODE);

  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    console.log(
      accountID,
      accountDetails,
      accountBalance,
      account,
      publicKey,
      spendLimit,
      spendLeft,
    );
  }, [
    accountID,
    accountDetails,
    accountBalance,
    account,
    publicKey,
    spendLimit,
    spendLeft,
  ]);

  return (
    <SafeAreaView flex={1}>
      <StatusBar />
      <View flex={1}>
        {accountID && (
          <View>
            <View
              marginTop={'30%'}
              style={{ alignItems: 'center' }}
              marginBottom={'25%'}
            >
              <Text style={styles.mainText}>{accountID}</Text>
              <Text style={styles.balanceText}>
                {parseFloat(
                  nearAPI.utils.format.formatNearAmount(
                    accountBalance.available,
                  ),
                ).toFixed(2)}
                {' Ⓝ'}
              </Text>
              <Text style={styles.spendingLimitText}>${parseInt(spendLimit - spendLeft).toFixed(2)} Spend Remaining</Text>
            </View>
            <View
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
            >
              <Pressable
                alignItems="center"
                onPressIn={() => {
                  setOpacity(0.5);
                }}
                onPressOut={() => {
                  setOpacity(1);
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
                opacity={opacity}
              >
                <Icon name="send-circle-outline" size={80} color="#56841d" style={styles.button}/>
              </Pressable>
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
            </View>
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
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainText: {
    fontSize: 30,
    marginBottom: '5%',
  },
  balanceText: {
    fontSize: 50,
    marginBottom: '5%',
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
