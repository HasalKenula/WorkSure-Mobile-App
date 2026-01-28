import { Text, StyleSheet, ScrollView ,TextInput,View, TouchableOpacity, Pressable} from "react-native";
import {useState, useEffect} from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import api from "../services/api";
import { Picker } from "@react-native-picker/picker";
import Checkbox from "expo-checkbox";
import * as DocumentPicker from "expo-document-picker";
import uploadFile from "../utils/mediaUpload";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

export default function WorkerRegistartion(){
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [nic, setnic] = useState("");
    const [address, setAddress] = useState("");
    const [job, setJob] = useState("");
    const [location, setLocation] = useState("");
    const [starttime, setStarttime] = useState("");
    const [endtime, setEndtime] = useState("");
    const [days, setDays] = useState([]);
    const [document, setDocument] = useState(null);

    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(false);

    const {jwtToken} = useAuth();
    const router = useRouter();

    //load user data
    useEffect(()=>{
            if(!jwtToken) return;
    
            api
            .get("/user",{headers:{Authorization: `Bearer ${jwtToken}`}})
            .then((res)=>{
                setUserId(res.data.id);
                setName(res.data.name);
                setEmail(res.data.email);
                setPhoneNumber(res.data.contact);
                setAddress(res.data.address);
            })
            .catch(()=> Toast.show(
                {
                    type: "error",
                    text1 : "Failed to load user",
                    text2: "Please try again"
                }
            ));
        },[jwtToken]);

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

    const [experiences, setExperiences] = useState(
        [
            {
                title: "", company: "", years: ""
            }
        ]
    );

    const toggleDay = (day) => {
        setDays(
            (prev)=> prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    const pickDocument = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: ["application/pdf"],
            copyToCacheDirectory: true,
        });

        if (!result.canceled) {
            setDocument(result.assets[0]);
        }
    };

    const handleSubmit = async () => {
        if (!document) {
            Toast.show({
            type: "error",
            text1: "Error",
            text2: "Please upload document",
            });
            return;
        }

        if(!name || !email || !phoneNumber || !nic || !address || !job || !location){
            Toast.show({
            type: "error",
            text1: "Error",
            text2: "Please fill required fields",
            });
            return;
        }

        try {
            setLoading(true);

            const pdfUrl = await uploadFile({
                uri: document.uri,
                name: document.name,
                type: "application/pdf",
            });


            await api.post(
            "/worker",
            {
                fullName: name,
                email,
                phoneNumber,
                nic,
                address,
                jobRole: job,
                preferredStartTime: starttime,
                preferredEndTime: endtime,
                preferredServiceLocation: location,
                pdfUrl,
                userId,

                mon: days.includes("Mon"),
                tue: days.includes("Tue"),
                wed: days.includes("Wed"),
                thu: days.includes("Thu"),
                fri: days.includes("Fri"),
                sat: days.includes("Sat"),
                sun: days.includes("Sun"),

                certificates: certifications.map((c) => ({
                certificateName: c.name,
                issuingBody: c.body,
                })),

                jobExperiences: experiences.map((e) => ({
                companyName: e.company,
                jobTitle: e.title,
                years: Number(e.years),
                })),
            },
            {
                headers: { Authorization: `Bearer ${jwtToken}` },
            }
            );

            Toast.show({
            type: "success",
            text1: "Registration successful!",
            });

            router.push("/planUpgradePage");
        } catch (err) {
            console.log(err);
            Toast.show({
            type: "error",
            text1: "Registration failed",
            });
        } finally {
            setLoading(false);
        }
};


    return(
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Worker Registration</Text>
                    <Text style={styles.headerSubtitle}>Register as a Skilled Worker</Text>
                </View>

                {/* PERSONAL INFO */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>

                    <Text style={styles.label}>Full Name <Text style={{ color: "red" }}>*</Text></Text>
                    <TextInput placeholder="Enter your fullname" style={styles.input} value={name} onChangeText={setName}></TextInput>

                    <Text style={styles.label}>Email <Text style={{ color: "red" }}>*</Text></Text>
                    <TextInput placeholder="Enter your email" style={styles.input} value={email} onChangeText={setEmail}></TextInput>

                    <Text style={styles.label}>Contact Number <Text style={{ color: "red" }}>*</Text></Text>
                    <TextInput placeholder="Enter your phone number" style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber}></TextInput>

                    <Text style={styles.label}>NIC <Text style={{ color: "red" }}>*</Text></Text>
                    <TextInput placeholder="Enter your nic" style={styles.input} value={nic} onChangeText={setnic}></TextInput>

                    <Text style={styles.label}>Address <Text style={{ color: "red" }}>*</Text></Text>
                    <TextInput placeholder="Enter your address" style={styles.input} value={address} onChangeText={setAddress}></TextInput>

                    <Text style={styles.label}>Select Applying Job Role <Text style={{ color: "red" }}>*</Text></Text>
                    <View style={styles.pickerWrapper}>
                        <Picker selectedValue={job} onValueChange={setJob} style={{ height: 50 }}>
                        <Picker.Item label="Select Job" value=""/>
                            {jobOptions.map(
                                (j)=>(
                                    <Picker.Item key={j} label={j} value={j}/>
                                )
                            )}
                        </Picker>
                    </View>
                </View>

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
                                        <TouchableOpacity style={styles.removeBtn} onPress={() =>
                                            setCertifications(certifications.filter((_, i) => i !== index))
                                    }>
                                            <Text style={styles.removeText}>Remove</Text>
                                        </TouchableOpacity>
                                    )
                                }
                            </View>
                        )
                    )
                }
                
                <TouchableOpacity
                                style={styles.addBtn}
                                onPress={() =>
                                setCertifications([
                                    ...certifications,
                                    { name: "", body: ""},
                                ])
                                }
                            >
                                <Text style={styles.addText}>+ Add Certification</Text>
                </TouchableOpacity>

                {/* WORK EXPERIENCES */}
                <Text style={styles.sectionTitle}>Work Experience</Text>
                
                {
                    experiences.map(
                        (item, index) => (
                            <View key={index}style={styles.card}>
                                <Text style={styles.label}>Job Title</Text>
                                <TextInput style={styles.input} placeholder="Enter job title" value={item.title} onChangeText={
                                    (text) => {
                                        const copy = [...experiences];
                                        copy[index].title = text;
                                        setExperiences(copy);
                                    }
                                }/>

                                <Text style={styles.label}>Company</Text>
                                <TextInput style={styles.input} placeholder="Enter company name" value={item.company} onChangeText={
                                    (text) => {
                                        const copy = [...experiences];
                                        copy[index].company = text;
                                        setExperiences(copy);
                                    }
                                }/>

                                <Text style={styles.label}>Years</Text>
                                <TextInput style={styles.input} placeholder="Enter worked years" value={item.years} onChangeText={
                                    (text) => {
                                        const copy = [...experiences];
                                        copy[index].years = text;
                                        setExperiences(copy);
                                    }
                                }/>

                                {
                                    experiences.length > 1 && (
                                        <TouchableOpacity style={styles.removeBtn} onPress={() =>
                                            setExperiences(experiences.filter((_, i) => i !== index))
                                    }>
                                            <Text style={styles.removeText}>Remove</Text>
                                        </TouchableOpacity>
                                    )
                                }
                            </View>
                        )
                    )
                }

                <TouchableOpacity
                                style={styles.addBtn}
                                onPress={() =>
                                setExperiences([
                                    ...experiences,
                                    { title: "", company: "", years: ""},
                                ])
                                }
                            >
                                <Text style={styles.addText}>+ Add Experience</Text>
                </TouchableOpacity>

                {/* AVAILABILITY */}
                <Text style={styles.sectionTitle}>Your Work Preferences</Text>

                <Text style={styles.label}>Choose working days</Text>
                {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
                    <View key={d} style={styles.checkboxRow}>
                    <Checkbox 
                        value={days.includes(d)} 
                        onValueChange={() => toggleDay(d)}
                        color={days.includes(d) ? "#889094" : "#9ca3af"}
                    />
                    <Text>{d}</Text>
                    </View>
                ))}

                <Text style={styles.label}>Preferred Location <Text style={{ color: "red" }}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Colombo"
                    value={location}
                    onChangeText={setLocation}
                />
                            
                <Text style={styles.label}>Preferred Start Time</Text>
                <TextInput
                    style={styles.input}
                    placeholder="08:00"
                    value={starttime}
                    onChangeText={setStarttime}
                />
                            
                <Text style={styles.label}>Preferred End Time</Text>
                <TextInput
                    style={styles.input}
                    placeholder="17:00"
                    value={endtime}
                    onChangeText={setEndtime}
                />

                {/* DOCUMENT UPLOAD */}
                <Text style={styles.sectionTitle}>Upload Document</Text>
                <Text style={styles.label}>Please upload your NIC copy, Gramaniladari Certificate, Police Report and other necessary documents as one pdf.<Text style={{ color: "red" }}>*</Text></Text>
                <TouchableOpacity style={styles.uploadBtn} onPress={pickDocument}>
                    <Text style={styles.uploadText}>
                    {document ? document.name : "Upload Documents"}
                    </Text>
                </TouchableOpacity>

                {/* Submit */}
                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                    <Text style={styles.submitText}>Register Account</Text>
                </TouchableOpacity>
                
                <Toast/>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create(
    {
        container: {
            flex:1,
            //padding:16,
            backgroundColor:"#f8fafc",
        },
        section:{
            backgroundColor: "#fff",
            borderRadius: 20,
            padding: 20,
            marginHorizontal: 20,
            marginBottom: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
            borderWidth: 1,
            borderColor: "#f1f5f9",
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
        addBtn: {
            backgroundColor: "#f59e0b",
            padding: 12,
            borderRadius: 8,
            alignItems: "center",
            marginBottom: 20,
        },
        addText: {
            color: "#fff",
            fontWeight: "600",
        },
        checkboxRow: {  flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginBottom: 6, },
        uploadBtn: {
            backgroundColor: "#f59e0b",
            padding: 12,
            borderRadius: 8,
            marginTop: 10,
        },
        uploadText: { color: "#fff", textAlign: "center" , fontWeight:600},
        submitBtn: {
            backgroundColor: "#f59e0b",
            padding: 14,
            borderRadius: 8,
            marginVertical: 20,
            marginBottom:100
        },
        submitText: { color: "#fff", fontWeight: "bold", textAlign: "center",fontSize:16 },
        pickerWrapper: {
            borderWidth: 1,
            borderColor: "#d1d5db",
            borderRadius: 8,
            backgroundColor: "#fff",
            marginBottom: 12,
            overflow: "hidden", 
        },
        header: {
            backgroundColor: "#f59e0b",
            paddingTop: 60,
            paddingBottom: 30,
            paddingHorizontal: 20,
            borderBottomLeftRadius: 25,
            borderBottomRightRadius: 25,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
            marginBottom: 20,
        },
        backButton: {
            position: "absolute",
            top: 40,
            left: 20,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            justifyContent: "center",
            alignItems: "center",
        },
        headerTitle: {
            fontSize: 28,
            fontWeight: "bold",
            color: "#fff",
            marginBottom: 6,
        },
        headerSubtitle: {
            fontSize: 16,
            color: "rgba(255, 255, 255, 0.9)",
        },
    }
);