import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { auth, firestore } from "../firebase";
import { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { collection, setDoc, doc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

const SignUpScreen = ({ navigation }) => {
  //Variables
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  var uid = "";

  //Functions
  const handleLogin = () => {
    navigation.navigate("Login");
  };

  const handleSignUp = () => {
    console.log("ENTER SIGN UP");

    if (password != repeatPassword) {
      alert("Password Invalid.");
    } else {
      if (
        firstName &&
        lastName &&
        username &&
        email &&
        password &&
        repeatPassword
      ) {
        //Initiate Creation of User Credentials
        createUserWithEmailAndPassword(auth, email, password)
          .then((userCredentials) => {
            const user = userCredentials.user;

            uid = user.uid;

            console.log("Registered with: ", user.email);
            console.log("User UID: ", uid);

            //Add New User to Database
            try {
              const docRef = collection(firestore, "userList");

              setDoc(doc(docRef, uid), {
                //Start Comment: To be modified in the future
                credential: "1",
                //End Comment
                email: email,
                firstName: firstName,
                lastName: lastName,
                username: username,
              });

              console.log("Document written with ID: ", docRef.id);
            } catch (e) {
              console.error("Error adding document: ", e);
            }

            //Alert for Successful Registration
            Alert.alert(
              "Registration Successful",
              "Please click OK to proceed with the Login",
              [{ text: "OK", onPress: () => navigation.navigate("Login") }]
            );
          })
          .catch((error) => alert(error.message));
      } else {
        alert("Pleae populate missing fields.");
      }
    }
  };

  //Render
  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.labelContainer}>
        <Text style={styles.labelHeader}>Registration Point</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="First Name"
          value={firstName}
          onChangeText={(text) => setFirstName(text)}
          style={styles.input}
        />

        <TextInput
          placeholder="Last Name"
          value={lastName}
          onChangeText={(text) => setLastName(text)}
          style={styles.input}
        />

        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={(text) => setUsername(text)}
          style={styles.input}
        />

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={(text) => setPassword(text)}
          style={styles.input}
          secureTextEntry
        />

        <TextInput
          placeholder="Repeat Password"
          value={repeatPassword}
          onChangeText={(text) => setRepeatPassword(text)}
          style={styles.input}
          secureTextEntry
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleSignUp} style={styles.button}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogin}
          style={[styles.button, styles.buttonOutline]}
        >
          <Text style={styles.buttonOutlineText}>Back</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  inputContainer: {
    width: "60%",
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5,
  },
  buttonContainer: {
    width: "60%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  button: {
    backgroundColor: "#0782F9",
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  buttonOutline: {
    backgroundColor: "white",
    marginTop: 5,
    borderColor: "#0782F9",
    borderWidth: 2,
  },
  buttonOutlineText: {
    color: "#0782F9",
    fontWeight: "700",
    fontSize: 16,
  },
  labelContainer: {
    paddingBottom: 20,
  },
  labelHeader: {
    color: "#0782F9",
    fontWeight: "500",
    fontSize: 26,
  },
});
