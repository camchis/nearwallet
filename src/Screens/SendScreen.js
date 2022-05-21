import React, { useEffect, useState, useCallback } from 'react';
import {
  Button,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TextInput,
} from 'react-native';
import * as nearAPI from 'near-api-js';
import useAccount from './Hooks/useAccount';
import { resetAllStorage } from '../Helpers/Storage';
import { AuthContext } from '../App';
import { deployContract, sendTx } from '../Helpers/Transactions';
import { gql, useMutation } from '@apollo/client';
import Icon from 'react-native-vector-icons/MaterialIcons';

function SendScreen({ route, navigation }) {
  const { accountBalance, spendLeft, spendLimit } = route.params;

  return (
    <SafeAreaView flex={1} backgroundColor="white">
      <StatusBar />
      <View flexDirection={'row'} marginBottom={'10%'} paddingHorizontal={10}>
        <Pressable onPressOut={() => {navigation.goBack()}}>
          <Icon name="arrow-back-ios" size={38} color="black" style={styles.button}/>
        </Pressable>
        <Text style={styles.header}>Send</Text>
      </View>
      <View marginBottom={'5%'} paddingHorizontal={10} flexDirection={'row'} justifyContent={'space-between'}>
        <Text style={styles.balanceText}>
          Balance:{' '}
          {parseFloat(
            nearAPI.utils.format.formatNearAmount(accountBalance.available),
          ).toFixed(2)}
          {' Ⓝ'}
        </Text>
        <Text style={styles.spendText}>${parseInt(spendLimit - spendLeft).toFixed(2)} spend remaining</Text>
      </View>
      <View>
        <TextInput
          style={styles.addressInput}
          placeholder="Address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={styles.amountInput}
          placeholder="Amount"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="decimal-pad"
        />
      </View>
      <Pressable alignSelf='center' alignItems='center' marginTop={50}>
        <Icon name="send-circle-outline" size={60} color="black" />
        <Text style={styles.buttonText}>Send</Text>
      </Pressable>
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
  header: {
    color: 'black',
    textAlign: 'center',
    fontSize: 30,
    fontWeight: 'bold',
    marginLeft: '31%',
  },
});

export default SendScreen;
