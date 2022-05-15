import React, {useEffect, useState} from 'react';
import {Text, View, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView} from "react-native";
import {GoogleSignin} from "@react-native-google-signin/google-signin";
import auth from '@react-native-firebase/auth';
import GL from '../globals';

import FamilyModule from "../FamilyModule";
import {getUUID} from "../util";
import {useIsFocused} from "@react-navigation/native";

function Home({ navigation }) {
  const [error, setError] = useState();
  const [userInfo, setUserInfo] = useState();
  const [children, setChildren] = useState(null);
  useIsFocused();

  const activityOwner = GL.children.find(x => x.activityOwner);

  useEffect(() => {
    async function loadUser() {
      const firebaseUser = await getUUID();

      setUserInfo(firebaseUser.additionalUserInfo.profile);
      const userID = firebaseUser.user.uid;

      if (activityOwner) {
        await FamilyModule.setupJob(userID, activityOwner.childID);
      }
      else if (children !== null) {
        await FamilyModule.cancelJob();
      }

      const result = await FamilyModule.getChildren(userID);
      GL.children = result;
      setChildren(result);

    }
    loadUser().catch(setError);
  }, [activityOwner && activityOwner.childID]);

  const onLogout = async () => {
    await GoogleSignin.signOut();
    navigation.navigate('Login');
  };

  const goAddChild = () => {
    navigation.navigate('AddOrEditChild');
  };

  const openChildPage = (child) => {
    navigation.navigate('Child', child);
  };

  if (error) {
    return (
      <View>
        <Text>Bir hata oluştu, uygulamayı kapatıp açmayı deneyin</Text>
        <Text>{JSON.stringify(error)}</Text>
      </View>
    );
  }

  if (!userInfo) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1}}>
      <Text style={styles.titleText}>
        HOŞGELDİN
      </Text>

      <View style={styles.nameContainer}>
        <Text style={styles.nameText}>
          {userInfo.name}
        </Text>
        <TouchableOpacity
          onPress={onLogout}
          style={styles.exitButton}>
          <Text style={styles.exitButtonText}>ÇIKIŞ</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.spacing}/>

      <Text style={styles.titleText}>
        ÇOCUKLARIM
      </Text>

      {
        !children ?
          <View style={[styles.childrenContainer, styles.centerContainer]} elevation={3}>
            <ActivityIndicator size="large"/>
          </View> : null
      }

      {
        children && children.length === 0 ?
          <View style={[styles.childrenContainer, styles.centerContainer]} elevation={3}>
            <Text  style={styles.noChildText}>Henüz Çocuk Eklemediniz</Text>
          </View> : null
      }

      {
        children && children.length > 0 ?
          <ScrollView style={styles.childrenContainer} elevation={3}>
            {
              children.map(child => (
                <TouchableOpacity
                  key={child.childID}
                  onPress={() => openChildPage(child)}
                  style={styles.childContainer}>
                  <Text style={styles.childName}>{child.name}</Text>
                  <View style={styles.ownershipContainer}>
                    {
                      child.activityOwner ? (
                        <Text style={styles.ownershipText}>Takipte</Text>
                      ) : null
                    }
                    <Text style={styles.childAge}>{child.age} Yaşında</Text>
                  </View>
                </TouchableOpacity>
              ))
            }
          </ScrollView> : null
      }

      <View style={styles.addChildButton}>
        <TouchableOpacity
          onPress={goAddChild}
          style={styles.addChildButtonAction}>
            <Text style={styles.addChildButtonText}>Çocuk Ekle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  spacing: {
    padding: 20,
  },
  titleText: {
    paddingTop: 10,
    paddingLeft: 18,
    fontSize: 15,
    alignSelf: 'flex-start',
    fontWeight: 'bold',
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 18,
    paddingRight: 18,
  },
  nameText: {
    lineHeight: 26,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    fontSize: 25,
    color: '#000',
  },
  exitButton: {
    backgroundColor: '#ec6363',
    padding: 5,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  exitButtonText: {
    color: '#fff',
  },
  ownershipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownershipText: {
    backgroundColor: '#b5ccaa',
    borderRadius: 10,
    color: '#fff',
    marginRight: 5,
    marginVertical: -2,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  childrenContainer: {
    flex: 1,
    margin: 18,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
  },
  childContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  childName: {
    fontSize: 16,
    color: '#333',
  },
  childAge: {
    fontSize: 13,
  },
  addChildButton: {
    alignItems: 'center',
    margin: 20,
    marginBottom: 100,
    borderRadius: 10,
    backgroundColor: '#00798a',
    elevation: 4,
    shadowColor: '#000',
  },
  addChildButtonAction: {
    padding: 10,
    width: '100%',
    alignItems: 'center'
  },
  addChildButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noChildText: {
    fontSize: 18,
    color: '#bbb',
  },
})

export default Home;