import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    KeyboardAvoidingView,
    TextInput,
    Pressable,
    Image,
} from "react-native";
import React, { useState, useContext, useLayoutEffect, useEffect, useRef } from "react";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import EmojiSelector from "react-native-emoji-selector";
import { UserType } from "../UserContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "react-native-image-picker";
import { useSocket } from "../SocketProvider";

const ChatMessagesScreen = () => {
    const [showEmojiSelector, setShowEmojiSelector] = useState(false);
    const [selectedMessages, setSelectedMessages] = useState([]);
    const [messages, setMessages] = useState([]);
    const [recepientData, setRecepientData] = useState();
    const navigation = useNavigation();
    const [selectedImage, setSelectedImage] = useState("");
    const route = useRoute();
    const { recepientId } = route.params;
    const [message, setMessage] = useState("");
    const { userId } = useContext(UserType);
    const socket = useSocket(); // Get the socket instance

    const scrollViewRef = useRef(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    useEffect(() => {
        const fetchRecepientData = async () => {
            try {
                const response = await fetch(`http://192.168.18.16:8000/user/${recepientId}`);
                const data = await response.json();
                setRecepientData(data);
            } catch (error) {
                console.log("Error retrieving details", error);
            }
        };

        fetchRecepientData();
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await fetch(
                `http://192.168.18.16:8000/messages/${userId}/${recepientId}`
            );
            const data = await response.json();

            if (response.ok) {
                setMessages(data);
                scrollToBottom();
            } else {
                console.log("Error showing messages", response.status.message);
            }
        } catch (error) {
            console.log("Error fetching messages", error);
        }
    };

    const scrollToBottom = () => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: false });
        }
    };

    const handleSend = async (messageType, imageUri) => {
        try {
            const formData = new FormData();
            formData.append("senderId", userId);
            formData.append("recepientId", recepientId);

            let newMessage = {
                senderId: userId,
                recepientId: recepientId,
                createdAt: new Date().toISOString(),
            };

            if (messageType === "image") {
                formData.append("messageType", "image");
                formData.append("imageFile", {
                    uri: imageUri,
                    name: "image.jpg",
                    type: "image/jpeg",
                });
                newMessage = {
                    ...newMessage,
                    messageType: "image",
                    image: imageUri,
                };
            } else {
                formData.append("messageType", "text");
                formData.append("messageText", message);
                newMessage = {
                    ...newMessage,
                    messageType: "text",
                    message: message,
                };
            }

            const response = await fetch("http://192.168.18.16:8000/messages", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                setMessage("");
                setSelectedImage("");

                // Add the new message to the state
                setMessages((prevMessages) => [...prevMessages, newMessage]);

                // Emit the new message to the server
                console.log("Sending message to server:", newMessage);
                socket.emit("sendMessage", newMessage);

                // Scroll to bottom
                scrollToBottom();
            }
        } catch (error) {
            console.log("Error in sending the message", error);
        }
    };

    useEffect(() => {
        if (socket) {
            console.log("Socket connected");

            socket.on("receiveMessage", (newMessage) => {
                console.log("Received new message:", newMessage);
                setMessages((prevMessages) => [...prevMessages, newMessage]);
                scrollToBottom();
            });

            return () => {
                console.log("Socket disconnected");
                socket.off("receiveMessage");
            };
        }
    }, [socket]);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "",
            headerLeft: () => (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Ionicons
                        onPress={() => navigation.goBack()}
                        name="arrow-back"
                        size={24}
                        color="black"
                    />

                    {selectedMessages.length > 0 ? (
                        <View>
                            <Text style={{ fontSize: 16, fontWeight: "500" }}>
                                {selectedMessages.length}
                            </Text>
                        </View>
                    ) : (
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Image
                                style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: 15,
                                    resizeMode: "cover",
                                }}
                                source={{ uri: recepientData?.image }}
                            />

                            <Text style={{ marginLeft: 5, fontSize: 15, fontWeight: "bold" }}>
                                {recepientData?.name}
                            </Text>
                        </View>
                    )}
                </View>
            ),
            headerRight: () =>
                selectedMessages.length > 0 ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <Ionicons name="md-arrow-redo-sharp" size={24} color="black" />
                        <Ionicons name="md-arrow-undo" size={24} color="black" />
                        <FontAwesome name="star" size={24} color="black" />
                        <MaterialIcons
                            onPress={() => deleteMessages(selectedMessages)}
                            name="delete"
                            size={24}
                            color="black"
                        />
                    </View>
                ) : null,
        });
    }, [recepientData, selectedMessages]);

    const deleteMessages = async (messageIds) => {
        try {
            const response = await fetch("http://192.168.18.16:8000/deleteMessages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ messages: messageIds }),
            });

            if (response.ok) {
                setSelectedMessages((prevSelectedMessages) =>
                    prevSelectedMessages.filter((id) => !messageIds.includes(id))
                );

                fetchMessages();
            } else {
                console.log("Error deleting messages", response.status);
            }
        } catch (error) {
            console.log("Error deleting messages", error);
        }
    };

    const formatTime = (time) => {
        const options = { hour: "numeric", minute: "numeric" };
        return new Date(time).toLocaleString("en-US", options);
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log(result);
        if (!result.canceled) {
            handleSend("image", result.uri);
        }
    };

    const handleSelectMessage = (message) => {
        const isSelected = selectedMessages.includes(message._id);

        if (isSelected) {
            setSelectedMessages((previousMessages) =>
                previousMessages.filter((id) => id !== message._id)
            );
        } else {
            setSelectedMessages((previousMessages) => [
                ...previousMessages,
                message._id,
            ]);
        }
    };

    const handleEmojiPress = () => {
        setShowEmojiSelector((prev) => !prev);
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#F0F0F0" }}>
            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
                onContentSizeChange={scrollToBottom}
            >
                {messages.map((item, index) => {
                    if (item.messageType === "text") {
                        const isSelected = selectedMessages.includes(item._id);
                        return (
                            <Pressable
                                key={index}
                                onPress={() => handleSelectMessage(item)}
                                style={{
                                    padding: 10,
                                    backgroundColor: isSelected ? "#D3D3D3" : "white",
                                    alignSelf:
                                        item.senderId === userId ? "flex-end" : "flex-start",
                                    borderRadius: 6,
                                    marginVertical: 5,
                                    marginHorizontal: 10,
                                    maxWidth: "80%",
                                }}
                            >
                                <Text>{item.message}</Text>
                                <Text style={{ alignSelf: "flex-end", color: "gray" }}>
                                    {formatTime(item.createdAt)}
                                </Text>
                            </Pressable>
                        );
                    } else if (item.messageType === "image") {
                        const isSelected = selectedMessages.includes(item._id);
                        return (
                            <Pressable
                                key={index}
                                onPress={() => handleSelectMessage(item)}
                                style={{
                                    padding: 10,
                                    backgroundColor: isSelected ? "#D3D3D3" : "white",
                                    alignSelf:
                                        item.senderId === userId ? "flex-end" : "flex-start",
                                    borderRadius: 6,
                                    marginVertical: 5,
                                    marginHorizontal: 10,
                                    maxWidth: "80%",
                                }}
                            >
                                <Image
                                    source={{ uri: item.image }}
                                    style={{ width: 200, height: 200, borderRadius: 6 }}
                                />
                                <Text style={{ alignSelf: "flex-end", color: "gray" }}>
                                    {formatTime(item.createdAt)}
                                </Text>
                            </Pressable>
                        );
                    }
                })}
            </ScrollView>

            {showEmojiSelector && (
                <EmojiSelector
                    onEmojiSelected={(emoji) => setMessage((prevMessage) => prevMessage + emoji)}
                    showSearchBar={false}
                    columns={8}
                />
            )}

            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    backgroundColor: "white",
                }}
            >
                <Feather name="camera" size={24} color="black" onPress={pickImage} />
                <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Type a message..."
                    style={{
                        flex: 1,
                        height: 40,
                        marginHorizontal: 10,
                        paddingHorizontal: 10,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: "#F0F0F0",
                        backgroundColor: "#F0F0F0",
                    }}
                />
                <Feather name="smile" size={24} color="black" onPress={handleEmojiPress} />
                <Pressable
                    onPress={() => handleSend("text")}
                    style={{
                        marginLeft: 10,
                        padding: 10,
                        backgroundColor: "#0B71EB",
                        borderRadius: 20,
                    }}
                >
                    <Ionicons name="send" size={24} color="white" />
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
};

export default ChatMessagesScreen;

const styles = StyleSheet.create({});