import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://iywzyppvuiptlzriuaws.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5d3p5cHB2dWlwdGx6cml1YXdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MDE4MzMsImV4cCI6MjA4MDA3NzgzM30.oJX6AA7gLFPY63KbNsgYf2VZn-I1H_VIb01oeARZjhM";


const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function uploadFile(file) {
    try {
        if (!file || !file.uri) {
            throw new Error("No file provided");
        }

        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;

        // Create form data for React Native
        const formData = new FormData();
        formData.append('file', {
            uri: file.uri,
            type: file.type || 'image/jpeg',
            name: fileName,
        });

        // Upload file
        const { error: uploadError } = await supabase.storage
            .from("images")
            .upload(fileName, formData, {
                cacheControl: "3600",
                upsert: false,
            });

        if (uploadError) {
            throw uploadError;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from("images")
            .getPublicUrl(fileName);

        return urlData.publicUrl;
    } catch (error) {
        console.error("Upload error:", error);
        throw error;
    }
}

// Helper function to pick image
export const pickImage = async () => {
    try {
        // For React Native, you'll use expo-image-picker
        // This is a placeholder function
        return null;
    } catch (error) {
        console.error("Image picker error:", error);
        return null;
    }
};




