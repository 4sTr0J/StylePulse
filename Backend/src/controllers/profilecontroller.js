import { supabase } from '../config/db.js';
import bcrypt from 'bcryptjs';

// GET /profile
// Expects req.user.id to be set by auth middleware (added later)
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const { data: user, error } = await supabase
            .from("users")
            .select("id, name, email, created_at")
            .eq("id", userId)
            .maybeSingle();

        if (error) {
            return res.status(500).json({ message: "Database query error", error: error.message });
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "Profile fetched successfully", user });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// PUT /profile
// Updates name only for now. Email and password are handled separately for safety.
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name } = req.body;

        if (name === undefined) {
            return res.status(400).json({ message: "No valid fields provided to update" });
        }

        const { data, error } = await supabase
            .from("users")
            .update({ name })
            .eq("id", userId)
            .select("id, name, email, created_at");

        if (error) {
            return res.status(500).json({ message: "Database update error", error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "Profile updated successfully", user: data[0] });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// PUT /profile/password
// Separate endpoint for changing password, since it needs current-password verification.
const updatePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "currentPassword and newPassword are required" });
        }

        const { data: user, error: fetchError } = await supabase
            .from("users")
            .select("id, password")
            .eq("id", userId)
            .maybeSingle();

        if (fetchError) {
            return res.status(500).json({ message: "Database query error", error: fetchError.message });
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const { error: updateError } = await supabase
            .from("users")
            .update({ password: hashedPassword })
            .eq("id", userId);

        if (updateError) {
            return res.status(500).json({ message: "Database update error", error: updateError.message });
        }

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// DELETE /profile
const deleteProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const { error } = await supabase
            .from("users")
            .delete()
            .eq("id", userId);

        if (error) {
            return res.status(500).json({ message: "Database delete error", error: error.message });
        }

        return res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

export { getProfile, updateProfile, updatePassword, deleteProfile };