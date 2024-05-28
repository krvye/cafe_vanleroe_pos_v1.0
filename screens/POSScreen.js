import React, { useState, useEffect } from "react";
import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  SectionList,
  Alert,
  Platform,
} from "react-native";
import { auth, firestore } from "../firebase";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { backgroundColor } from "react-native/Libraries/Components/View/ReactNativeStyleAttributes";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  getDocs,
  collection,
  where,
  query,
  updateDoc,
  doc,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import * as ScreenOrientation from "expo-screen-orientation";
import CheckoutModal from ".././components/CheckoutModal";

const POSScreen = ({ route, navigation }) => {
  async function changeScreenOrientation() {
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE
    );
  }

  //Order Items
  const [orderItems, setOrderItems] = useState([]);

  //Add Item to List
  const addItem = (
    category,
    size,
    price,
    name,
    addon,
    note,
    quantity,
    totalAmount
  ) => {
    setOrderItems([
      ...orderItems,
      {
        id: Math.floor(Math.random() * 100) + Date.now(),
        itemQuantity: quantity,
        itemCategory: category,
        itemSize: size,
        itemPrice: price,
        itemName: name,
        itemTotalAmount: totalAmount,
        addOns: addon,
        notes: note,
      },
    ]);

    console.log(orderItems);
  };

  //Modal parameters
  const [modalCheckoutVisible, showModalCheckoutVisible] = useState(false);
  const [modalAddItemVisible, showModalAddItemVisible] = useState(false);

  //Parameters
  const [selectedId, setSelectedId] = useState(null);
  const [selectedItems, setSelectedItems] = useState("");
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [totAmount, setTotAmount] = useState(0);
  const [subTotal, setSubTotal] = useState(0);
  const [isFoodPanda, setIsFoodPanda] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Regular");
  const [isOrderCompleted, setIsOrderCompleted] = useState(false);

  //Selected Item
  const [selectedItem, setSelectedItem] = useState(null);
  const [amountSmall, setAmountSmall] = useState(0);
  const [amountMedium, setAmountMedium] = useState(0);
  const [amountLarge, setAmountLarge] = useState(0);
  const [image, setImage] = useState(null);
  const [nextId, setNextId] = useState(null);

  const [category, setCategory] = useState("");
  const [orderModes, setOrderModes] = useState(null);
  const [addOnsList, setAddOnsList] = useState(null);
  const [menuConditions, setMenuConditions] = useState(null);
  const [notesList, setNotesList] = useState(null);

  //Overall constants
  const [isFoodDiscount, setIsFoodDiscount] = useState(false);
  const [isDrinkDiscount, setIsDrinkDiscount] = useState(false);

  //Item specification
  const [itemSize, setItemSize] = useState("N/A");
  const [itemPrice, setItemPrice] = useState("0");
  const [eligibleForDiscount, setEligibleForDiscount] = useState(false);
  const [orderCondition, setOrderCondition] = useState("N/A");
  const [addOns, setAddOns] = useState("N/A");
  const [itemNote, setItemNote] = useState("N/A");
  const [itemTotalAmount, setItemTotalAmount] = useState(0);
  const [tempTotalAmount, setTempTotalAmount] = useState(0);
  const [addOnTotal, setAddOnTotal] = useState(0);
  const [itemDiscount, setItemDiscount] = useState(0);
  const [itemNameDiscount, setItemNameDiscount] = useState(null);
  const [itemQuantity, setItemQuantity] = useState(1);

  //Constants
  const PREMIUM_COLLECTION = "Premium Collection";
  const HOT_COLD_DRINKS = "Hot/Cold Drinks";

  //Retrieve Add Ons
  const getAddOns = async () => {
    const colRef = collection(firestore, "addOnsList");
    const colSnapshot = await getDocs(colRef);
    setAddOnsList(colSnapshot.docs.map((doc) => doc.data()));
  };

  //Update Item Total when button selected
  useEffect(() => {
    //getItemDiscount()
    computeItemTotal();
  }, [itemPrice, addOnTotal, itemQuantity]);

  useEffect(() => {
    if (isOrderCompleted) {
      setSubTotal(0);
      setTotAmount(0);
      setItemDiscount(0);
      setItemNameDiscount(null);
      setOrderItems([]);
      setEligibleForDiscount(false);
    }
  }, [isOrderCompleted]);

  useEffect(() => {
    if (subTotal > 0) {
      setTotAmount(subTotal - itemDiscount);
    } else {
      setTotAmount(0);
    }
  }, [subTotal]);

  useEffect(() => {
    if (isFoodPanda) {
      setSelectedOption("Foodpanda");
    } else {
      setSelectedOption("Regular");
    }
  }, [isFoodPanda]);

  //Check if Eligible For Discount was modified
  useEffect(() => {
    //getTotalDiscount()
  }, [eligibleForDiscount]);

  //Update Total Amount
  const updateTotalAmount = async () => {
    setTotAmount(subTotal - itemDiscount);
  };

  //Compute for the total of the item minus the discount and with addons
  const computeItemTotal = async () => {
    if (itemQuantity === 1) {
      const itemTotal = parseInt(itemPrice.toString()) + addOnTotal;
      setItemTotalAmount(itemTotal);
      setTempTotalAmount(itemTotal);
    } else {
      if (addOns != "N/A") {
        alert("Add on is not applicable for items greater than 1");
        return;
      } else {
        const itemTotal = parseInt(itemPrice.toString()) * itemQuantity;
        setItemTotalAmount(itemTotal);
        setTempTotalAmount(itemTotal);
      }
    }
  };

  const getTotalDiscount = async () => {
    //const discountTotal = parseInt(itemPrice.toString()) * 0.20

    if (eligibleForDiscount) {
      alert("Discount Already Applied.");
      //setItemDiscount(0)
    } else {
      if (
        itemQuantity === 1 &&
        eligibleForDiscount === false &&
        !itemNameDiscount
      ) {
        //CHANGE-001
        const discountTotal = Math.round(
          parseInt(itemTotalAmount.toString()) * 0.2
        );

        setItemDiscount(discountTotal);
        setItemNameDiscount(selectedItem);
      }

      setEligibleForDiscount(true);
    }

    /*
        if(eligibleForDiscount){
            
            if(itemPrice === itemTotalAmount){
                setItemTotalAmount(itemTotalAmount - itemDiscount)

                //setItemDiscount(false)
            }
            
        }else{

            setItemTotalAmount(tempTotalAmount)
        }
        */
  };

  const getAddOnTotal = async (addOn) => {
    const addOnInt = parseInt(addOn.toString());
    setAddOnTotal(addOnTotal + addOnInt);
  };

  //Check for discount
  useEffect(() => {
    //getItemDiscount()
  }, [eligibleForDiscount]);

  //Retrieve Menu Condition
  const getMenuCondition = async () => {
    //const colRef = collection(firestore, 'menuCondition')
    //const colSnapshot = await getDocs(colRef)

    const q2 = query(
      collection(firestore, "menuCondition"),
      where("category", "==", selectedId)
    );

    const querySnapshot = await getDocs(q2);

    setMenuConditions(colSnapshot.docs.map((doc) => doc.data()));
  };

  //Retrieve Notes
  const getNotes = async () => {
    const colRef = collection(firestore, "notesList");
    const colSnapshot = await getDocs(colRef);
    setNotesList(colSnapshot.docs.map((doc) => doc.data()));
  };

  //Retrieve Categories
  const getCategory = async () => {
    const categoryCollection = collection(firestore, "category");
    const categorySnapshot = await getDocs(categoryCollection);
    setCategory(categorySnapshot.docs.map((doc) => doc.data()));
  };

  //Retrieve Categories
  const getOrderModes = async () => {
    const orderModeCollection = collection(firestore, "orderModes");
    const orderModeSnapshot = await getDocs(orderModeCollection);
    setOrderModes(orderModeSnapshot.docs.map((doc) => doc.data()));
  };

  //Retrieve Items
  const getItems = async (selectedCategory) => {
    console.log("ENTER ITEM FILTER");

    const q = query(
      collection(firestore, "menu"),
      where(
        "category",
        "==",
        selectedCategory.toString(),
        orderBy("product", "asc")
      )
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

    //Get Menu Condition
    if (
      selectedCategory.toString() === PREMIUM_COLLECTION ||
      selectedCategory.toString() === HOT_COLD_DRINKS
    ) {
      const q2 = query(
        collection(firestore, "menuCondition"),
        where("category", "==", selectedCategory.toString())
      );

      const querySnapshot2 = await getDocs(q2);

      setMenuConditions(querySnapshot2.docs.map((doc) => doc.data()));

      console.log("MENU CONDITION: ", menuConditions);
    } else {
      setMenuConditions(null);
    }
  };

  //Async Functions will load in Use Effect
  useEffect(() => {
    // write ysour code here, it's like componentWillMount
    getCategory();
    changeScreenOrientation();
    getOrderModes();
    getAddOns();

    getNotes();

    console.log("CATEGORIES: ", category);
    console.log("ORDER MODES: ", orderModes);
    console.log("ADD ONS: ", addOnsList);

    console.log("NOTES: ", notesList);

    //console.log("EDIT MODAL PARAMETER: " , modalEditItemVisible)
  }, []);

  //Cleanup Variables
  const cleanupVariables = async () => {
    setItemSize("N/A");
    setItemPrice("0");
    setOrderCondition("N/A");
    //setEligibleForDiscount(false)
    setAddOns("N/A");
    setAddOnTotal(0);
    setItemTotalAmount(0);
    setItemNote("N/A");
    setItemQuantity(1);
  };

  //Notes List
  const notesListRenderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.buttonPrice, { marginVertical: 6, width: "20%" }]}
      onPress={() => {
        if (itemNote === "N/A") {
          setItemNote(item.note.toString() + ",");
        } else {
          setItemNote(itemNote + item.note.toString() + ",");
        }

        console.log("NOTES: ", { itemNote });
      }}
    >
      <Text style={styles.textStyle}> {item.note}</Text>
    </TouchableOpacity>
  );

  //Add On List
  const addonListRenderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.buttonPrice, { marginVertical: 6, width: "30%" }]}
      onPress={() => {
        setAddOns(item.addOn.toString());

        if (addOns === "N/A") {
          setAddOns(item.addOn + ",");
        } else {
          setAddOns(addOns + item.addOn + ",");
        }

        getAddOnTotal(item.price);

        console.log("ADD ONS: ", addOns);
      }}
    >
      <Text style={styles.textStyle}>
        {" "}
        {item.addOn} - ₱{item.price}
      </Text>
    </TouchableOpacity>
  );

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

          if (isFoodPanda) {
            if (item.fpAmountSmall) {
              setAmountSmall(item.fpAmountSmall);
            } else {
              setAmountSmall("0");
            }

            if (item.fpAmountMedium) {
              setAmountMedium(item.fpAmountMedium);
            } else {
              setAmountMedium("0");
            }

            if (item.fpAmountLarge) {
              setAmountLarge(item.fpAmountLarge);
            } else {
              setAmountLarge("0");
            }
          } else {
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
          }

          setImage(item.image);

          setSelectedItemId(item.id);

          showModalAddItemVisible(true);

          //retrieveSelectedItemId(item.id)

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

  //Menu Condition Item
  const MenuConditionItem = ({ title }) => (
    <View style={{ marginVertical: 6 }}>
      <TouchableOpacity
        style={styles.buttonPrice}
        onPress={() => {
          //setEligibleForDiscount(true)
          setOrderCondition(title);

          if (itemNote === "N/A") {
            setItemNote(title.toString() + ",");
          } else {
            setItemNote(itemNote + title.toString() + ",");
          }
        }}
      >
        <Text style={styles.textStyle}> {title}</Text>
      </TouchableOpacity>
    </View>
  );

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

  //Modal Popup for Selected Item
  const SelectedItem = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalAddItemVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modalHeaderContainer}>
              <Text style={styles.headerText}>{selectedItem}</Text>
              <Text style={[styles.headerText, styles.bodyHeaderText]}>
                Total: {itemTotalAmount.toString()}
              </Text>
            </View>

            <ScrollView style={styles.modalBodyContainer}>
              <Text style={[styles.headerText, styles.bodyHeaderText]}>
                Size: {itemSize}, Price: {itemPrice}
              </Text>

              <View style={styles.modalRowContainer}>
                {amountSmall != "0" && (
                  <TouchableOpacity
                    style={styles.buttonPrice}
                    onPress={() => {
                      setItemSize("S");
                      setItemPrice(amountSmall);
                    }}
                  >
                    <Text style={styles.textStyle}> SMALL: {amountSmall}</Text>
                  </TouchableOpacity>
                )}

                {amountMedium != "0" && (
                  <TouchableOpacity
                    style={styles.buttonPrice}
                    onPress={() => {
                      setItemSize("M");
                      setItemPrice(amountMedium);
                    }}
                  >
                    <Text style={styles.textStyle}>MEDIUM: {amountMedium}</Text>
                  </TouchableOpacity>
                )}

                {amountLarge != "0" && (
                  <TouchableOpacity
                    style={styles.buttonPrice}
                    onPress={() => {
                      setItemSize("L");
                      setItemPrice(amountLarge);
                    }}
                  >
                    <Text style={styles.textStyle}>LARGE: {amountLarge}</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={[styles.headerText, styles.bodyHeaderText]}>
                Quantity
              </Text>

              <View style={styles.modalRowContainer}>
                <TouchableOpacity
                  style={styles.buttonQuantity}
                  onPress={() => {
                    //setEligibleForDiscount(true)
                    if (itemQuantity <= 1) {
                      setItemQuantity(1);
                    } else {
                      setItemQuantity(itemQuantity - 1);
                    }
                  }}
                >
                  <Text style={styles.textStyle}>-</Text>
                </TouchableOpacity>

                <Text
                  style={[
                    styles.headerText,
                    styles.bodyHeaderText,
                    { paddingRight: 20 },
                  ]}
                >
                  {itemQuantity}
                </Text>

                <TouchableOpacity
                  style={styles.buttonQuantity}
                  onPress={() => {
                    //setEligibleForDiscount(true)
                    setItemQuantity(itemQuantity + 1);
                  }}
                >
                  <Text style={styles.textStyle}>+</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.headerText, styles.bodyHeaderText]}>
                Condition: {orderCondition}
              </Text>
              <View style={styles.modalRowContainer}>
                {menuConditions != null && (
                  <SectionList
                    sections={menuConditions}
                    keyExtractor={(item, index) => item + index}
                    renderItem={({ item }) => (
                      <MenuConditionItem title={item} />
                    )}
                  />
                )}
              </View>
              <Text style={[styles.headerText, styles.bodyHeaderText]}>
                Add Ons: {addOns}
              </Text>
              <View
                style={[styles.modalRowContainer, styles.additionalModalParams]}
              >
                {itemQuantity.toString() === "1" &&
                  !isFoodPanda &&
                  selectedId != "Pastries" && (
                    <FlatList
                      data={addOnsList}
                      //horizontal={true}
                      renderItem={addonListRenderItem}
                      numColumns={3}
                      keyExtractor={(item) => item.id}
                      style={styles.additionalModalParams}
                    />
                  )}
              </View>
              <Text style={[styles.headerText, styles.bodyHeaderText]}>
                Notes: {itemNote}
              </Text>
              <View style={styles.modalRowContainerAddtl}>
                {!isFoodPanda && selectedId != "Pastries" && (
                  <FlatList
                    data={notesList}
                    //horizontal={true}
                    renderItem={notesListRenderItem}
                    numColumns={4}
                    keyExtractor={(item) => item.id}
                    style={styles.additionalModalParams}
                  />
                )}
              </View>

              <Text style={[styles.headerText, styles.bodyHeaderText]}>
                Eligible For Senior/PWD Discount: {itemDiscount}
              </Text>

              <View style={styles.modalRowContainer}>
                {itemQuantity.toString() === "1" && !isFoodPanda && (
                  <TouchableOpacity
                    style={styles.buttonPrice}
                    onPress={() => {
                      getTotalDiscount();
                      //setItemNameDiscount(selectedItem)
                      //setEligibleForDiscount(true)
                    }}
                  >
                    <Text style={styles.textStyle}>YES</Text>
                  </TouchableOpacity>
                )}

                {itemQuantity.toString() === "1" && !isFoodPanda && (
                  <TouchableOpacity
                    style={styles.buttonPrice}
                    onPress={() => {
                      setEligibleForDiscount(false);
                      setItemDiscount(0);
                      setItemNameDiscount();
                    }}
                  >
                    <Text style={styles.textStyle}>NO</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.modalFooterContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => {
                    if (itemTotalAmount > 0) {
                      addItem(
                        selectedId,
                        itemSize,
                        itemPrice,
                        selectedItem,
                        addOns,
                        itemNote,
                        itemQuantity,
                        itemTotalAmount
                      );
                      showModalAddItemVisible(!modalAddItemVisible);
                      setSubTotal(subTotal + itemTotalAmount);
                      //updateTotalAmount()
                      cleanupVariables();
                    } else {
                      alert("Please select size");
                    }
                  }}
                >
                  <Text style={styles.textStyle}>Add To Cart</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => {
                    showModalAddItemVisible(!modalAddItemVisible);
                    cleanupVariables();
                    //setItemDiscount(0)
                  }}
                >
                  <Text style={styles.textStyle}>Exit</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
          Hi! Welcome to Cafe Vanleroe POS - Waltermart Taytay!
        </Text>
      </View>

      <View style={styles.bodyContainer}>
        <View style={styles.categoryView}>
          <Text style={styles.subheaderText}>Category: {selectedOption}</Text>
          <View style={{ flexDirection: "row", alignSelf: "center" }}>
            <TouchableOpacity
              style={styles.choiceContainer}
              onPress={() => {
                setIsFoodPanda(false);
              }}
            >
              <Text>Regular</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.choiceContainer}
              onPress={() => {
                setIsFoodPanda(true);
              }}
            >
              <Text>Foodpanda {isFoodPanda}</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={category}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            extraData={selectedId}
            keyboardShouldPersistTaps="always"
          />
        </View>
        <View style={styles.itemView}>
          <FlatList
            data={selectedItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            extraData={selectedItem}
            numColumns={3}
            scrollEnabled={true}
            keyboardShouldPersistTaps="always"
          />
        </View>
        <View style={styles.orderDetailsView}>
          <Text style={styles.subheaderTextForCart}>Cart</Text>
          <View
            style={{
              flex: 0.7,
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <View style={{ flex: 4, marginTop: 5 }}>
              <Text
                style={{ alignSelf: "center", fontSize: 10, fontWeight: "300" }}
              >
                Item
              </Text>
            </View>
            <View style={{ flex: 1, marginTop: 5 }}>
              <Text
                style={{ alignSelf: "center", fontSize: 10, fontWeight: "300" }}
              >
                Price
              </Text>
            </View>
            <View style={{ flex: 1, marginTop: 5 }}>
              <Text
                style={{ alignSelf: "center", fontSize: 10, fontWeight: "300" }}
              >
                Size
              </Text>
            </View>
            <View style={{ flex: 1, marginTop: 5 }}>
              <Text
                style={{ alignSelf: "center", fontSize: 10, fontWeight: "300" }}
              >
                Quantity
              </Text>
            </View>
            <View style={{ flex: 1, marginTop: 5 }}>
              <Text
                style={{ alignSelf: "center", fontSize: 10, fontWeight: "300" }}
              >
                Total
              </Text>
            </View>
            <View style={{ flex: 1, marginTop: 5 }}>
              <Text
                style={{
                  alignSelf: "center",
                  fontSize: 10,
                  color: "#2b3f51",
                  fontWeight: "300",
                }}
              >
                X
              </Text>
            </View>
          </View>

          <View
            style={{
              //backgroundColor:'#415b76',
              flex: 9,
              justifyContent: "center",
              paddingLeft: 10,
            }}
          >
            <FlatList
              numColumns="1"
              keyExtractor={(item) => item.id}
              data={orderItems}
              //extraData={isRender}
              renderItem={({ item }) => (
                <View style={{ flexDirection: "row" }}>
                  <View style={{ flex: 4 }}>
                    <Text style={{ fontSize: 10 }}>{item.itemName}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10, alignSelf: "center" }}>
                      P{item.itemPrice}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10, alignSelf: "center" }}>
                      {item.itemSize}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10, alignSelf: "center" }}>
                      {item.itemQuantity}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10, alignSelf: "center" }}>
                      P{item.itemTotalAmount}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert(
                          "Confirm item removal",
                          "Do you want to delete this item?",
                          [
                            {
                              text: "Yes",
                              onPress: () => {
                                for (let [
                                  i,
                                  orderItem,
                                ] of orderItems.entries()) {
                                  if (orderItem.id == item.id) {
                                    setSubTotal(
                                      subTotal - item.itemTotalAmount
                                    );
                                    orderItems.splice(i, 1);
                                  }
                                }
                              },
                            },
                            { text: "No" },
                          ]
                        );
                      }}
                    >
                      <MaterialCommunityIcons
                        name="alpha-x-circle"
                        color="red"
                        size={20}
                        style={{ alignSelf: "center" }}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>

          <Text
            style={{ alignSelf: "center", fontSize: 10, fontWeight: "300" }}
          >
            Current Discount applied
          </Text>
          <Text
            style={{ alignSelf: "center", fontSize: 10, fontWeight: "300" }}
          >
            Discount Amount: {itemDiscount}
          </Text>
          <Text
            style={{ alignSelf: "center", fontSize: 10, fontWeight: "300" }}
          >
            Applied on Item: {itemNameDiscount}
          </Text>
          <Text style={styles.subheaderTextForCart}>Subtotal: {subTotal}</Text>
          <Text style={styles.subheaderTextForCart}>Total: {totAmount}</Text>
        </View>
      </View>

      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={styles.footerLabelContainer}
          onPress={() => {
            if (totAmount > 0) {
              showModalCheckoutVisible(true);
              setIsOrderCompleted(false);
            } else {
              alert("Please input order first before checking out");
            }
          }}
        >
          <MaterialCommunityIcons name="cart" color="#FFC000" size={23} />
          <Text style={styles.footerText}>Checkout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerLabelContainer}
          onPress={() => {
            Alert.alert(
              "Confirm cancel",
              "Do you want to cancel this transaction?",
              [
                {
                  text: "Yes",
                  onPress: () => {
                    setSubTotal(0);
                    setTotAmount(0);
                    setItemDiscount(0);
                    setItemNameDiscount(null);
                    setOrderItems([]);
                    setEligibleForDiscount(false);
                  },
                },
                { text: "No" },
              ]
            );
          }}
        >
          <MaterialCommunityIcons
            name="close-circle"
            color="#FFC000"
            size={23}
          />
          <Text style={styles.footerText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerLabelContainer}
          onPress={() => {
            Alert.alert("Confirm logout", "Do you want to logout?", [
              {
                text: "Yes",
                onPress: () => {
                  navigation.navigate("Login");
                },
              },
              { text: "No" },
            ]);
          }}
        >
          <MaterialCommunityIcons
            name="logout-variant"
            color="#FFC000"
            size={23}
          />
          <Text style={styles.footerText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <SelectedItem />

      {modalCheckoutVisible && (
        <CheckoutModal
          modalVisible={showModalCheckoutVisible}
          orderItems={orderItems}
          subTotal={subTotal}
          discountTotal={itemDiscount}
          totAmount={totAmount}
          isFoodPanda={isFoodPanda}
          isOrderCompleted={setIsOrderCompleted}
        />
      )}
    </KeyboardAvoidingView>
  );
};

export default POSScreen;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: "2%",
    flex: 1,
    paddingHorizontal: 5,
  },
  bodyContainer: {
    flexDirection: "row",
    flex: 11,
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
    width: "31%",
    height: 180,
  },
  title: {
    fontSize: 15,
    fontWeight: "300",
  },
  categoryView: {
    //flex: 1,
    height: "100%",
    width: "20%",
    //backgroundColor:'blue'
  },
  itemView: {
    height: "100%",
    width: "50%",
    //backgroundColor:'yellow'
  },
  orderDetailsView: {
    height: "100%",
    width: "30%",
    backgroundColor: "#e2e2e2",
    borderRadius: 20,
  },
  headerContainer: {
    //height: '8%',
    paddingTop: "1%",
    alignItems: "center",
    flex: 1,
  },
  footerContainer: {
    paddingTop: 20,
    flex: 1,
    flexDirection: "row",
    //justifyContent: 'center'
    //flex: 1
  },
  subheaderText: {
    fontSize: 20,
    fontWeight: "100",
    padding: 20,
  },
  subheaderTextForCart: {
    fontSize: 20,
    fontWeight: "100",
    paddingLeft: 20,
    paddingTop: 5,
    flex: 1,
  },
  footerLabelContainer: {
    flexDirection: "row",
    marginHorizontal: "10%",
    //alignItems: 'center'
  },
  headerText: {
    fontSize: 20,
    fontWeight: "200",
    //textAlign: 'center'
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
    //marginTop: '5%'
  },
  modalView: {
    margin: 20,
    //backgroundColor: "#EADDCA",
    backgroundColor: "#fcfafa",
    borderRadius: 20,
    width: "70%",
    height: "70%",
    paddingVertical: 15,
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
  modalHeaderContainer: {
    flex: 1,
    //justifyContent: 'center'
    //paddingTop: 20
    //backgroundColor: 'blue'
  },
  modalBodyContainer: {
    //flex: 18,
    height: "70%",
    width: "100%",
    paddingHorizontal: 20,
    //alignItems: 'flex-start',
    //backgroundColor: '#fcfafa'
  },
  modalFooterContainer: {
    flex: 1,
    //width: '100%',
    //height: '100%',
    alignItems: "center",
    flexDirection: "row",
    paddingTop: 10,
    //backgroundColor: 'green'
  },
  modalRowContainer: {
    flexDirection: "row",
    width: "60%",
  },
  modalRowContainerAddtl: {
    flexDirection: "row",
    width: "90%",
  },
  buttonPrice: {
    backgroundColor: "#2196F3",
    width: "50%",
    borderRadius: 10,
    padding: 10,
    //elevation: 2,
    marginRight: "5%",
  },
  bodyHeaderText: {
    paddingVertical: 10,
    alignSelf: "flex-start",
  },
  additionalModalParams: {
    width: "100%",
  },
  buttonQuantity: {
    backgroundColor: "#2196F3",
    //width: '50%',
    borderRadius: 10,
    padding: 10,
    //elevation: 2,
    marginRight: "5%",
  },
  choiceContainer: {
    backgroundColor: "#ffffe0",
    padding: 10,
    margin: 5,
    borderRadius: 10,
  },
});
