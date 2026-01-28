import { Text, StyleSheet } from "react-native";
import {useState, useEffect} from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import api from "../services/api";

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
    return(
        <Text>Worker Registration Page</Text>
    );
}

const styles = StyleSheet.create(
    {
        container: {
            flex:1,
            padding:16,
            backgroundColor:"#f9fafb",
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
    }
);