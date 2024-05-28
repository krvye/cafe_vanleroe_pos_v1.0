import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList,Modal,Alert, KeyboardAvoidingView,ScrollView,SafeAreaView, Platform } from 'react-native'
import { firestore } from '../firebase'
import { updateDoc, addDoc, collection,orderBy, getDocs, query, where } from "firebase/firestore";

const AddItemModal = (props, {modalClose}) => {

    const [modalAddItemVisible, showModalAddItemVisible] = useState(true)

    //Parameters
    const [selectedCategory , setSelectedCategory] = useState(null)
    const [itemName , setItemName] = useState(null)
    
    //Regular Menu Items
    const [priceSmall , setPriceSmall] = useState('0')
    const [priceMedium , setPriceMedium] = useState('0')
    const [priceLarge , setPriceLarge] = useState('0')

    //Foodpanda Menu Items
    const [fpPriceSmall , setFpPriceSmall] = useState('0')
    const [fpPriceMedium , setFpPriceMedium] = useState('0')
    const [fpPriceLarge , setFpPriceLarge] = useState('0')

    const [itemId , setItemId] = useState(null)
    const [errorsPersist, setErrorsPersists] = useState(true)
    const [isDuplicate, setIsDuplicate] = useState(false)

    //Retrieve Next Item
    const retrieveNextItemId = async () => {
        const menuRef = collection(firestore, "menu")

        const q = query(menuRef, orderBy("id", "asc"));

        const querySnapshot = await getDocs(q);

        if(querySnapshot){
            querySnapshot.docs.map(
                doc => {

                    var nextItemNo = parseInt(doc.data().id) + 1

                    setItemId(nextItemNo)

                    console.log('NEXT ID: ' , itemId)
                    return
            })
        }
    }

    const checkForDuplicateId = async () => {
        const q = query(collection(firestore, "menu"), where("id", "==", itemId))

        const querySnapshot = await getDocs(q);

        if(querySnapshot){
            setIsDuplicate(true)
        }
    }

    //useEffect here
    useEffect(() => {
        retrieveNextItemId()  
    }, [])


    //Confirm button from Modal
    const confirmChanges = async () => {
        //const docRef = doc(firestore, "menu", documentId); //documentReference

        if(!priceSmall){
            setPriceSmall('0')
        }

        if(!priceMedium){
            setPriceMedium('0')
        }

        if(!priceLarge){
            setPriceLarge('0')
        }

        if(!fpPriceSmall){
            setFpPriceSmall('0')
        }

        if(!fpPriceMedium){
            setFpPriceMedium('0')
        }

        if(!fpPriceLarge){
            setFpPriceLarge('0')
        }

        if(!itemName){
            alert('Name cannot be empty')
            setErrorsPersists(true)
            return;
        }else{
            setErrorsPersists(false)
        }

        if(selectedCategory && itemName && priceSmall 
            && priceMedium && priceLarge && itemId){
            
            //Check for duplicate id
            checkForDuplicateId()

            if(isDuplicate){
                alert('Duplicate menu item id')
                return
            }else{
                const docRef = await addDoc(collection(firestore, "menu"), {
                    amountSmall: parseInt(priceSmall.toString()),
                    amountMedium: parseInt(priceMedium,toString()),
                    amountLarge: parseInt(priceLarge.toString()),
                    fpAmountSmall: parseInt(fpPriceSmall.toString()),
                    fpAmountMedium: parseInt(fpPriceMedium.toString()),
                    fpAmountLarge: parseInt(fpPriceLarge.toString()),
                    category: selectedCategory.toString(),
                    id: parseInt(itemId.toString()),
                    image: '',
                    product: itemName.toString(),
                    remark1: '',
                    remark2: '',
                });

                //alert('Item added successfully. Click OK to close')

                Alert.alert(
                    "Add Item Successful",
                    "Please click OK to continue.",
                    [
                        {text: "OK", 
                            onPress: () => //Navigate to Home Screen
                            props.modalVisible(false)
                        }
                    ]
                ) 
                
            }
            

        }

        
    }

    return(
        <Modal
        animationType="slide"
        transparent={true}
        visible={modalAddItemVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          
        }}>
            <SafeAreaView 
                style={styles.centeredView}
                behavior={Platform.OS == "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS == "ios" ? 0 : 20}
                enabled={Platform.OS === "ios" ? true : false}
            >
                <KeyboardAvoidingView style={styles.modalView}>
                   
                    <ScrollView>
                    <View style = {{flex:1}}>
                        <Text style={styles.headerText}>Add New Item</Text>
                    </View>
                    <View style={styles.inputContainer}>
                        
                        <View style = {styles.inputTextContainer}>

                            <Text style = {[styles.title, styles.modalInputTitle]}>Category: </Text>
                            <Text style = {[styles.title, styles.modalInputTitle]}>Item Name: </Text>
                            <Text style = {[styles.title, styles.modalInputTitle]}>Price (Small): </Text>
                            <Text style = {[styles.title, styles.modalInputTitle]}>Price (Medium): </Text>
                            <Text style = {[styles.title, styles.modalInputTitle]}>Price (Large): </Text>

                            <Text style = {[styles.title, styles.modalInputTitleFp]}>Food Panda Price (Small): </Text>
                            <Text style = {[styles.title, styles.modalInputTitleFp]}>Food Panda Price (Medium): </Text>
                            <Text style = {[styles.title, styles.modalInputTitleFp]}>Food Panda Price (Large): </Text>
                            
                            <Text style = {[styles.title, styles.modalInputTitle]}>Item Id: </Text>
                        </View>

                        <View style = {styles.subInputContainer}>

                            <TextInput
                                placeholder='Click to set category'
                                value={selectedCategory}
                                onChangeText={text => setSelectedCategory(text)}
                                style={styles.input}
                            />

                            <TextInput
                                placeholder='Item Name'
                                value={itemName}
                                onChangeText={text => setItemName(text)}
                                style={styles.input}
                            />

                            <TextInput
                                placeholder='Price (Small)'
                                value={priceSmall}
                                onChangeText={text => setPriceSmall(text)}
                                style={styles.input}
                            />

                            <TextInput
                                placeholder='Price (Medium)'
                                value={priceMedium}
                                onChangeText={text => setPriceMedium(text)}
                                style={styles.input}
                            />

                            <TextInput
                                placeholder='Price (Large)'
                                value={priceLarge}
                                onChangeText={text => setPriceLarge(text)}
                                style={styles.input}
                            />

                            <TextInput
                                placeholder='Food Panda Price (Small)'
                                value={fpPriceSmall}
                                onChangeText={text => setFpPriceSmall(text)}
                                style={styles.inputFp}
                            />

                            <TextInput
                                placeholder='Food Panda  Price (Medium)'
                                value={fpPriceMedium}
                                onChangeText={text => setFpPriceMedium(text)}
                                style={styles.inputFp}
                            />

                            <TextInput
                                placeholder='Food Panda Price (Large)'
                                value={fpPriceLarge}
                                onChangeText={text => setFpPriceLarge(text)}
                                style={styles.inputFp}
                            />

                            <Text style = {[styles.title, styles.modalInputTitle]}>{itemId} </Text>

                        </View>
                        
                    </View>
                    </ScrollView>

                    <View style = {styles.footerContainer}>

                        <TouchableOpacity
                        style={[styles.button, styles.buttonClose]}
                        onPress={() => 
                            {
                                confirmChanges()
                            }
                        }
                        >
                            <Text style={styles.textStyle}>Confirm</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                        style={[styles.button, styles.buttonClose]}
                        onPress={() => 
                            {
                                props.modalVisible(false)
                            }
                        }>
                            <Text style={styles.textStyle}>Exit</Text>
                        </TouchableOpacity>

                    </View>

                </KeyboardAvoidingView>

            </SafeAreaView>

        </Modal>
    )
}

export default AddItemModal

const styles = StyleSheet.create({
    container:{
        justifyContent: 'center',
        alignItems: 'center',
        //paddingTop: '20%',
        flex: 1

    },
    menuEditorLayout:{
        flexDirection: 'row',
        height:'80%'
    },
    categoryContents: {
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 20
    },
    itemContents: {
        padding: 20,
        marginVertical: '1%',
        marginHorizontal: '1%',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems:'center',
        width: 170,
        height: 200
    },
    title: {
        fontSize: 15,
        fontWeight: '300'
    },
    categoryView: {
        //flex: 1,
        height: '100%',
        width: '30%'
    },
    itemView: {
        height: '100%',
        width: '70%'
    },
    headerContainer:{
        height: '5%',
        paddingTop: '1%',
        alignItems: 'center'
        //flex: 1
    },
    footerContainer:{
        paddingTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        alignItems:'center'
        //flex: 1
    },
    subheaderText:{
        fontSize: 20,
        fontWeight: '100',
        padding: 20
    },
    footerLabelContainer:{
        flexDirection: 'row',
        marginHorizontal: '10%',
        alignItems: 'center'
    },
    headerText:{
        fontSize: 20,
        fontWeight: '200'
    },
    footerText:{
        fontSize: 20,
        fontWeight: '200'
    },
    //Modal Area
    centeredView: {
        flex: 1,
        //justifyContent: "center",
        alignItems: "center",
        marginTop: '5%'
    },
    modalView: {
        margin: 20,
        backgroundColor: "#F5F5F5",
        borderRadius: 20,
        width: '70%',
        height: '100%',
        padding: 35,
        //alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        flex:1
    },
    modalFooterContainer:{
       
    },
    button: {
        borderRadius: 10,
        padding: 10,   
        elevation: 2,
        marginHorizontal: '5%',
    },
    buttonClose: {
        backgroundColor: "#2196F3",
        width: '40%',
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    },
    inputContainer:{
        width: '100%',
        flex: 5,
        //padding: '5%',
        flexDirection: 'row'
    },

    inputTextContainer:{
        paddingTop: 5,
        //paddingVertical: 10
    },
    input:{
        backgroundColor:'#ffffe0',
        alignSelf: 'stretch',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 10,
        width: '50%'
    },
    inputFp:{
        backgroundColor:'#FF1493',
        alignSelf: 'stretch',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 10,
        width: '50%'
    },
    subInputContainer:{
        width: '100%'
    },
    modalInputTitle: {
        paddingHorizontal: 10,
        paddingVertical : 14,
    },
    modalInputTitleFp: {
        paddingHorizontal: 10,
        paddingVertical : 14,
        color:'#FF1493'
    }

})