//import React from 'react'
import { KeyboardAvoidingView, StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native'

const HomeScreen = ({ route, navigation }) => {

    //Variables
    const {credential , email , firstName, lastName, username, menuRef, orderRef} = route.params

    //Functions

    //Note: Convert this function to flatlist
    const handlePOSSelection = () => {  
        navigation.navigate('HomeStack',{
            screen: 'POS',
            params: {
                credential: credential,
                email: email,
                firstName: firstName,
                lastName: lastName,
                username: username,
                menuRef: menuRef,
                orderRef: orderRef
            }
        })
    }

    const handleMenuEditor = () => {  
        navigation.navigate('HomeStack',{
            screen: 'Menu',
            params: {
                credential: credential,
                email: email,
                firstName: firstName,
                lastName: lastName,
                username: username,
                menuRef: menuRef,
                orderRef: orderRef
            }
        })
    }

    const handleOrderQueue = () => {  
        navigation.navigate('HomeStack',{
            screen: 'Queue',
            params: {
                credential: credential,
                email: email,
                firstName: firstName,
                lastName: lastName,
                username: username,
                menuRef: menuRef,
                orderRef: orderRef
            }
        })
    }

    return(
        <KeyboardAvoidingView
            style = {styles.container}
            behavior='padding'
        >
            <Text>Hello {firstName} {lastName}!</Text>

            <View style = {styles.buttonContainer}>

                <Text>Navigate thru the app by selecting the avaiable items below</Text>

                <TouchableOpacity
                    onPress={handlePOSSelection}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>POS</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleMenuEditor}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>Menu Editor</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleOrderQueue}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>Order Queue</Text>
                </TouchableOpacity>
            </View> 

        </KeyboardAvoidingView>
        
    )
}

export default HomeScreen

const styles = StyleSheet.create({
    container:{
        justifyContent: 'center',
        alignItems: 'center',
        //paddingTop: '20%',
        flex: 1

    },
    buttonContainer:{
        width: '40%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    button:{
        backgroundColor: '#0782F9',
        width: '100%',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10
    },
    buttonText:{
        color: 'white',
        fontWeight: '700',
        fontSize: 16
    },
 
})