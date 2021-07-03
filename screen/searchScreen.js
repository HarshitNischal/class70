import React, {Component} from "react" ;
import {StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import db from "../config"

export default class SearchScreen extends Component{
    constructor(){
        super()
        this.state={
            search:'',
        allTransactions:[],
        lastVisibleTransaction:null
        }
    }
    searchTransaction=async(text)=>{
        
        var enteredText=text.split('')
        if(enteredText[0].toUpperCase()==='B'){
            const transaction=await db.collection('transaction').where('bookID','==',text).get()
            transaction.docs.map((doc)=>{
            this.setState({
                allTransactions:[...this.state.allTransactions,doc.data()],
                lastVisibleTransaction:doc  
            })    
            })
        }
        else if(enteredText[0].toUpperCase()==='S'){
            const transaction=await db.collection('transaction').where('studentID','==',text).get()
            transaction.docs.map((doc)=>{
            this.setState({
                allTransactions:[...this.state.allTransactions,doc.data()],
                lastVisibleTransaction:doc  
            })    
            })
        }
    }
    fetchMoreTransaction=async()=>{
        var text=this.state.search.toUpperCase()
        var enteredText=text.split('')
        if(enteredText[0].toUpperCase()==='B'){
            const transaction=await db.collection('transaction').where('bookID','==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
            transaction.docs.map((doc)=>{
            this.setState({
                allTransactions:[...this.state.allTransactions,doc.data()],
                lastVisibleTransaction:doc  
            })    
            })
        }
        else if(enteredText[0].toUpperCase()==='S'){
            const transaction=await db.collection('transaction').where('studentID','==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
            transaction.docs.map((doc)=>{
            this.setState({
                allTransactions:[...this.state.allTransactions,doc.data()],
                lastVisibleTransaction:doc  
            })    
            })
        }
    }
    componentDidMount=async=()=>{
        const query=await db.collection('transaction').limit(10).get()
        query.docs.map((doc)=>{
            this.setState({
                allTransactions:[],
                lastVisibleTransaction:doc  
            })    
            })
    }
    render(){
        return(
         <View style={styles.container}>
             <TextInput placeholder='Enter Book or Student ID'
             onChangeText={(text)=>{this.setState({search:this.state})}}/>
            <TouchableOpacity onPress={()=>{this.searchTransaction(this.state.search)}}>
             <Text style={styles.textStyle}>
                 Search
             </Text>
             </TouchableOpacity> 
             <FlatList
             data={this.state.allTransactions}
             renderItem={
                 ({item})=>{
                <view style={{borderBottomWidth:2}}>
                <text>{'bookID:'+item.bookID}</text>
                <text>{'studentID:'+item.studentID}</text>
                <text>{'transactionType:'+item.transactionType}</text>
                <text>{'date:'+item.date.toDate()}</text>

                </view>
                 }
             }
             keyExtractor={(item,index)=>{
                 index.toString()
             }}
             onEndReached={this.fetchMoreTransaction}
             onEndReachedThreshold={0.7}
             />
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