
import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import {createAppContainer,createSwitchNavigator} from "react-navigation" ;
import {createBottomTabNavigator} from "react-navigation-tabs";
import SearchScreen from "./screen/searchScreen";
import TransactionScreen from "./screen/transactionScreen";

export default function App() {
  return (
   <AppContainer/>
  );
}
var TabNavigator=createBottomTabNavigator({
Search:{screen:SearchScreen},
Transaction:{screen:TransactionScreen}
},
{defaultNavigationOptions:({navigation})=>{
  tabBarIcon:()=>{
    const routeName=navigation.state.routeName
    if(routeName==='Transaction'){
      return(
        <Image
        source={require('./assets/book.png')}
        style={{width:20,
        height:20}}
        />
      )
    }
    else if(routeName==='Search'){
      return(
        <Image
        source={require('./assets/searchingbook.png')}
        style={{width:100,
          height:100}}
        />
      )
    }
  }
}
}
)
const AppContainer=createAppContainer(TabNavigator)