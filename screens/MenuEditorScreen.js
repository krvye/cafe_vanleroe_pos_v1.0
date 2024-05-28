import React, { useState, useEffect } from "react";
import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Pressable,
  Alert,
  Platform,
} from "react-native";
import { auth, firestore } from "../firebase";
import {
  getDocs,
  collection,
  where,
  query,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import * as ScreenOrientation from "expo-screen-orientation";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import EditItemModal from ".././components/EditItemModal";
import AddItemModal from ".././components/AddItemModal";

const MenuEditorScreen = ({ route, navigation }) => {
  async function changeScreenOrientation() {
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE
    );
  }

  //Parameters

  const [category, setCategory] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [selectedItems, setSelectedItems] = useState("");
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  //Selected Item
  const [selectedItem, setSelectedItem] = useState(null);
  const [amountSmall, setAmountSmall] = useState(0);
  const [amountMedium, setAmountMedium] = useState(0);
  const [amountLarge, setAmountLarge] = useState(0);

  const [fpAmountSmall, setFpAmountSmall] = useState(0);
  const [fpAmountMedium, setFpAmountMedium] = useState(0);
  const [fpAmountLarge, setFpAmountLarge] = useState(0);

  const [image, setImage] = useState(null);
  const [nextId, setNextId] = useState(null);

  //Modal parameters
  const [modalEditItemVisible, showModalEditItemVisible] = useState(false);
  const [modalAddItemVisible, showModalAddItemVisible] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  //Retrieve Categories
  const getCategory = async () => {
    const categoryCollection = collection(firestore, "category");
    const categorySnapshot = await getDocs(categoryCollection);
    setCategory(categorySnapshot.docs.map((doc) => doc.data()));
  };

  const retrieveTotalNumberofDocuments = async () => {
    const menuRef = collection(firestore, "menu");

    const menuItemsSnapshot = await getDocs(menuRef);

    var nextItemNo = parseInt(menuItemsSnapshot.docs.length) + 2;
    !nextItemNo ? setNextId("1") : setNextId(nextItemNo.toString());
  };

  //Retrieve Items
  const getItems = async (selectedCategory) => {
    console.log("ENTER ITEM FILTER");

    const q = query(
      collection(firestore, "menu"),
      where("category", "==", selectedCategory.toString())
    );

    //console.log('Query: ' , q)

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      console.log("No matching documents.");
      return;
    } else {
      setSelectedItems(querySnapshot.docs.map((doc) => doc.data()));
    }

    console.log("SELECTED ITEM COUNT: ", Object.keys(selectedItems).length);
  };

  const retrieveSelectedItemId = async (itemId) => {
    const q = query(collection(firestore, "menu"), where("id", "==", itemId));

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("No matching documents.");
      return;
    } else {
      querySnapshot.docs.map((doc) => {
        setSelectedDocumentId(doc.id);
        console.log("DOCUMENT ID: ", doc.id);
      });
    }
  };

  //Handle Edit Modal
  const handleEditModal = async () => {
    console.log("EDIT MODAL CHECK ENTRY STATUS: ", modalEditItemVisible);
  };

  //Async Functions will load in Use Effect
  useEffect(() => {
    // write ysour code here, it's like componentWillMount
    getCategory();
    changeScreenOrientation();
    console.log("CATEGORIES: ", category);

    console.log("EDIT MODAL PARAMETER: ", modalEditItemVisible);
  }, []);

  //Re-render if addItem updates
  useEffect(() => {
    getItems(selectedId);
  }, [modalAddItemVisible, modalEditItemVisible, confirmDelete]);

  //Confirm Delete Item
  const handleDelete = async () => {
    setConfirmDelete(!confirmDelete);

    await deleteDoc(doc(firestore, "menu", selectedDocumentId));

    alert("Item deleted successfully");

    console.log("DELETED");
  };

  //Item Flatlist Components
  const Item = ({ item, onPress, backgroundColor, textColor }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.itemContents, backgroundColor]}
    >
      <Text style={[styles.title, textColor]}>{item.product}</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => {
    const backgroundColor =
      item.product === selectedItem ? "#6E260E" : "#EADDCA";
    const color = item.product === selectedItem ? "white" : "black";

    return (
      <Item
        item={item}
        keyboardShouldPersistTaps="always"
        onPress={() => {
          setSelectedItem(item.product);

          if (item.amountSmall) {
            setAmountSmall(item.amountSmall);
          } else {
            setAmountSmall("0");
          }

          if (item.amountMedium) {
            setAmountMedium(item.amountMedium);
          } else {
            setAmountMedium("0");
          }

          if (item.amountLarge) {
            setAmountLarge(item.amountLarge);
          } else {
            setAmountLarge("0");
          }

          if (item.fpAmountSmall) {
            setFpAmountSmall(item.fpAmountSmall);
          } else {
            setFpAmountSmall("0");
          }

          if (item.fpAmountMedium) {
            setFpAmountMedium(item.fpAmountMedium);
          } else {
            setFpAmountMedium("0");
          }

          if (item.fpAmountLarge) {
            setFpAmountLarge(item.fpAmountLarge);
          } else {
            setFpAmountLarge("0");
          }

          setImage(item.image);

          setSelectedItemId(item.id);

          retrieveSelectedItemId(item.id);

          console.log("SELECTED ITEM: ", selectedItem);
          console.log("AMOUNT SMALL: ", amountSmall);
          console.log("AMOUNT MEDIUM: ", amountMedium);
          console.log("AMOUNT LARGE: ", amountLarge);
          console.log("PRODUCT IMAGE: ", image);
          console.log("ITEM ID: ", selectedItemId);
          //console.log('ITEM JSON' , JSON.stringify(selectedItems))
        }}
        backgroundColor={{ backgroundColor }}
        textColor={{ color }}
      />
    );
  };

  //Category Flatlist Components
  const CategoryItem = ({ item, onPress, backgroundColor, textColor }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.categoryContents, backgroundColor]}
    >
      <Text style={[styles.title, textColor]}>{item.category}</Text>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }) => {
    const backgroundColor =
      item.category === selectedId ? "#FFC000" : "#ffffe0";
    const color = item.category === selectedId ? "black" : "black";

    return (
      <CategoryItem
        item={item}
        onPress={() => {
          setSelectedId(item.category);
          console.log("SELECTED CATEGORY: ", selectedId);
          getItems(item.category);
        }}
        backgroundColor={{ backgroundColor }}
        textColor={{ color }}
      />
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS == "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS == "ios" ? 0 : 20}
      enabled={Platform.OS === "ios" ? true : false}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>
          Hi, Welcome to Cafe Vanleroe Menu Editor!
        </Text>
      </View>

      <View style={styles.menuEditorLayout}>
        <View style={styles.categoryView}>
          <Text style={styles.subheaderText}>Category</Text>
          <FlatList
            data={category}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            extraData={selectedId}
            keyboardShouldPersistTaps="always"
          />
        </View>
        <View style={styles.itemView}>
          <Text style={styles.subheaderText}>Items</Text>
          <FlatList
            data={selectedItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            extraData={selectedItem}
            numColumns={4}
            scrollEnabled={true}
            keyboardShouldPersistTaps="always"
          />
        </View>
      </View>
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={styles.footerLabelContainer}
          onPress={() => {
            //retrieveTotalNumberofDocuments()
            showModalAddItemVisible(true);
            //setNextId(0)
          }}
        >
          <MaterialCommunityIcons
            name="plus-circle"
            color="#FFC000"
            size={20}
          />
          <Text style={styles.footerText}>Add New Entry</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerLabelContainer}
          onPress={() => {
            if (selectedItem) {
              showModalEditItemVisible(true);
            } else {
              alert("No item selected.");
            }
          }}
        >
          <MaterialCommunityIcons
            name="pencil-circle"
            color="#FFC000"
            size={20}
          />
          <Text style={styles.footerText}>Edit Selected</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerLabelContainer}
          onPress={() => {
            if (selectedItem) {
              Alert.alert(
                "Do you want to delete this item?",
                "You are about to delete the selected item",
                [
                  {
                    text: "OK",
                    onPress: () =>
                      //Navigate to Home Screen
                      handleDelete(),
                  },
                  {
                    text: "CANCEL",
                    onPress: () =>
                      //Navigate to Home Screen
                      setConfirmDelete(!confirmDelete),
                  },
                ]
              );
            } else {
              alert("No item selected.");
            }
          }}
        >
          <MaterialCommunityIcons
            name="delete-circle"
            color="#FFC000"
            size={20}
          />
          <Text style={styles.footerText}>Delete Selected</Text>
        </TouchableOpacity>
      </View>

      {modalEditItemVisible && (
        <EditItemModal
          modalVisible={showModalEditItemVisible}
          selectedDocumentId={selectedDocumentId}
          selectedItem={selectedItem}
          amountSmall={amountSmall}
          amountMedium={amountMedium}
          amountLarge={amountLarge}
          fpAmountSmall={fpAmountSmall}
          fpAmountMedium={fpAmountMedium}
          fpAmountLarge={fpAmountLarge}
        />
      )}

      {modalAddItemVisible && (
        <AddItemModal modalVisible={showModalAddItemVisible} />
      )}
    </KeyboardAvoidingView>
  );
};

export default MenuEditorScreen;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    //paddingTop: '20%',
    flex: 1,
  },
  menuEditorLayout: {
    flexDirection: "row",
    height: "80%",
  },
  categoryContents: {
    padding: 20,
    marginVertical: 6,
    marginHorizontal: 16,
    borderRadius: 20,
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
  title: {
    fontSize: 15,
    fontWeight: "300",
  },
  categoryView: {
    //flex: 1,
    height: "100%",
    width: "30%",
  },
  itemView: {
    height: "100%",
    width: "70%",
  },
  headerContainer: {
    height: "8%",
    paddingTop: "1%",
    alignItems: "center",
    //flex: 1
  },
  footerContainer: {
    paddingTop: 20,
    flexDirection: "row",
    //justifyContent: 'center'
    //flex: 1
  },
  subheaderText: {
    fontSize: 20,
    fontWeight: "100",
    padding: 20,
  },
  footerLabelContainer: {
    flexDirection: "row",
    marginHorizontal: "10%",
    alignItems: "center",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "200",
  },
  footerText: {
    fontSize: 20,
    fontWeight: "200",
  },
  //Modal Area
  centeredView: {
    flex: 1,
    //justifyContent: "center",
    alignItems: "center",
    marginTop: "5%",
  },
  modalView: {
    margin: 20,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    width: "50%",
    height: "60%",
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalFooterContainer: {
    marginHorizontal: "10%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginHorizontal: "5%",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
    width: "40%",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
    flex: 2,
    padding: "5%",
    flexDirection: "row",
  },

  inputTextContainer: {
    paddingTop: 5,
    //paddingVertical: 10
  },
  input: {
    backgroundColor: "white",
    alignSelf: "stretch",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 15,
    width: "70%",
  },
  subInputContainer: {
    width: "100%",
  },
  modalInputTitle: {
    paddingHorizontal: 10,
    paddingVertical: 18,
  },
});
