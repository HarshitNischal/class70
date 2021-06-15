import React, {Component} from "react" ;
import {StyleSheet, Text, View, TouchableOpacity, TextInput, Image} from "react-native"
import * as Permissions from "expo-permissions"
import {BarCodeScanner} from "expo-barcode-scanner"
import * as firebase from 'firebase'
import db from '../config'

export default class transactionScreen extends Component{
    constructor() {
        super()
         this.state={
             hasCameraPermissions:null,
             scanned:false,
             scannedData:"",
             buttonState:"normal",
             scannedBookID:'',
             scannedStudentID:'', 
             transactionMessage:''
         }
    }
    getCameraPermissions=async(ID) => {
        const {status}=await Permissions.askAsync(Permissions.CAMERA)
        this.setState({
            //status==="granted" is true when user has granted permission else it will be false 
            hasCameraPermissions:status==="granted",
             scanned:false,
             buttonState:ID, 
        })                
    }
    handleTransaction=async()=>{
        var tMessage=null
        db.collection('books').doc(this.state.scannedBookID).get()
        .then((doc)=>{
        var book=doc.data()
        if(book.bookAvail){
            this.initiateBookIssue()
            tMessage="Book Issue"
        }
      else  {
          this.initiateBookReturn()
        tMessage="Book Return"
    }
        })
        this.setState({
            transactionMessage:tMessage
        })
    }
    initiateBookIssue=async()=>{
        //add transaction
        db.collection('transaction').add({
          bookID:this.state.scannedBookID,  
          studentID:this.state.scannedStudentID,
          date:firebase.firestore.Timestamp.now().toDate(),
          transactionType:"issue",
        })
        //change book status
        db.collection('books').doc(this.state.scannedBookID).update({
            bookAvail:false
        })
        //change no. of book issued to the student
        db.collection('student').doc(this.state.scannedStudentID).update({
            numberOfBooks:firebase.firestore.FieldValue.increment(1)
        })
        alert("bookIssue")
        this.setState({
            scannedBookID:'',
            scannedStudentID:'',

        })
    }
    initiateBookReturn=async()=>{
        //add transaction
        db.collection('transaction').add({
          bookID:this.state.scannedBookID,  
          studentID:this.state.scannedStudentID,
          date:firebase.firestore.Timestamp.now().toDate(),
          transactionType:"return",
        })
        //change book status
        db.collection('books').doc(this.state.scannedBookID).update({
            bookAvail:true
        })
        //change no. of book issued to the student
        db.collection('student').doc(this.state.scannedStudentID).update({
            numberOfBooks:firebase.firestore.FieldValue.increment(-1)
        })
        alert("bookIssue")
        this.setState({
            scannedBookID:'',
            scannedStudentID:'',

        })
    }


    handleBarCodeScanned=async({type,data})=> {
        if(this.state.buttonState==='bookID'){
        this.setState({
            scanned:true,
            scannedBookID:data,
            buttonState:"normal",
        })
    }
    if(this.state.buttonState==='StudentID'){
        this.setState({
            scanned:true,
            scannedStudentID:data,
            buttonState:"normal",
        })
    }
    }
    render(){
        if(this.state.buttonState!=='normal'&this.state.hasCameraPermissions) {
            return(
                <BarCodeScanner
                onBarcodeScanned={this.state.scanned?undefined:this.handleBarCodeScanned}
                />
            )
        }
        else if(this.state.buttonState==="normal") {
        return(
         <View style={styles.container}>
             <View>
             <Image
        source={require('../assets/booklogo.jpg')}
        style={{width:200,
        hieght:200}}
        />  
        <Text style={{textAlign:'center',
    fontSize:30}}>
            WillyApp
        </Text>
             </View>
             <View style={styles.inputView}>
          <TextInput
          style={styles.inputBox}
          placeHolder='Book ID'
          value={this.state.scannedBookID}
          />
           <TouchableOpacity onPress={()=>{this.getCameraPermissions('bookID')}} style={styles.scanButton}>
                 <Text style={styles.buttonText}>
                     Scan
                 </Text>
             </TouchableOpacity>
             </View>
             <View style={styles.inputView}>
          <TextInput
          style={styles.inputBox}
          placeHolder='Student ID'
          value={this.state.scannedStudentID}
          />
           <TouchableOpacity onPress={()=>{this.getCameraPermissions('StudentID')}} style={styles.scanButton}>
                 <Text style={styles.buttonText}>
                     Scan
                 </Text>
             </TouchableOpacity>
             </View>
             <Text style={styles.textStyle}>
                 {this.state.hasCameraPermissions===true?this.state.scannedData:"request camera permission"}
             </Text>
            
             <TouchableOpacity onPress={()=>{this.handleTransaction()}} style={styles.scanButton}>
                 <Text style={styles.buttonText}>
                     Submit
                 </Text>
             </TouchableOpacity>
         </View>   
        )}
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
textDecorationLine:'underline'
 },
 buttonText:{fontSize:20},
 scanButton:{backgroundColor:"cyan",
width:50,
borderWidth:1.5,
borderLeftWidth:0,
},
inputView:{
    flexDirection:"row",
    margin:20
},
inputBox:{
    width:200,
    hieght:40,
    borderWidth:1.5,
    borderRightWidth:0,
    fontSize:20
}
})