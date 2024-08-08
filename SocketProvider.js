import React, { createContext, useContext, useEffect, useState } from "react";
import io from "react-native-socket.io-client"
const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io("http://192.168.18.16:8000", {
            query: { userId: "USER_ID" },
        });
        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    return (
        <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
    );
};

export const useSocket = () => {
    return useContext(SocketContext);
};