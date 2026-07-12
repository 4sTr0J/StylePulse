import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

const connectDB = async () => {
    try {

        // Test connection by querying Supabase
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .limit(1);


        if (error) {
            throw error;
        }

        console.log("Connected to Supabase successfully!");

    } catch (error) {
        console.error("Supabase connection failed:", error.message);
    }
};


const disconnectDB = async () => {
    console.log("Supabase does not require manual disconnect.");
};


export { supabase, connectDB, disconnectDB };

export default supabase;