import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, Text, TextInput, View, Pressable, Alert } from 'react-native';


const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState(''); // Assuming image is a URL or base64 string
  const navigation = useNavigation();

  const handleRegister = () => {

      const user = {

        name:name,
        email:email,
        password:password,
        image:image
      }

      axios.post("http://192.168.18.16:8000/register", user).then((response) =>  {

        console.log(response);
        Alert.alert(
          "Registration Successful",
          "You have registered successfully"
        );

        setName("");
        setEmail("");
        setPassword("");
        setImage("");

      }).catch((error) =>{

        Alert.alert(
          "Registration error",
          "An error occured while registering"
        )

        console.log("registration failed", error)

      })
    
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={styles.keyboardAvoidingView} behavior="padding">
        <View style={styles.content}>
          <Text style={styles.title}>Register</Text>
          <Text style={styles.subtitle}>Create an Account</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={(text) => setName(text)}
              placeholder="Enter name"
              placeholderTextColor="#888"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(text) => setEmail(text)}
              placeholder="Enter email"
              placeholderTextColor="#888"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={(text) => setPassword(text)}
              placeholder="Enter password"
              placeholderTextColor="#888"
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Image URL</Text>
            <TextInput
              style={styles.input}
              value={image}
              onChangeText={(text) => setImage(text)}
              placeholder="Enter image URL"
              placeholderTextColor="#888"
              autoCapitalize="none"
            />
          </View>

          <Pressable onPress={handleRegister} style={styles.registerButton}>
            {({ pressed }) => (
              <Text style={[styles.registerButtonText, { backgroundColor: pressed ? '#1e90ff' : '#007bff' }]}>
                Register
              </Text>
            )}
          </Pressable>
          <Pressable onPress={() => navigation.navigate("Login")}>
            <Text>Already have an account? Sign in</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  keyboardAvoidingView: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '80%',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    color: '#007bff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  registerButton: {
    marginTop: 20,
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: '#007bff',
    alignItems: 'center',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;