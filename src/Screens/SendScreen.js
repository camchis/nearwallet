import React, { useEffect, useState, useCallback } from 'react';
import {
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TextInput,
} from 'react-native';
import { Button, Incubator, LoaderScreen } from 'react-native-ui-lib';
const { TextField } = Incubator;
import * as nearAPI from 'near-api-js';
import useAccount from './Hooks/useAccount';
import { resetAllStorage } from '../Helpers/Storage';
import { AuthContext } from '../App';
import { getTxStatus, sendTx } from '../Helpers/Transactions';
import { gql, useMutation } from '@apollo/client';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ReactNativeBiometrics from 'react-native-biometrics';

// sms API calls
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

function SendScreen({ route, navigation }) {
  const { account, accountBalance, accountID, spendLeft, spendLimit } =
    route.params;
  const [amountNumber, onChangeAmountNumber] = React.useState('');
  const [address, onChangeAddressText] = React.useState('');
  const [code, onChangeCode] = React.useState('');

  const [error, setError] = React.useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [success, setSuccess] = useState(false);

  const readableBalance = parseFloat(
    nearAPI.utils.format.formatNearAmount(accountBalance.available),
  ).toFixed(2);

  const [sendSms, { send_data, send_loading, send_error }] =
    useMutation(SEND_SMS_CODE);
  const [confirmSms, { loading: confirm_loading, data: confirm_data }] =
    useMutation(CONFIRM_SMS_CODE);

  useEffect(() => {
    if (amountNumber) {
      const amount = (parseFloat(amountNumber) / 6).toFixed(2);
      if (parseInt(amount) > parseInt(readableBalance)) {
        setError(true);
      } else {
        setError(false);
      }
    } else {
      setError(true);
    }
  }, [amountNumber, confirm_data, confirm_loading, readableBalance]);

  function renderTrailingText() {
    if (amountNumber) {
      const amount = (parseFloat(amountNumber) / 6).toFixed(2);
      if (parseInt(amount) > parseInt(readableBalance)) {
        return <Text style={styles.nearTextRed}>≈ {amount} Ⓝ</Text>;
      } else {
        console.log(amount);
        return <Text style={styles.nearText}>≈ {amount} Ⓝ</Text>;
      }
    } else {
      return <Text style={styles.nearText}>0 Ⓝ</Text>;
    }
  }

  async function handleSendTx() {
    const sendAmount = parseFloat(amountNumber) / 6;
    setSending(true);
    const response = await sendTx({
      account,
      contract: accountID,
      toUser: address,
      amount: nearAPI.utils.format.parseNearAmount(sendAmount.toString()),
    });
    ReactNativeBiometrics.simplePrompt({ promptMessage: 'Confirm Face ID' })
      .then(async resultObject => {
        const { success } = resultObject;

        if (success) {
          console.log('successful biometrics provided');
          setSent(true);
          setSending(false);
          await sendSms({
            variables: {
              phoneNumber: '+447429539138',
            },
          });
        } else {
          console.log('user cancelled biometric prompt');
        }
      })
      .catch(() => {
        console.log('biometrics failed');
      });
  }

  async function handleConfirmTx() {
    setConfirming(true);
    const contract = new nearAPI.Contract(account, accountID, {
      viewMethods: ['list_request_ids'],
      sender: accountID,
    });
    const request_ids = await contract.list_request_ids();
    const response = await confirmSms({
      variables: {
        requestId: request_ids[0].toString(),
        accountId: accountID,
        phoneNumber: '+447429539138',
        code: code,
      },
    });
    console.log(response);
    console.log(response.data?.confirmTx);
    if (response.data?.confirmTx === 'Success') {
      setSuccess(true);
      setConfirmed(true);
      setConfirming(false);
    } else {
      setSuccess(false);
      setConfirmed(true);
      setConfirming(false);
    }
  }

  return (
    <SafeAreaView flex={1} backgroundColor="white">
      <StatusBar />
      <View flexDirection={'row'} marginBottom={'10%'} paddingHorizontal={10}>
        <Pressable
          onPressOut={() => {
            navigation.goBack();
          }}
        >
          <Icon
            name="arrow-back-ios"
            size={38}
            color="black"
            style={styles.button}
          />
        </Pressable>
        <Text style={styles.header}>Send</Text>
      </View>
      {!sending && !sent && (
        <>
          <View
            marginBottom={'5%'}
            paddingHorizontal={10}
            flexDirection={'row'}
            justifyContent={'space-between'}
          >
            <Text style={styles.balanceText}>
              Balance: {readableBalance}
              {' Ⓝ'}
            </Text>
            <Text style={styles.spendText}>
              ${parseFloat(spendLimit - spendLeft).toFixed(2)} spend remaining
            </Text>
          </View>
          <View>
            <TextField
              style={styles.addressInput}
              placeholder="Address"
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={onChangeAddressText}
            />
            <TextField
              style={styles.amountInput}
              placeholder="Amount"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="decimal-pad"
              onChangeText={onChangeAmountNumber}
              leadingAccessory={<Text style={styles.dollarSign}>$</Text>}
              trailingAccessory={renderTrailingText()}
            />
          </View>
          <View
            alignSelf={'center'}
            alignItems={'center'}
            maxWidth={'50%'}
            marginTop={'15%'}
          >
            <Button
              marginTop={50}
              backgroundColor={'#56841d'}
              enableShadow={true}
              label={'Send'}
              disabled={error}
              onPressOut={async () => await handleSendTx()}
            />
          </View>
        </>
      )}
      {sending && (
        <LoaderScreen message={'Initialising transaction...'} color="black" />
      )}
      {sent && !confirming && !confirmed && (
        <View marginTop={10} alignItems={'center'}>
          <Text style={styles.pendingText}>Confirm Transaction </Text>
          <Text style={styles.pendingTextDescription}>
            SMS code sent to +447429539138
          </Text>
          <TextField
            style={styles.codeInput}
            placeholder="Code"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="number-pad"
            maxLength={6}
            onChangeText={onChangeCode}
          />
          <Button
            marginT-30
            backgroundColor={'#56841d'}
            enableShadow={true}
            label={'Send'}
            disabled={error}
            onPressOut={async () => await handleConfirmTx()}
          />
        </View>
      )}
      {confirming && (
        <LoaderScreen
          message={'Sending $' + amountNumber + ' to ' + address}
          color="black"
        />
      )}
      {!sending && !confirming && confirmed && sent && success && (
        <View marginTop={10}>
          <Text style={styles.successText}>Success!</Text>
          <Text style={styles.successTextDescription}>
            {'Sent $' + amountNumber + ' to ' + address}
          </Text>
        </View>
      )}
      {!sending && !confirming && confirmed && sent && !success && (
        <View marginTop={10}>
          <Text style={styles.failureText}>Transaction Failed</Text>
          <Text style={styles.failureTextDescription}>
            {'Failed to send $' + amountNumber + ' to ' + address}
          </Text>
          <Text style={styles.failureTextDescription}>
            {'Over daily spend limit'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  addressInput: {
    height: 40,
    margin: 12,
    borderBottomWidth: 1,
    borderColor: 'black',
    color: 'black',
    padding: 10,
    fontSize: 20,
  },
  amountInput: {
    height: 40,
    margin: 12,
    borderBottomWidth: 1,
    borderColor: 'black',
    color: 'black',
    padding: 10,
    fontSize: 20,
  },
  codeInput: {
    height: 40,
    margin: 12,
    width: 100,
    borderBottomWidth: 1,
    borderColor: 'black',
    color: 'black',
    padding: 10,
    fontSize: 20,
    alignSelf: 'center',
    textAlign: 'center',
  },
  buttonText: {
    color: 'black',
    fontSize: 20,
  },
  balanceText: {
    color: 'black',
    fontSize: 17,
    textAlign: 'center',
    fontStyle: 'normal',
  },
  spendText: {
    color: 'black',
    fontSize: 17,
    textAlign: 'center',
    fontStyle: 'normal',
  },
  dollarSign: {
    fontSize: 25,
    paddingLeft: 5,
  },
  nearText: {
    fontSize: 20,
    paddingRight: 10,
  },
  nearTextRed: {
    color: 'red',
    fontSize: 20,
    paddingRight: 10,
  },
  successText: {
    fontSize: 25,
    textAlign: 'center',
    color: '#56841d',
    marginBottom: 10,
  },
  successTextDescription: {
    fontSize: 20,
    textAlign: 'center',
    color: '#56841d',
  },
  failureText: {
    fontSize: 25,
    textAlign: 'center',
    color: '#b30018',
    marginBottom: 10,
  },
  failureTextDescription: {
    fontSize: 20,
    textAlign: 'center',
    color: '#b30018',
    marginBottom: 4,
  },
  pendingText: {
    fontSize: 25,
    textAlign: 'center',
    color: 'black',
    marginBottom: 10,
  },
  pendingTextDescription: {
    fontSize: 20,
    textAlign: 'center',
    color: 'grey',
  },
  header: {
    color: 'black',
    textAlign: 'center',
    fontSize: 30,
    fontWeight: 'bold',
    marginLeft: '31%',
  },
});

export default SendScreen;
