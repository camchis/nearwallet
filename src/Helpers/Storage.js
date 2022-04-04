import AsyncStorage from '@react-native-community/async-storage';
import { generateMnemonic } from './Seed';

export async function createAndSaveWallet() {
  try {
    const seedAndKeys = await generateMnemonic();
    if (seedAndKeys !== null) {
      const { seedPhrase, privateKey, publicKey } = seedAndKeys;
      saveKeys({ seedPhrase, privateKey, publicKey });
      return { seedPhrase, privateKey, publicKey };
    }
  } catch (error) {
    console.log(error);
  }
}

async function saveKeys({ seedPhrase, privateKey, publicKey }) {
  try {
    await AsyncStorage.setItem('SEED_PHRASE', seedPhrase);
    await AsyncStorage.setItem('PRIVATE_KEY', privateKey);
    await AsyncStorage.setItem('PUBLIC_KEY', publicKey);
    console.log(
      'saved PRIVATE_KEY, PUBLIC_KEY and SEED_PHRASE to AsyncStorage',
    );
  } catch (error) {
    console.log(error);
  }
}

export async function saveAccountID(accountID) {
  try {
    await AsyncStorage.setItem('ACCOUNT_ID', accountID);
    console.log('saved ACCOUNT_ID to AsyncStorage');
  } catch (error) {
    console.log(error);
  }
}

export async function getPrivateKey() {
  try {
    const privateKey = await AsyncStorage.getItem('PRIVATE_KEY');
    if (privateKey !== null) {
      return privateKey;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function getPublicKey() {
  try {
    const publicKey = await AsyncStorage.getItem('PUBLIC_KEY');
    if (publicKey !== null) {
      return publicKey;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function getAccountID() {
  try {
    const accountID = await AsyncStorage.getItem('ACCOUNT_ID');
    if (accountID !== null) {
      return accountID;
    }
  } catch (error) {
    console.log(error);
  }
}

// Just need this for testing purposes atm
export async function resetAllStorage() {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.log(error);
  }
  console.log('Storage cleared');
}
