import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList,Modal,Alert, KeyboardAvoidingView,ScrollView, Platform } from 'react-native'
import { firestore } from '../firebase'
import { updateDoc, doc } from "firebase/firestore";

const EditItemModal = (props, {modalClose}) => {
    
    const [modalEditItemVisible, showModalEditItemVisible] = useState(true)
    const [selectedDocumentId, setSelectedDocumentId] = useState(props.selectedDocumentId )
    const [selectedItem, setSelectedItem] = useState(props.selectedItem);
    const [amountSmall, setAmountSmall] = useState(props.amountSmall);
    const [amountMedium, setAmountMedium] = useState(props.amountMedium)
    const [amountLarge, setAmountLarge] = useState(props.amountLarge);

    const [fpAmountSmall, setFpAmountSmall] = useState(props.fpAmountSmall);
    const [fpAmountMedium, setFpAmountMedium] = useState(props.fpAmountMedium)
    const [fpAmountLarge, setFpAmountLarge] = useState(props.fpAmountLarge);

    console.log('MODAL OPEN: ' , modalEditItemVisible)

    //Confirm button from Modal
    const confirmChanges = async (documentId) => {
        const docRef = doc(firestore, "menu", documentId); //documentReference

        await updateDoc(docRef, {
            "amountSmall": parseInt(amountSmall.toString()),
            "amountMedium": parseInt(amountMedium.toString()) ,
            "amountLarge": parseInt(amountLarge.toString()) ,
            "product" : selectedItem.toString(),
            "fpAmountSmall" : parseInt(fpAmountSmall.toString()),
            "fpAmountMedium" : parseInt(fpAmountMedium.toString()),
            "fpAmountLarge" : parseInt(fpAmountLarge.toString()),
        });
    }

    useEffect(() => {
        console.log('PROPS UPDATED')
        showModalEditItemVisible(props.modalVisible)
    }, [props.modalVisible])

    return(
        <Modal
        animationType="slide"
        transparent={true}
        visible={modalEditItemVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          
        }}
        
        >

        <KeyboardAvoidingView 
                style={styles.centeredView}
                behavior={Platform.OS == "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS == "ios" ? 0 : 20}
                enabled={Platform.OS === "ios" ? true : false}
        >
          <View style={styles.modalView}>
            <View>
                <Text style={styles.headerText}>Edit Item: {selectedItem}</Text>
            </View>
            <ScrollView>
            <View style={styles.inputContainer}>
                
                <View style = {styles.inputTextContainer}>
                    <Text style = {[styles.title, styles.modalInputTitle]}>Item Name: </Text>
                    <Text style = {[styles.title, styles.modalInputTitle]}>Price (Small): </Text>
                    <Text style = {[styles.title, styles.modalInputTitle]}>Price (Medium): </Text>
                    <Text style = {[styles.title, styles.modalInputTitle]}>Price (Large): </Text>
                    <Text style = {[styles.title, styles.modalInputTitleFp]}>Food Panda Price (Small): </Text>
                    <Text style = {[styles.title, styles.modalInputTitleFp]}>Food Panda Price (Medium): </Text>
                    <Text style = {[styles.title, styles.modalInputTitleFp]}>Food Panda Price (Large): </Text>
                </View>

                <View style = {styles.subInputContainer}>

                    <TextInput
                        placeholder='Item Name'
                        value={selectedItem}
                        onChangeText={text => setSelectedItem(text)}
                        style={styles.input}
                      
                    />
                
                    <TextInput
                        placeholder='Price (Small)'
                        value={amountSmall.toString()}
                        onChangeText={text => setAmountSmall(text)}
                        style={styles.input}
                    />
                
                    <TextInput
                        placeholder='Price (Medium)'
                        value={amountMedium.toString()}
                        onChangeText={text => setAmountMedium(text)}
                        style={styles.input}
                    />
                
                    <TextInput
                        placeholder='Price (Large)'
                        value={amountLarge.toString()}
                        onChangeText={text => setAmountLarge(text)}
                        style={styles.input}
                    />

                    <TextInput
                        placeholder='Food Panda Price (Small)'
                        value={fpAmountSmall.toString()}
                        onChangeText={text => setFpAmountSmall(text)}
                        style={styles.inputFp}
                    />

                    <TextInput
                        placeholder='Food Panda  Price (Medium)'
                        value={fpAmountMedium.toString()}
                        onChangeText={text => setFpAmountMedium(text)}
                        style={styles.inputFp}
                    />

                    <TextInput
                        placeholder='Food Panda Price (Large)'
                        value={fpAmountLarge.toString()}
                        onChangeText={text => setFpAmountLarge(text)}
                        style={styles.inputFp}
                    />

                
                </View>
            </View>

            </ScrollView>

            <View style = {[styles.footerContainer,styles.modalFooterContainer]}>
                <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => 
                    {
                        confirmChanges(selectedDocumentId)

                        //Alert for Successful Login
                        Alert.alert(
                            "Changes Applied",
                            "Please click OK to continue. Note: Click the category again to refresh the changes applied.",
                            [
                                {text: "OK", 
                                    onPress: () => //Navigate to Home Screen
                                    props.modalVisible(false)
                                }
                            ]
                        )   
                    }
                }
                >
                <Text style={styles.textStyle}>Confirm</Text>
                </TouchableOpacity>

                <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => 
                    {
                        showModalEditItemVisible(false)
                        props.modalVisible(false)
                        
                        
                        //Cleanup
                        setSelectedItem('')
                        setAmountSmall('')
                        setAmountMedium('')
                        setAmountLarge('')
                        setSelectedDocumentId('')
                        //setSelectedItemId('')
                        //setImage('')
                        
                    }
                }>
                <Text style={styles.textStyle}>Exit</Text>
                </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    )
}

export default EditItemModal

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
        marginHorizontal: '10%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf:'center'
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
        backgroundColor:'white',
        alignSelf: 'stretch',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 15,
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
        paddingVertical : 22,
    },
    modalInputTitleFp: {
        paddingHorizontal: 10,
        paddingVertical : 14,
        color:'#FF1493'
    }

})