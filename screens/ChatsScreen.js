import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TextInput,
    Pressable,
    Image,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { UserType } from "../UserContext";

const ChatsScreen = () => {
    const [friends, setFriends] = useState([]);
    const [friendData, setFriendData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const { userId } = useContext(UserType);
    const navigation = useNavigation();

    useEffect(() => {
        fetchFriends();
    }, [userId]);

    useEffect(() => {
        if (friends.length > 0) {
            fetchFriendData();
        }
    }, [friends]);

    const fetchFriends = async () => {
        try {
            const response = await fetch(
                `http://192.168.18.16:8000/friends/${userId}`
            );
            const data = await response.json();
            setFriends(data);
        } catch (error) {
            console.log("Error fetching friends", error);
        }
    };

    const fetchFriendData = async () => {
        try {
            const data = await Promise.all(
                friends.map(async (friendId) => {
                    const response = await fetch(
                        `http://192.168.18.16:8000/user/${friendId}`
                    );
                    const friendData = await response.json();

                    const lastMessageResponse = await fetch(
                        `http://192.168.18.16:8000/messages/${userId}/${friendId}`
                    );
                    const lastMessageData = await lastMessageResponse.json();

                    return {
                        ...friendData,
                        lastMessage: lastMessageData[lastMessageData.length - 1],
                    };
                })
            );
            setFriendData(data);
        } catch (error) {
            console.log("Error fetching friend data", error);
        }
    };

    const formatTime = (time) => {
        const options = { hour: "numeric", minute: "numeric" };
        return new Date(time).toLocaleString("en-US", options);
    };

    return (
        <View style={{ flex: 1, backgroundColor: "white" }}>
            <View
                style={{
                    backgroundColor: "white",
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "#F0F0F0",
                        paddingHorizontal: 10,
                        borderRadius: 20,
                    }}
                >
                    <Ionicons name="search" size={20} color="gray" />
                    <TextInput
                        placeholder="Search"
                        style={{
                            flex: 1,
                            height: 40,
                            paddingHorizontal: 10,
                            color: "black",
                        }}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20 }}>
                {friendData
                    .filter((friend) =>
                        friend.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((friend) => (
                        <Pressable
                            key={friend._id}
                            onPress={() =>
                                navigation.navigate("Messages", {
                                    recepientId: friend._id,
                                })
                            }
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                paddingVertical: 10,
                                borderBottomWidth: 1,
                                borderBottomColor: "#F0F0F0",
                            }}
                        >
                            <Image
                                source={{ uri: friend.image }}
                                style={{ width: 50, height: 50, borderRadius: 25 }}
                            />
                            <View
                                style={{
                                    flex: 1,
                                    marginLeft: 10,
                                    justifyContent: "center",
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 16,
                                        fontWeight: "bold",
                                        color: "black",
                                    }}
                                >
                                    {friend.name}
                                </Text>
                                {friend.lastMessage && (
                                    <Text style={{ color: "gray" }}>
                                        {friend.lastMessage.messageType === "text"
                                            ? friend.lastMessage.message
                                            : "Image"}
                                    </Text>
                                )}
                            </View>
                            {friend.lastMessage && (
                                <Text style={{ color: "gray" }}>
                                    {formatTime(friend.lastMessage.createdAt)}
                                </Text>
                            )}
                        </Pressable>
                    ))}
            </ScrollView>
        </View>
    );
};

export default ChatsScreen;

const styles = StyleSheet.create({});