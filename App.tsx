import { StyleSheet } from 'react-native';
import React from 'react';
import Navigation from './Navigation';
import { UserContext } from './UserContext';
import { SocketProvider, useSocket, SocketContext } from './SocketProvider';
export default function App() {
  return (
    <SocketProvider>
      <UserContext>
        <Navigation />
      </UserContext>
    </SocketProvider>
  );
}

const styles = StyleSheet.create({});