//import React from 'react'
import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
  SafeAreaView,
  Platform,
} from "react-native";
import { auth, firestore } from "../firebase";
import { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import * as ScreenOrientation from "expo-screen-orientation";
import { signInWithEmailAndPassword } from "firebase/auth";

const LoginScreen = ({ navigation }) => {
  async function changeScreenOrientation() {
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE
    );
  }

  //Retrieve Branches
  const getBranches = async () => {
    const branchRefCollection = collection(firestore, "branchRef");
    const branchRefSnapshot = await getDocs(branchRefCollection);
    setBranches(branchRefSnapshot.docs.map((doc) => doc.data()));
  };

  //Async Functions will load in Use Effect
  useEffect(() => {
    changeScreenOrientation();
    getBranches();
    console.log("LANDSCAPE ORIENTATION");
  }, []);

  //Variables
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [menuRef, setMenuRef] = useState("");
  const [branches, setBranches] = useState("");

  const [branchName, setBranchName] = useState(null);
  const [menuTableRef, setMenuTableRef] = useState(null);
  const [orderTableRef, setOrderTableRef] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  var uid = "";

  //Functions
  const handleRegistration = () => {
    navigation.navigate("SignUp");
  };

  const handleLogin = () => {
    console.log("ENTER LOG IN");

    //Authenticate Thru Firebase
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        const user = userCredentials.user;
        console.log("Logged in with: ", user.email);
        console.log("User Id: ", user.uid);

        //Get User ID
        uid = user.uid;

        //Get information from UID
        getDoc(doc(firestore, "userList", uid)).then((docSnap) => {
          if (docSnap.exists()) {
            const info = docSnap.data();

            console.log("User Name:", info.username);
            console.log("Document data:", docSnap.data());

            //Alert for Successful Login
            Alert.alert("Login Successful", "Please click OK to continue", [
              {
                text: "OK",
                onPress: () =>
                  //Navigate to Home Screen
                  navigation.navigate("HomeStack", {
                    screen: "Home",
                    params: {
                      credential: info.credential,
                      email: info.email,
                      firstName: info.firstName,
                      lastName: info.lastName,
                      username: info.username,
                      menuRef: menuRef,
                      orderRef: orderRef,
                    },
                  }),
              },
            ]);
          } else {
            console.log("No user information available. Please try again");
          }
        });
      })
      .catch((error) => alert(error.message));
  };

  //Branches Flatlist Components
  const BranchesItem = ({ item, onPress, backgroundColor, textColor }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.categoryContents, backgroundColor]}
    >
      <Text style={[styles.title, textColor]}>{item.branchName}</Text>
    </TouchableOpacity>
  );

  const renderBranches = ({ item }) => {
    const backgroundColor =
      item.branchName === selectedId ? "#FFC000" : "#ffffe0";
    const color = item.branchName === selectedId ? "black" : "black";

    return (
      <BranchesItem
        item={item}
        onPress={() => {
          setSelectedId(item.branchCode);
          setBranchName(item.branchName);
          setOrderTableRef(item.orderTableRef);
          setMenuTableRef(item.menuTableRef);

          console.log("SELECTED CATEGORY: ", selectedId);

          //getItems(item.category)
        }}
        backgroundColor={{ backgroundColor }}
        textColor={{ color }}
      />
    );
  };

  //Render
  return (
    <SafeAreaView
      style={styles.container}
      behavior={Platform.OS == "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS == "ios" ? 0 : 20}
      enabled={Platform.OS === "ios" ? true : false}
    >
      <View style={styles.labelContainer}>
        <Text style={styles.labelHeader}>
          Cafe Vanleroe Login - Waltermart Taytay
        </Text>
      </View>

      <KeyboardAvoidingView style={styles.inputContainer}>
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
      </KeyboardAvoidingView>

      {/*
            <View style = {styles.branchView}>
                    <Text style = {styles.subheaderText}>Select Designated Branch</Text>
                    <FlatList
                        data={branches}
                        renderItem={renderBranches}
                        keyExtractor={(item) => item.id}
                        extraData={selectedId}
                        keyboardShouldPersistTaps="always"
                        
                    />
            </View>
            */}

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleLogin} style={styles.button}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleRegistration}
          style={[styles.button, styles.buttonOutline]}
        >
          <Text style={styles.buttonOutlineText}>Register</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    //paddingTop: '20%',
    flex: 1,
  },
  inputContainer: {
    width: "60%",
  },
  branchView: {
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
  itemContents: {
    padding: 20,
    marginVertical: "1%",
    marginHorizontal: "1%",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    height: 180,
  },
});
