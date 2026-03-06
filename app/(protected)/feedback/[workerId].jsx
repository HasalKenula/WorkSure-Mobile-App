import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";
import { useAuth } from "../../../context/AuthContext";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function UserFeedbackScreen() {

    const { workerId } = useLocalSearchParams();
    const router = useRouter();
    const { jwtToken } = useAuth();

    const [user, setUser] = useState(null);
    const [worker, setWorker] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [loading, setLoading] = useState(true);

    const authHeaders = {
        headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
        },
    };

    useEffect(() => {
        if (!jwtToken) return;

        api
            .get("/user", authHeaders)
            .then((res) => setUser(res.data))
            .catch((err) => console.log(err));
    }, [jwtToken]);

    useEffect(() => {
        if (!workerId) return;

        api
            .get(`/worker/id/${workerId}`, authHeaders)
            .then((res) => setWorker(res.data))
            .catch((err) => console.log(err))
            .finally(() => setLoading(false));
    }, [workerId]);

    useEffect(() => {
        if (!user?.id) return;

        api
            .get(`/rating/user/${user.id}`, authHeaders)
            .then((res) => setReviews(res.data))
            .catch((err) => console.log(err));
    }, [user]);

    const submitFeedback = async () => {

        if (!rating || !feedback.trim()) {
            Alert.alert("Warning", "Please provide rating and feedback");
            return;
        }

        try {
            await api.post(
                "/rating",
                {
                    workerId,
                    userId: user.id,
                    rating,
                    feedback,
                },
                authHeaders
            );

            Alert.alert("Success", "Feedback submitted");

            setRating(0);
            setFeedback("");

            router.back();
        } catch (err) {
            console.log(err);
            Alert.alert("Error", "Submission failed");
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#f59e0b" />
            </View>
        );
    }

    if (!worker) {
        return (
            <View style={styles.center}>
                <Text>Worker not found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>

            <Text style={styles.title}>Rate & Review</Text>

            {/* Worker Info */}
            <View style={styles.workerCard}>
                {worker.user?.imageUrl ? (
                    <Image
                        source={{ uri: worker.user.imageUrl }}
                        style={styles.avatar}
                    />
                ) : (
                    <Ionicons name="person-circle" size={90} color="gray" />
                )}

                <Text style={styles.workerName}>{worker.fullName}</Text>
            </View>

            {/* Rating */}
            <Text style={styles.label}>Your Rating</Text>

            <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setRating(star)}>
                        <Ionicons
                            name={star <= rating ? "star" : "star-outline"}
                            size={32}
                            color="#f59e0b"
                        />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Feedback */}
            <Text style={styles.label}>Detailed Feedback</Text>

            <TextInput
                style={styles.textArea}
                multiline
                placeholder="Write your feedback..."
                value={feedback}
                onChangeText={setFeedback}
            />

            {/* Buttons */}
            <View style={styles.buttonRow}>

                <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => router.back()}
                >
                    <Text>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={submitFeedback}
                >
                    <Text style={{ color: "#fff" }}>Submit</Text>
                </TouchableOpacity>

            </View>



        </ScrollView>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#f3f4f6",
        padding: 20
    },

    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },

    title: {
        fontSize: 26,
        fontWeight: "bold",
        textAlign: "center",
        color: "#f59e0b",
        marginBottom: 20
    },

    workerCard: {
        alignItems: "center",
        marginBottom: 20
    },

    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        marginBottom: 10
    },

    workerName: {
        fontSize: 18,
        fontWeight: "600"
    },

    label: {
        fontSize: 16,
        marginTop: 15,
        marginBottom: 5
    },

    starRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 10
    },

    textArea: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 10,
        height: 120,
        backgroundColor: "#fff"
    },

    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 15
    },


    cancelBtn: {
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        width: "40%",
        alignItems: "center"
    },

    submitBtn: {
        padding: 10,
        backgroundColor: "#f59e0b",
        borderRadius: 8,
        width: "40%",
        alignItems: "center"
    },

});