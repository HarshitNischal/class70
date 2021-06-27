import React, {Component} from "react" ;
import {StyleSheet, Text, View, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, ToastAndroid} from "react-native"
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
      //verify if the student is eligible for book return or book issue or non
      //student ID exist in the database
      //issue:no. of books issue < 2
      //issue:verify book avalibility 
      //return:last transaction book issued by the student ID
    var transactionType=await this.checkBookEligibility();
    if(!transactionType)//return false then only execute statement
    {
        alert('The Book Does not Exist In The Library Database')
        this.setState({
            scannedBookID:'',
            scannedStudentID:'',

        })
    }
    else if(transactionType='issue'){
        var isStudentEligible=await this.checkStudentEligibilityForBookIssue();
        if(isStudentEligible){
            this.initiateBookIssue();
            alert('Book Issued To the Student.')
        }
    }
    else{  
         isStudentEligible=await this.checkStudentEligibilityForBookReturn();
        if(isStudentEligible){
            this.initiateBookReturn();
            alert('Book Returned To the Library.')
        }}
    }
checkBookEligibility=async()=>{
    const bookRef=await db.collection('book').where('bookID','==',this.state.scannedBookID).get();
    var transactionType=''
    //if feeded book ID does not match with any database Book ID
    //the query will return a list of document in an eray 
    if(bookRef.docs.length===0){
        transactionType='false'
    }
    //if feeded book ID match with any database Book ID
    else{
        //we can map over the eray element(idoly,would be only one element since each book ID is unique)
        bookRef.docs.map(doc=>{
            var book=doc.data();
            if(book.bookAvail){
                transactionType='issue'
            }
            else{
                transactionType='return'
            }
        })
    }
    return transactionType
}
checkStudentEligibilityForBookIssue=async()=>{
    const studentRef=await db.collection('student').where('studentID','==',this.state.scannedStudentID).get();
    var isStudentEligible=''
    //if feeded book ID does not match with any database Book ID
    //the query will return a list of document in an eray 
    if(studentRef.docs.length===0){
        this.setState({
            scannedBookID:'',
            scannedStudentID:'',
        })
        isStudentEligible='false'
        alert('Student ID does not exist in the Databse') 
    }
    //if feeded book ID match with any database Book ID
    else{
        //we can map over the eray element(idoly,would be only one element since each book ID is unique)
        studentRef.docs.map(doc=>{
            var student=doc.data();
            if(student.numberOfBooks<2){
                isStudentEligible='true'
            }
            else{
                isStudentEligible='false'
                this.setState({
                    scannedBookID:'',
                    scannedStudentID:'',
                })
                alert('Student Already have 2 Books Issued')
            }
        })
    }
    return isStudentEligible
}
checkStudentEligibilityForBookReturn=async()=>{
    const transactionRef=await db.collection('transaction').where('bookID','==',this.state.scannedbookID).limit(1).get();
    var isStudentEligible=''
    //if feeded book ID does not match with any database Book ID
    //the query will return a list of document in an eray 
   
        transactionRef.docs.map(doc=>{
            var lastBookTransaction=doc.data();
            if(lastBookTransaction.studentID=this.state.scannedStudentID){
                isStudentEligible='true'
            }
            else{
                isStudentEligible='false'
                alert('The Book Was Not Issued By this Student')
                this.setState({
                    scannedBookID:'',
                    scannedStudentID:'',
                })
            }
        })
    
    return isStudentEligible
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
            
         <KeyboardAvoidingView behavior='padding'enabled style={style.container}>
             <View>
             <Image
        source={require('../assets/booklogo.jpg')}
        style={{width:200,
        height:200}}
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
          onChangeText={(Text)=>{
              this.setState({
                  scannedBookID:Text
              })
          }}
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
          onChangeText={(Text)=>{
            this.setState({
                scannedStudentID:Text
            })
        }}
          />
           <TouchableOpacity onPress={()=>{this.getCameraPermissions('StudentID')}} style={styles.scanButton}>
                 <Text style={styles.buttonText}>
                     Scan
                 </Text>
             </TouchableOpacity>
             </View>
            
            
             <TouchableOpacity onPress={()=>{this.handleTransaction()}} style={styles.scanButton}>
                 <Text style={styles.buttonText}>
                     Submit
                 </Text>
             </TouchableOpacity>
         </KeyboardAvoidingView>  
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