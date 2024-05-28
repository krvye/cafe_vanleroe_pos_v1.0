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
  onSnapshot,
} from "firebase/firestore";
import * as ScreenOrientation from "expo-screen-orientation";
import CheckoutModal from ".././components/CheckoutModal";

const OrderQueueScreen = ({ route, navigation }) => {
  //Parameters

  const [totalSales, setTotalSales] = useState(0);
  const [totalPersonCount, setTotalPersonCount] = useState(0);
  const [queueType, setQueueType] = useState("MAKE");
  const [orders, setOrders] = useState(null);
  const [ordersForTotal, setOrdersForTotal] = useState(null);
  const [trigger, setTrigger] = useState("false");
  const [foodpandaTotal, setFoodPandaTotal] = useState(0);
  const [gcashTotal, setGcashTotal] = useState(0);
  const [cashTotal, setCashTotal] = useState(0);
  //CHANGE-001
  const [foodpandaCount, setFoodpandaCount] = useState(0);

  var today = new Date();

  var date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  var time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

  function getOrders() {
    const orderQuery = query(
      collection(firestore, "orders"),
      where("orderDate", "==", date.trim()),
      where("orderStatus", "==", queueType.trim())
    );
    //const orderQuery = query(collection(firestore, "orders"), where("orderStatus", "==", "MAKE"));

    onSnapshot(orderQuery, (querySnapshot) => {
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, data: doc.data() });
      });

      setOrders(items);
      //console.log("ORDERS: " + JSON.stringify(orders))
    });
  }

  function getOrderTotal() {
    const orderQuery = query(
      collection(firestore, "orders"),
      where("orderDate", "==", date.trim())
    );
    //const orderQuery = query(collection(firestore, "orders"), where("orderDate", "==", "2023-2-24"));

    onSnapshot(orderQuery, (querySnapshot) => {
      const items = [];

      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, data: doc.data() });
      });
      setOrdersForTotal(items);
      console.log("ORDERS: " + JSON.stringify(orders));
      setTrigger("true");
    });
  }

  useEffect(() => {
    if (trigger === "true") {
      const totalAmt = ordersForTotal.reduce((currentTotal, order) => {
        return order.data.totalAmount + currentTotal;
      }, 0);

      setTotalSales(totalAmt);

      const foodpandaAmount = ordersForTotal.reduce((currentTotal, order) => {
        console.log("MODE OF PAYMENT: " + order.data.modeOfPayment);
        if (order.data.modeOfPayment.trim() === "FP") {
          currentTotal = currentTotal + order.data.totalAmount;
        }

        return currentTotal;
      }, 0);

      const fpCount = ordersForTotal.reduce((currentTotal, order) => {
        if (order.data.modeOfPayment.trim() === "FP") {
          currentTotal = currentTotal + 1;
        }

        return currentTotal;
      }, 0);

      setFoodpandaCount(fpCount);
      setFoodPandaTotal(foodpandaAmount);

      const cashAmount = ordersForTotal.reduce((currentTotal, order) => {
        if (order.data.modeOfPayment.trim() === "CASH") {
          currentTotal = currentTotal + order.data.totalAmount;
        }

        return currentTotal;
      }, 0);

      setCashTotal(cashAmount);

      const gcashAmount = ordersForTotal.reduce((currentTotal, order) => {
        if (order.data.modeOfPayment.trim() === "GCASH") {
          currentTotal = currentTotal + order.data.totalAmount;
        }

        return currentTotal;
      }, 0);

      setGcashTotal(gcashAmount);

      const count = Object.keys(ordersForTotal).length;

      setTotalPersonCount(count);

      setTrigger("false");
    }
  }, [trigger]);

  //On load, get orders in MAKE status
  useEffect(() => {
    getOrders();
    getOrderTotal();
  }, []);

  useEffect(() => {
    getOrders();
  }, [queueType]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS == "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS == "ios" ? 0 : 20}
      enabled={Platform.OS === "ios" ? true : false}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>
          Hi! Welcome to Cafe Vanleroe Order Queue - Waltermart Taytay!
        </Text>
      </View>

      <View style={styles.bodyContainer}>
        <View style={{ flex: 2 }}>
          <View
            style={{
              flex: 2,
              alignSelf: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <Text style={styles.subheaderText}>
              Total Sales for {date}: P{totalSales}
            </Text>
            <Text style={styles.subheaderText}>
              Total person count: {totalPersonCount}
            </Text>
            <Text style={styles.subheaderText}>Cash: P{cashTotal}</Text>
            <Text style={styles.subheaderText}>Gcash: P{gcashTotal}</Text>
            <Text style={styles.subheaderText}>
              Foodpanda: P{foodpandaTotal}
            </Text>
            <Text style={styles.subheaderText}>
              Foodpanda count: {foodpandaCount}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              alignSelf: "center",
              justifyContent: "center",
              marginLeft: 20,
              flexDirection: "row",
            }}
          >
            <TouchableOpacity
              style={styles.choiceContainer}
              onPress={() => {
                setQueueType("DONE");
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "600" }}>Done</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.choiceContainer}
              onPress={() => {
                setQueueType("MAKE");
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "600" }}>Make</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 6 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.subheaderText}>
                Displaying {queueType} orders
              </Text>
            </View>
            <View style={{ flex: 9 }}>
              <FlatList
                numColumns="3"
                keyExtractor={(item) => item.id}
                data={orders}
                initialNumToRender={6}
                maxToRenderPerBatch={3}
                //extraData={isRender}
                renderItem={({ item }) => (
                  <View style={styles.view}>
                    <View style={{ flex: 1, flexDirection: "row" }}>
                      {/*<View style = {{flex: 1, backgroundColor:'red'}}>
                                            <Text style={{fontSize:20, alignSelf:'center', justifyContent:'center',textAlign:'center',color:'white',marginTop:5}}>{item.data.consumeMethod}</Text>
                                </View>*/}
                      <View style={{ flex: 3, backgroundColor: "gold" }}>
                        <Text
                          style={{
                            fontSize: 20,
                            alignSelf: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            marginTop: 5,
                          }}
                        >
                          {item.data.customerName}
                        </Text>
                      </View>
                    </View>
                    <View style={{ flex: 1, flexDirection: "row" }}>
                      <View style={{ flex: 1, backgroundColor: "#686868" }}>
                        <Text
                          style={{
                            fontSize: 15,
                            alignSelf: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            color: "white",
                            marginTop: 5,
                          }}
                        >
                          Payment: {item.data.modeOfPayment}
                        </Text>
                      </View>
                      <View style={{ flex: 1, backgroundColor: "#3b3b3b" }}>
                        <Text
                          style={{
                            fontSize: 15,
                            alignSelf: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            marginTop: 5,
                            color: "white",
                          }}
                        >
                          Change: ₱{item.data.orderChange}
                        </Text>
                      </View>
                    </View>
                    <View style={{ flex: 5, marginTop: 10 }}>
                      {Object.keys(item.data.orderItems).map((v, i) => (
                        <View
                          style={{
                            borderBottomColor: "gray",
                            borderBottomWidth: 1,
                            paddingBottom: 3,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 15,
                              alignSelf: "center",
                              justifyContent: "center",
                              textAlign: "center",
                            }}
                          >
                            {item.data.orderItems[v].itemName}:{" "}
                            {item.data.orderItems[v].itemSize} x{" "}
                            {item.data.orderItems[v].itemQuantity}
                            {"\n"}
                            Add Ons: {item.data.orderItems[v].addOns}
                            {"\n"}
                            Notes: {item.data.orderItems[v].notes}
                          </Text>
                        </View>
                      ))}

                      <Text
                        style={{
                          fontSize: 15,
                          alignSelf: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          marginTop: 5,
                        }}
                      >
                        Retekess Number: {item.data.retekessNumber}
                      </Text>
                      <Text
                        style={{
                          fontSize: 15,
                          alignSelf: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          marginTop: 5,
                        }}
                      >
                        {item.data.consumeMethod}
                      </Text>
                      <Text
                        style={{
                          fontSize: 10,
                          alignSelf: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          marginTop: 5,
                        }}
                      >
                        Total Amount: P{item.data.totalAmount}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        paddingTop: 10,
                        flex: 1,
                        marginBottom: 5,
                      }}
                    >
                      {queueType === "MAKE" && (
                        <View
                          style={{
                            flex: 1,
                            flexDirection: "row",
                            backgroundColor: "red",
                            justifyContent: "center",
                            paddingTop: 3,
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => {
                              const docRef = doc(firestore, "orders", item.id);

                              updateDoc(docRef, {
                                customerName: item.data.customerName,
                                modeOfPayment: item.data.modeOfPayment,
                                orderDate: item.data.orderDate + "X",
                                orderItems: item.data.orderItems,
                                orderMode: item.data.orderMode,
                                orderTime: item.data.orderTime,
                                orderChange: item.data.orderChange,
                                orderNo: item.data.orderNo,
                                orderStatus: "VOID",
                                totalAmount: item.data.totalAmount,
                                discountAmount: item.data.discountAmount,
                                retekessNumber: item.data.retekessNumber,
                                consumeMethod: item.data.consumeMethod,
                              });

                              getOrderTotal();
                              Alert.alert("Order cancelled");
                            }}
                          >
                            <Text style={styles.voidText}>VOID</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                      {queueType === "MAKE" && (
                        <View
                          style={{
                            flex: 1,
                            flexDirection: "row",
                            backgroundColor: "gold",
                            justifyContent: "center",
                            paddingTop: 3,
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => {
                              const docRef = doc(firestore, "orders", item.id);

                              updateDoc(docRef, {
                                customerName: item.data.customerName,
                                modeOfPayment: item.data.modeOfPayment,
                                orderDate: item.data.orderDate,
                                orderItems: item.data.orderItems,
                                orderMode: item.data.orderMode,
                                orderTime: item.data.orderTime,
                                orderChange: item.data.orderChange,
                                orderNo: item.data.orderNo,
                                orderStatus: "DONE",
                                totalAmount: item.data.totalAmount,
                                discountAmount: item.data.discountAmount,
                                retekessNumber: item.data.retekessNumber,
                                consumeMethod: item.data.consumeMethod,
                              });

                              getOrderTotal();
                              Alert.alert("Order completed");
                            }}
                          >
                            <Text style={styles.sizeItemText}>DONE</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footerContainer}>
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
    </KeyboardAvoidingView>
  );
};

export default OrderQueueScreen;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: "2%",
    flex: 1,
    paddingHorizontal: 5,
  },
  headerContainer: {
    //height: '8%',
    paddingTop: "1%",
    alignItems: "center",
    flex: 1,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "700",
    //textAlign: 'center'
  },
  bodyContainer: {
    flexDirection: "row",
    flex: 7,
  },
  subheaderText: {
    fontSize: 15,
    fontWeight: "500",
    alignSelf: "center",
  },
  choiceContainer: {
    backgroundColor: "#ffffe0",
    //padding: 15,
    margin: 5,
    borderRadius: 10,
    width: "30%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  view: {
    backgroundColor: "#f5f5fa",
    width: 310,
    //height: 300,
    flexDirection: "column",
    alignSelf: "center",
    marginTop: 5,
    flexWrap: "wrap",
    paddingLeft: 5,
    paddingRight: 5,
    alignItems: "center",
    alignContent: "center",
    justifyContent: "center",
    marginRight: 5,
  },
  footerContainer: {
    //paddingTop: 5,
    flex: 1,
    flexDirection: "row",
    //justifyContent: 'center'
    //flex: 1
  },
  footerLabelContainer: {
    flexDirection: "row",
    //marginHorizontal: '10%',
    //alignItems:'baseline'
    alignItems: "center",
  },
});
