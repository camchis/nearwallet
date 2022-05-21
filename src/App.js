import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StartScreen from './Screens/StartScreen';
import HomeScreen from './Screens/HomeScreen';
import SendScreen from './Screens/SendScreen';
import { ApolloProvider } from '@apollo/client';
import { createApolloClient } from './config/apollo/apollo-client';
import { getAccountID } from './Helpers/Storage';

// config
const Stack = createNativeStackNavigator();
const apolloClient = createApolloClient();
export const AuthContext = React.createContext();

// main
function App() {
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_ACCOUNT':
          return {
            ...prevState,
            userAccount: action.account,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.account,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isNoAccount: true,
            userAccount: null,
          };
      }
    },
    {
      isLoading: true,
      isNoAccount: false,
      userAccount: null,
    },
  );

  React.useEffect(() => {
    const checkAccount = async () => {
      //await resetAllStorage();
      let userAccount = await getAccountID();
      if (userAccount) {
        dispatch({ type: 'RESTORE_ACCOUNT', account: userAccount });
      }
    };
    checkAccount();
  }, []);

  const authStuff = React.useMemo(
    () => ({
      signIn: async account => {
        dispatch({ type: 'RESTORE_ACCOUNT', account });
      },
      signOut: () => dispatch({ type: 'SIGN_OUT' }),
    }),
    [],
  );

  return (
    <ApolloProvider client={apolloClient}>
      <NavigationContainer>
        <AuthContext.Provider value={authStuff}>
          <Stack.Navigator>
            {state.userAccount == null ? (
              <Stack.Screen
                name="Welcome"
                component={StartScreen}
                options={{ headerShown: false }}
              />
            ) : (
              <>
                <Stack.Screen
                  name="Home"
                  component={HomeScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="Send"
                  component={SendScreen}
                  options={{ headerShown: false }}
                />
              </>
            )}
          </Stack.Navigator>
        </AuthContext.Provider>
      </NavigationContainer>
    </ApolloProvider>
  );
}

export default App;
