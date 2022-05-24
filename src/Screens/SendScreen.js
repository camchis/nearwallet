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

function SendScreen({ route, navigation }) {
  const { account, accountBalance, accountID, spendLeft, spendLimit } =
    route.params;
  const [amountNumber, onChangeAmountNumber] = React.useState('');
  const [address, onChangeAddressText] = React.useState('');
  const [error, setError] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [success, setSuccess] = useState(false);

  const readableBalance = parseFloat(
    nearAPI.utils.format.formatNearAmount(accountBalance.available),
  ).toFixed(2);

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
  }, [amountNumber, readableBalance]);

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
      {!loading && !sent && (
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
              onPressOut={async () => {
                const sendAmount = parseFloat(amountNumber) / 6;
                setLoading(true);
                const response = await sendTx({
                  account,
                  contract: accountID,
                  toUser: address,
                  amount: nearAPI.utils.format.parseNearAmount(
                    sendAmount.toString(),
                  ),
                });
                console.log(response);
                if (response === 'True') {
                  setLoading(false);
                  setSent(true);
                  setSuccess(true);
                } else {
                  setLoading(false);
                  setSent(true);
                  setSuccess(false);
                }
              }}
            />
          </View>
        </>
      )}
      {loading && !sent && (
        <LoaderScreen
          message={'Sending $' + amountNumber + ' to ' + address}
          color="black"
        />
      )}
      {!loading && sent && success && (
        <View marginTop={10}>
          <Text style={styles.successText}>Success!</Text>
          <Text style={styles.successTextDescription}>
            {'Sent $' + amountNumber + ' to ' + address}
          </Text>
        </View>
      )}
      {!loading && sent && !success && (
        <View marginTop={10}>
          <Text style={styles.failureText}>Transaction Failed</Text>
          <Text style={styles.failureTextDescription}>
            {'Failed to send $' + amountNumber + ' to ' + address}
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
