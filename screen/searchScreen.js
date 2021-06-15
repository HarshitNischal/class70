import React, {Component} from "react" ;
import {StyleSheet, Text, View} from "react-native"

export default class SearchScreen extends Component{
    render(){
        return(
         <View style={styles.container}>
             <Text style={styles.textStyle}>
                 Search Screen
             </Text>
         </View>   
        )
    }
}
const styles=StyleSheet.create({
 container:{
     flex:1,
     justifyContent:"center",
     alignItems:"center"
 },
 textStyle:{
     color:"black",
     fontSize:20,

 }
})