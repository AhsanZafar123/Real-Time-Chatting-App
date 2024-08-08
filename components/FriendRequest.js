import { StyleSheet, Text, View, Pressable, Image } from "react-native";
import React, { useContext } from "react";
import { UserType } from "../UserContext";
import { useNavigation } from "@react-navigation/native";

const FriendRequest = ({ item, friendRequests, setFriendRequests }) => {
  const { userId } = useContext(UserType);
  const navigation = useNavigation();

  const acceptRequest = async (friendRequestId) => {
    try {
      const response = await fetch(
        "http://192.168.18.16:8000/friend-request/accept",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            senderId: friendRequestId,
            recipientId: userId,
          }),
        }
      );

      if (response.ok) {
        setFriendRequests(
          friendRequests.filter((request) => request._id !== friendRequestId)
        );
        navigation.navigate("Chats");
      }
    } catch (err) {
      console.log("error accepting the friend request", err);
    }
  };

  return (
    <Pressable
      style={styles.requestContainer}
    >
      <Image
        style={styles.avatar}
        source={{ uri: item.image || 'default_image_url_or_path' }} // Provide default image URL or path
      />

      <Text style={styles.requestText}>
        {item?.name} sent you a friend request!!
      </Text>

      <Pressable
        onPress={() => acceptRequest(item._id)}
        style={styles.acceptButton}
      >
        <Text style={styles.acceptButtonText}>Accept</Text>
      </Pressable>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  requestContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  requestText: {
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 10,
    flex: 1,
  },
  acceptButton: {
    backgroundColor: "#0066b2",
    padding: 10,
    borderRadius: 6,
  },
  acceptButtonText: {
    textAlign: "center",
    color: "white",
  },
});

export default FriendRequest;