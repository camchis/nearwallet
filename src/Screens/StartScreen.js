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
  const [accountIdText, onChangeText] = React.useState('');

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
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
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
          "accountId": accountIdText + ".pochi.testnet",
        }
      } 
    })
    await saveAccountID(accountIdText + ".pochi.testnet");
    signIn(accountIdText + ".pochi.testnet");
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <View >
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
            <>
            <TextInput
            onChangeText={onChangeText}
            value={accountIdText}
            placeholder="Account ID"
            />
            <Button title="Create NEAR Account" onPress={handleCreateWallet} />
            </>
          )}
        </View>
    </SafeAreaView>
  );
}

// const styles = StyleSheet.create({
//   sectionContainer: {
//     marginTop: 32,
//     paddingHorizontal: 24,
//   },
//   sectionTitle: {
//     fontSize: 24,
//     fontWeight: '600',
//   },
//   sectionDescription: {
//     marginTop: 8,
//     fontSize: 18,
//     fontWeight: '400',
//   },
//   highlight: {
//     fontWeight: '700',
//   },
// });

export default StartScreen;
