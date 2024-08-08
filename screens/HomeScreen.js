import React, { useContext, useLayoutEffect, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { UserType } from '../UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode'; 
import axios from 'axios';
import User from '../components/User';


const HomeScreen = () => {
  const navigation = useNavigation();
  const { userId, setUserId } = useContext(UserType);
  const [users, setUsers] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => (
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>AZ Chat</Text>
      ),
      headerRight: () => (
        <View style={{ flexDirection: "row", alignItems: "center", gap:8 }}>
          <Icon onPress ={() => navigation.navigate("Chats")} name="message-reply" color="black" size={24} />
          <Icon onPress ={() => navigation.navigate("Friends")} name="account-multiple" color="black" size={24} />

        </View>
      )
    });
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        console.log("Token from AsyncStorage:", token); // Log the token to check if it's retrieved correctly
  
        if (token) {
          const decodedToken = jwtDecode(token); // Decode the JWT token correctly
          console.log('Decoded Token:', decodedToken);
  
          const userId = decodedToken.userId;
          console.log('User ID:', userId);
  
          setUserId(userId);
  
          const response = await axios.get(`http://192.168.18.16:8000/users/${userId}`);
          console.log("Response from server:", response.data); 
          setUsers(response.data);
        } else {
          console.log("No token found");
        }
      } catch (error) {
        console.log("Error retrieving users", error);
      }
    };
  
    fetchUsers();
  }, [setUserId]);

  console.log("users", users);

  return (
    <View style={{padding:10}}>
      {users.map((item, index) => (
        <User key={index} item={item} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;