import React, { useState } from 'react'
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import {useLocalSearchParams} from "expo-router";


export default function PaymetPage(){

  const { planName = "N/A", planPrice = 0 } = useLocalSearchParams();

  const [fullname, setFullname] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");


  return (
    <SafeAreaView style={{flex:1}}>
      <ScrollView contentContainerStyle={Styles.container}>

        {/* header */}

        <Text style={Styles.title}>
          Secure Paymet
        </Text>
        <Text style={Styles.subtitle}>
          Finalize your payment for <Text style={{ fontWeight: "bold" }}>{planName}</Text>
        </Text>

        {/* billing info */}

        <View style={Styles.card}>
          <Text style={Styles.sectionTitle}>Billing Information</Text>
          <TextInput
            style={Styles.input}
            placeholder="Full Name"
            value={fullname}
            onChangeText={setFullname}
          />
          <TextInput
            style={Styles.input}
            placeholder="Address"
            value={address}
            onChangeText={setAddress}
          />
          <TextInput
            style={Styles.input}
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType='email-address'
          />

          {/* card details */}

          <Text style={Styles.sectionTitle}>Card Details</Text>

          <TextInput 
            style={Styles.input}
            placeholder='Card number'
          />

          <View style={{flexDirection:"row", gap: 10}}> 
            <TextInput style={[Styles.input, {flex:1}]} placeholder='MM/YY'/>
            <TextInput style={[Styles.input, {flex:1}]} placeholder='CVC'/>
          </View>

          {/* order summary */}

          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const Styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#FAFAFA"
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign : "center",
    marginBottom: 8,
    color: "#92400E"
  },
  subtitle: {
    textAlign: "center",
    color: "#B45309",
    marginBottom: 20
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 3
  },
  sectionTitle : {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#92400E"
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#FFF7ED"
  }
});