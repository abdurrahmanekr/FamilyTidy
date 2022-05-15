import {GoogleSignin} from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";

export async function getUUID() {
  const { idToken } = await GoogleSignin.getCurrentUser();
  const googleCredential = auth.GoogleAuthProvider.credential(idToken);
  return await auth().signInWithCredential(googleCredential);
}