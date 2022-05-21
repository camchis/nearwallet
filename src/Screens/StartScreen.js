/* eslint-disable prettier/prettier */

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { ActionBar, Button as UIButton, Incubator } from 'react-native-ui-lib';
const { TextField } = Incubator;
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { generateMnemonic } from '../Helpers/Seed';
import { PublicKey } from '../Helpers/key_pair';
import { getAccount } from '../Helpers/Account';
import { createAndSaveWallet, getAccountID, saveAccountID } from '../Helpers/Storage';
import { gql, useMutation } from '@apollo/client';
import { AuthContext } from '../App';

const CREATE_ACCOUNT = gql`
mutation CreateAccount($details: Account) {
  createAccount(details: $details)
}
`;

function StartScreen({ navigation }) {
  const [accountCreated, setAccountCreated] = useState(false);
  const isDarkMode = useColorScheme() === 'dark';
  const [accountIdText, onChangeAccountIdText] = React.useState('');
  const [phoneNumberText, onChangePhoneNumberText] = React.useState('');

  const [createAccount, { data, loading, error }] =
  useMutation(CREATE_ACCOUNT);

  const { signIn } = React.useContext(AuthContext);

  useEffect(() => {
    const result = data?.createAccount
    if (result === 'Success') {
      setAccountCreated(true)
    } else if (result === 'Failed') {
      console.log('Request failed')
      // TODO: Do fail stuff here... cba now, not even needed for dissertation anyway
    }
    if (error) {
      // TODO:
    }
  }, [data, accountCreated, error])

  const backgroundStyle = {
    backgroundColor: '#56841d',
  };

  // Create new wallet: generate private key with seed phrase and generate public key which will be added to the account
  const handleCreateWallet = async () => {
    
    // Generate new wallet
    const {seedPhrase, publicKey, privateKey} = await createAndSaveWallet();

   // const accountID = PublicKey.fromString(publicKey).data.toString('hex');

    console.log(publicKey);
  // console.log(accountID);
    console.log(seedPhrase);
    console.log(privateKey);

    // Create new NEAR account from public key of wallet

    // Create account with generated public key and given account ID
    // This sends a request to the apollo server to create an account

    // Create a new NEAR account with given ID
    // Add public key as multisig signer
    await createAccount({ variables: 
      {
        "details": {
          "publicKey": publicKey,
          "accountId": accountIdText,
        }
      } 
    })

    let pochiAccountId = accountIdText + ".pochi.testnet"

    await saveAccountID(pochiAccountId);
    signIn(pochiAccountId);
  };

  return (
   <View flex={1}>
     <SafeAreaView backgroundColor='white'/>
      <View flex={1} backgroundColor='white'>
        <View backgroundColor='white' style={{minHeight: '5%', alignContent: 'center', marginBottom: '20%'}}>
          <Text styles={styles.header}>Welcome</Text>
        </View>
        {loading &&
          <ActivityIndicator size={'large'}/>
        }
        {(accountCreated && 
        <>
          <Text>Your account {accountIdText} has been created</Text>
          <Button title="Next Screen" onPress={() => navigation.navigate('Home')} />
        </>
        )}
        {!loading && !accountCreated && (
          <View style={{alignItems: 'center'}}>
            <TextField
              marginB-30
              text50M
              floatingPlaceholder={false}
              placeholder={'james123'}
              label={'Account ID'}
              fieldStyle={{borderColor: 'grey', borderBottomWidth: 1, width: '80%'}}
              onChangeText={onChangeAccountIdText}
              autoCapitalize={'none'}
              autoCorrect={false}
            />
            <TextField
              marginB-70
              text50M
              floatingPlaceholder={false}
              placeholder={'+447517381086'}
              label={'Phone Number'}
              fieldStyle={{borderColor: 'grey', borderBottomWidth: 1, width: '80%'}}
              onChangeText={onChangePhoneNumberText}
              keyboardType={'phone-pad'}
            />
            <UIButton
              label={'Create wallet'}
              backgroundColor={'#56841d'}
              enableShadow={true}
              onPressOut={handleCreateWallet}
            />
          </View>
        )}
      </View>
  </View>
  );
}

const styles = StyleSheet.create({
  header: {
    color: 'black', 
    textAlign: 'center', 
    fontSize: 30, 
    fontWeight: 'bold',
  },
})


export default StartScreen;
