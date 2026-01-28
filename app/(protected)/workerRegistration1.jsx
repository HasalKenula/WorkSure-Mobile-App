import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import {ScrollView, StyleSheet, Text, TouchableOpacity, TextInput, View} from "react-native";
import Toast from "react-native-toast-message";


export default function WorkerRegistrationPage(){

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [nic, setnic] = useState("");
    const [address, setAddress] = useState("");
    const [job, setJob] = useState("");

    const jobOptions = [
        "PLUMBER",
        "ELECTRICIAN",
        "CARPENTER",
        "PAINTER",
        "CLEANER"
    ];

    const [certifications, setCertifications] = useState(
        [
            {
                name: "", body: ""
            }
        ]
    );
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Register as Skilled Worker</Text>

            {/* PERSONAL INFO */}
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <Text style={styles.label}>Full Name *</Text>
            <TextInput placeholder="Enter your fullname" style={styles.input} value={name} onChangeText={setName}></TextInput>

            <Text style={styles.label}>Email *</Text>
            <TextInput placeholder="Enter your email" style={styles.input} value={email} onChangeText={setEmail}></TextInput>

            <Text style={styles.label}>Contact Number *</Text>
            <TextInput placeholder="Enter your phone number" style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber}></TextInput>

            <Text style={styles.label}>NIC *</Text>
            <TextInput placeholder="Enter your nic" style={styles.input} value={nic} onChangeText={setnic}></TextInput>

            <Text style={styles.label}>Address *</Text>
            <TextInput placeholder="Enter your address" style={styles.input} value={address} onChangeText={setAddress}></TextInput>

            <Text style={styles.label}>Select Appling Job Role *</Text>
            <Picker selectedValue={job} onValueChange={setJob}>
                <Picker.Item label="Select Job" value=""/>
                {jobOptions.map(
                    (j)=>(
                        <Picker.Item key={j} label={j} value={j}/>
                    )
                )}
            </Picker>

            {/* CERTIFICATIONS AND QUALIFICATIONS */}
            <Text style={styles.sectionTitle}>Certifications and Qualifications</Text>

            {
                certifications.map(
                    (item, index) => (
                        <View key={index}style={styles.card}>
                            <Text style={styles.label}>Certification Name</Text>
                            <TextInput style={styles.input} placeholder="e.g. NVQ Level 4" value={item.name} onChangeText={
                                (text) => {
                                    const copy = [...certifications];
                                    copy[index].name = text;
                                    setCertifications(copy);
                                }
                            }/>

                            <Text style={styles.label}>Issuing Body</Text>
                            <TextInput style={styles.input} placeholder="Issuing body" value={item.body} onChangeText={
                                (text) => {
                                    const copy = [...certifications];
                                    copy[index].body = text;
                                    setCertifications(copy);
                                }
                            }/>

                            {
                                certifications.length > 1 && (
                                    <TouchableOpacity style={styles.removeBtn}>
                                        <Text style={styles.removeText}>Remove</Text>
                                    </TouchableOpacity>
                                )
                            }
                        </View>
                    )
                )
            }

            {/* WORK EXPERIENCES */}
            <Text style={styles.sectionTitle}>Work Experience</Text>

            {/* AVAILABILITY */}
            <Text style={styles.sectionTitle}>Your Work Preferences</Text>

            {/* DOCUMENT UPLOAD */}

            
            <Toast/>
        </ScrollView>
        
    );
}

const styles = StyleSheet.create(
    {
        container: {
            flex:1,
            padding:16,
            backgroundColor:"#f9fafb"
        },
        title:{
            fontSize:24,
            fontWeight:700,
            textAlign:"center",
            marginTop:10
        },
        sectionTitle:{
            fontSize: 18,
            fontWeight: 600,
            marginVertical: 14
        },
        label:{
            fontSize: 14,
            fontWeight: 500,
            marginBottom: 4
        },
        input:{
            borderWidth: 1,
            borderColor: "#d1d5db",
            borderRadius: 8,
            backgroundColor: "#fff",
            padding: 15,
            marginBottom: 12
        },
        card:{
            backgroundColor: "#fff",
            borderRadius: 10,
            padding: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: "#e5e7eb",
        },
        removeBtn: {
            backgroundColor: "#e5e7eb",
            padding: 8,
            borderRadius: 6,
            marginTop: 6,
        },
        removeText: {
            textAlign: "center",
            color: "#374151",
        },
    }
);