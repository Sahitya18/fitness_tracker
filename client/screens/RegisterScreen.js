import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, Modal } from 'react-native';
import axios from 'axios';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const sendOtp = async () => {
    try {
      await axios.post('http://<YOUR-IP>:8080/api/send-otp', { email, mobile });
      setOtpSent(true);
    } catch (err) {
      Alert.alert('OTP send failed');
    }
  };

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://<YOUR-IP>:8080/api/register', {
        email, mobile, password, otp
      });
      Alert.alert('Registered Successfully');
    } catch {
      Alert.alert('Registration Failed');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Mobile" value={mobile} onChangeText={setMobile} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      {otpSent && <TextInput placeholder="Enter OTP" value={otp} onChangeText={setOtp} />}
      <Button title="Send OTP" onPress={sendOtp} />
      <Button title="Register" onPress={handleRegister} />
    </View>
  );
}
