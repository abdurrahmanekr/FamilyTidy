import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import GL from "../globals";
import {useIsFocused} from "@react-navigation/native";
import FamilyModule from "../FamilyModule";
import {getUUID} from "../util";

function Child({
  route,
  navigation,
}) {
  const childID = route.params.childID;
  const {
    name,
    age,
    birthDate,
    activityOwner,
  } = GL.children.find(x => x.childID === childID);

  const [activityOwnership, setActivityOwnership] = useState(activityOwner);
  const [loading, setLoading] = useState(false);
  useIsFocused();

  const navigateEdit = () => {
    navigation.navigate('AddOrEditChild', {
      childID,
      childName: name,
      childAge: age,
      childActivityOwner: activityOwnership,
    });
  };

  const updateOwnership = async (ownership) => {
    // TODO daha önce olan çocuğun varlığını bildirmeli
    setLoading(true);
    const { user } = await getUUID();

    await FamilyModule.updateChild(
      user.uid,
      childID,
      name,
      birthDate,
      ownership,
    );
    const child = GL.children.find(x => x.childID === childID);
    if (child !== undefined) {
      child.activityOwner = ownership;
    }

    setActivityOwnership(ownership);
    setLoading(false);
  };

  const setOwnership = () => updateOwnership(true);
  const removeOwnership = () => updateOwnership(false);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.editContainer}>
        <TouchableOpacity
          onPress={navigateEdit}
          style={styles.editButton}>
          <Text style={styles.editButtonText}>Düzenle</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.nameText}>
          {name}
        </Text>

        <Text style={styles.ageText}>
          {age} Yaşında
        </Text>
      </View>

      <View style={styles.setChildContainer}>
        <Text style={styles.childStatus}>
          {
            activityOwnership ?
              'Bu telefon\'daki aktivite şu anda bu çocuğa aittir' :
              'Bu çocuk bu cihazda takip edilmiyor'
          }
        </Text>

        {
          activityOwnership ? (
            <TouchableOpacity
              activeOpacity={loading ? 1 : 0.7}
              onPress={loading ? () => void(0) : removeOwnership}
              style={[styles.setChildButton, { backgroundColor: '#da6060' }]}>
              {
                loading ?
                  <ActivityIndicator
                    style={{ paddingRight: 10 }}
                    color="#fff"/> : null
              }
              <Text style={styles.setChildButtonText}>
                Bu cihazdan kaldır
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={loading ? 1 : 0.7}
              onPress={loading ? () => void(0) : setOwnership}
              style={[styles.setChildButton, { backgroundColor: '#dac160' }]}>
              {
                loading ?
                  <ActivityIndicator
                    style={{ paddingRight: 10 }}
                    color="#fff"/> : null
              }

              <Text style={styles.setChildButtonText}>
                Bu çocuğa ait yap
              </Text>
            </TouchableOpacity>
          )
        }

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  editContainer: {
    padding: 20,
  },
  editButton: {
    backgroundColor: '#ec6363',
    padding: 5,
    paddingHorizontal: 15,
    borderRadius: 15,
    width: 100,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 18,
    color: '#fff',
  },
  infoContainer: {
    marginVertical: 40,
  },
  nameText: {
    fontSize: 30,
    alignSelf: 'center',
    color: '#333',
  },
  ageText: {
    fontSize: 20,
    alignSelf: 'center',
  },
  setChildContainer: {
    marginTop: 50,
  },
  childStatus: {
    textAlign: 'center',
    fontSize: 15,
    marginBottom: 15,
  },
  setChildButton: {
    padding: 5,
    paddingVertical: 15,
    borderRadius: 15,
    marginHorizontal: 30,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  setChildButtonText: {
    textAlign: 'center',
    fontSize: 20,
    color: '#fff',
  },
});

export default Child;