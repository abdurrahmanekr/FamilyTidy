/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useState} from 'react';

import {GoogleSignin} from "@react-native-google-signin/google-signin";

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import FamilyModule from "./src/FamilyModule";

import Home from './src/screens/Home';
import Login from './src/screens/Login';
import AddOrEditChild from './src/screens/AddOrEditChild';
import Child from "./src/screens/Child";
import {ActivityIndicator, View} from "react-native";

GoogleSignin.configure({
  webClientId: '56707468264-qaouhs6ohjvu9os5l2j1gq2dke1mcpkk.apps.googleusercontent.com',
  scopes: [
    'https://www.googleapis.com/auth/plus.login',
  ],
});

const Stack = createNativeStackNavigator();
const App = () => {
  const [loading, setLoading] = useState(true);
  const [initialRouteName, setInitialRouteName] = useState('Login');

  useEffect(() => {
    GoogleSignin.signOut();
    GoogleSignin.isSignedIn()
      .then(isSigned => {
        if (isSigned) {
          setInitialRouteName('Home');
        }
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
      })
  }, []);

  useState(async () => {
    const stats = await FamilyModule.getStats();
    if (stats.length < 1) {
      await FamilyModule.openSettings();
    }
    return Promise.resolve();
  }, [])

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRouteName}>
        <Stack.Screen
          name="Home"
          component={Home}
          options={{
            title: 'Anasayfa',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{
            title: 'Giriş',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AddOrEditChild"
          component={AddOrEditChild}
          options={{
            title: 'Çocuk Ekle',
          }}
        />
        <Stack.Screen
          name="Child"
          component={Child}
          options={{
            title: 'Çocuk',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// const Section = ({children, title}): Node => {
//   const isDarkMode = useColorScheme() === 'dark';
//   return (
//     <View style={styles.sectionContainer}>
//       <Text
//         style={[
//           styles.sectionTitle,
//           {
//             color: isDarkMode ? Colors.white : Colors.black,
//           },
//         ]}>
//         {title}
//       </Text>
//       <Text
//         style={[
//           styles.sectionDescription,
//           {
//             color: isDarkMode ? Colors.light : Colors.dark,
//           },
//         ]}>
//         {children}
//       </Text>
//     </View>
//   );
// };
//
// const App: () => Node = () => {
//   const isDarkMode = useColorScheme() === 'dark';
//
//   const backgroundStyle = {
//     backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
//   };
//
//   return (
//     <SafeAreaView style={backgroundStyle}>
//       <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
//       <ScrollView
//         contentInsetAdjustmentBehavior="automatic"
//         style={backgroundStyle}>
//         <Header />
//         <View
//           style={{
//             backgroundColor: isDarkMode ? Colors.black : Colors.white,
//           }}>
//           <Section title="Step One">
//             Edit <Text style={styles.highlight}>App.js</Text> to change this
//             screen and then come back to see your edits.
//             <TouchableOpacity
//               onPress={async () => {
//                 console.log("değerleri yazdır");
//                 try {
//                   let values = await FamilyModule.getStats();
//                   console.log(values);
//
//                   if (values.length < 1) {
//                       await FamilyModule.openSettings()
//                         .then(console.log)
//                         .catch(console.error);
//                   }
//                   values = await FamilyModule.getStats();
//                   if (values.length > 0) {
//                     // cron
//                     await FamilyModule.setupJob()
//                       .then(console.log)
//                       .catch(console.error);
//                   }
//                   console.log(values);
//                 } catch (e) {
//                   console.log(e);
//                 }
//               }}
//             >
//               <Text>Tıkla Gör</Text>
//             </TouchableOpacity>
//           </Section>
//           <Section title="See Your Changes">
//             <ReloadInstructions />
//           </Section>
//           <Section title="Debug">
//             <DebugInstructions />
//           </Section>
//           <Section title="Learn More">
//             Read the docs to discover what to do next:
//           </Section>
//           <LearnMoreLinks />
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };
//
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

export default App;
