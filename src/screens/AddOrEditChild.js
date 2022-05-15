import React, {useEffect, useState} from 'react';
import {ActivityIndicator, DatePickerAndroid, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {getUUID} from "../util";
import GL from '../globals';
import FamilyModule from "../FamilyModule";

function AddOrEditChild({
  route,
  navigation,
}) {
  const {
    childID,
    childName,
    childAge,
    childActivityOwner,
  } = route.params || {};
  const [selfChildID, setSelfChildID] = useState(childID);
  const [name, setName] = useState(!selfChildID ? '' : childName);
  const [age, setAge] = useState(!selfChildID ? '' : String(childAge));
  const [loading, setLoading] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState();

  useEffect(() => {
    if (selfChildID) {
      navigation.setOptions({
        title: 'Bilgileri Düzenle'
      });
    }
  });

  const onSave = async () => {
    setError();
    setSuccess(false);

    if (!name.trim() || !/[0-9]/g.test(age)) {
      // TODO alert unvalid
      setInvalid(true);
      return;
    }

    setInvalid(false);
    setLoading(true);

    const { user } = await getUUID();
    const birthDate = new Date().getFullYear() - parseInt(age);

    try {
      if (!selfChildID) {
        const childID = await FamilyModule.addChild(
          user.uid,
          name.trim(),
          birthDate,
        )
        setSelfChildID(childID);
        GL.children.push({
          childID: childID,
          name: name.trim(),
          birthDate: birthDate,
          age: age,
          activityOwner: false,
        })
      }
      else {
        await FamilyModule.updateChild(
          user.uid,
          selfChildID,
          name.trim(),
          birthDate,
          childActivityOwner,
        );
      }

      const child = GL.children.find(x => x.childID === selfChildID);
      if (child !== undefined) {
        child.name = name.trim();
        child.birthDate = birthDate;
        child.age = age;
      }
      setSuccess(true);
    }
    catch (e) {
      setError(e);
    }

    setLoading(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.inputTitle}>
        ÇOCUĞUN ADI
      </Text>

      <TextInput
        editable={!loading}
        autoComplete="name"
        textContentType="name"
        onChangeText={setName}
        defaultValue={name}
        style={styles.input}/>

      <Text style={styles.inputTitle}>
        YAŞI
      </Text>

      <TextInput
        editable={!loading}
        keyboardType="numeric"
        onChangeText={setAge}
        defaultValue={age}
        placeholder="Ör: 3"
        style={styles.input}/>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={loading ? () => void(0) : onSave}
        activeOpacity={loading ? 1 : 0.6}>
        {
          loading ?
            <ActivityIndicator
              style={{ paddingRight: 10 }}
              color="#fff"/> : null
        }

        <Text style={styles.saveButtonText}>KAYDET</Text>
      </TouchableOpacity>

      {
        success ?
          <View style={styles.infoContainer}>
            <Text style={styles.successText}>
              Başarıyla Kaydedildi!
            </Text>
          </View> : null
      }

      {
        invalid ?
          <View style={styles.infoContainer}>
            <Text style={styles.invalidText}>
              Girdiğiniz bilgiler geçersizdir, yaş bilgisinin sayı olduğundan emin olunuz
            </Text>
          </View> : null
      }

      {
        error ?
          <View style={styles.infoContainer}>
            <Text style={styles.invalidText}>
              Kaydedilirken sorun oluştu
            </Text>
          </View> : null
      }
    </View>
  );
}

const styles = StyleSheet.create({
  inputTitle: {
    fontSize: 20,
    color: '#333',
    paddingHorizontal: 17,
    fontWeight: 'bold',
    paddingTop: 20,
  },
  input: {
    borderWidth: 1,
    color: 'rgb(32,165,208)',
    borderColor: 'rgb(32,165,208)',
    paddingHorizontal: 17,
    marginTop: 5,
    marginHorizontal: 17,
    fontSize: 17,
    borderRadius: 4,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ec6363',
    alignSelf: 'flex-end',
    marginHorizontal: 17,
    marginTop: 40,
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  saveButtonText: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#fff',
  },
  infoContainer: {
    padding: 20,
  },
  invalidText: {
    fontSize: 15,
    color: '#570000',
  },
  successText: {
    fontSize: 15,
    color: '#60a600',
  },
});

export default AddOrEditChild;