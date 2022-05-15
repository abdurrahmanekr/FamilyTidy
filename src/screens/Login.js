import React, {useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";

import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

function Login({ navigation }) {
  const [googleLoading, setGoogleLoading] = useState(false);

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const isLogin = await GoogleSignin.isSignedIn();
      if (isLogin) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
        return;
      }

      const userInfo = await GoogleSignin.signIn();
      if (userInfo) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }
    } catch (err) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        console.error("SIGN_IN_CANCELLED");
      } else if (err.code === statusCodes.IN_PROGRESS) {
        console.error("IN_PROGRESS");
        // operation (e.g. sign in) is in progress already
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.error("PLAY_SERVICES_NOT_AVAILABLE");
        // play services not available or outdated
      } else if (err.code === statusCodes.SIGN_IN_REQUIRED) {
        console.error("SIGN_IN_REQUIRED");
        // play services not available or outdated
      } else {
        console.error("HATA OLDU KNK", err.code, err)
        // some other error happened
      }
    }

    setGoogleLoading(false);
  };

  return (
    <View>
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logoImage}
        />
      </View>

      <Text style={styles.logoText}>FamilyTidy</Text>

      <View
        style={styles.inputContainer}>

        <TouchableOpacity
          onPress={googleLoading ? (() => void(0)) : signIn}
          style={styles.googleSign}>
          <Image
            style={styles.googleSignIcon}
            source={require('../assets/icons/google-sign.png')}/>

          <Text
            style={styles.googleSignText}>
            Google İle Giriş Yap
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  logoText: {
    fontWeight: 'bold',
    color: '#fedd2f',
    alignSelf: 'center',
    fontSize: 37,
  },
  inputContainer: {
    // flexDirection: 'column',
  },
  googleSign: {
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    margin: 30,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#77a36b',
  },
  googleSignIcon: {
    width: 30,
    height: 30,
  },
  googleSignText: {
    paddingLeft: 10,
    fontSize: 17,
    color: '#77a36b'
  },
  logoImage: {
    width: 200,
    height: 200,
  },
});

export default Login;