import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import axios from 'axios';
import FriendRequest from '../components/FriendRequest'; // Assuming you have a component for rendering friend requests
import { UserType } from '../UserContext'; // Assuming you have a UserContext for managing user state

const FriendsScreen = () => {
  const { userId } = useContext(UserType);
  const [friendRequests, setFriendRequests] = useState([]);

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  const fetchFriendRequests = async () => {
    try {
      const response = await axios.get(`http://192.168.18.16:8000/friend-request/${userId}`);

      console.log('Response data:', response.data); // Log the response data

      if (response.status === 200 && Array.isArray(response.data)) {
        const friendRequestsData = response.data.map((friendRequest) => ({
          _id: friendRequest._id,
          name: friendRequest.name || 'Unknown Name',
          email: friendRequest.email || 'Unknown Email',
          image: friendRequest.image || 'default_image_url_or_path', // Set a default image URL or path
        }));

        setFriendRequests(friendRequestsData);
      } else {
        console.error('Unexpected response data:', response.data);
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  return (
    <View style={styles.container}>
      {friendRequests.length > 0 ? (
        <Text>Your Friend Requests!</Text>
      ) : (
        <Text>No Friend Requests</Text>
      )}

      {friendRequests.map((request, index) => (
        <FriendRequest
          key={index}
          item={request} // Pass the request as item
          friendRequests={friendRequests}
          setFriendRequests={setFriendRequests} // You can update this function as needed
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginHorizontal: 12,
  },
});

export default FriendsScreen;