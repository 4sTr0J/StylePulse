import jwt from "jsonwebtoken";
import supabase from "./config/supabase.js";

const JWT_SECRET = process.env.JWT_SECRET || "StylePulse_Salon_2026_JWT";

const isSupabaseConfigured = () => {
    const url = process.env.SUPABASE_URL || '';
    return url && url !== 'https://placeholder.supabase.co' && url.includes('.supabase.co');
};

export default async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
        return res.status(401).json({ success: false, message: "No Token" });
    }

    // 1. Try verifying as local JWT first (works with or without Supabase)
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = {
            id: payload.id || payload.sub,
            email: payload.email,
            role: payload.role || "customer"
        };
        return next();
    } catch (localTokenError) {
        // Not a local JWT — try Supabase if configured
    }

    // 2. Try Supabase token if configured
    if (isSupabaseConfigured()) {
        try {
            const { data: { user }, error } = await supabase.auth.getUser(token);
            if (!error && user) {
                req.user = user;
                return next();
            }
        } catch (err) {
            // fall through
        }
    }

    return res.status(401).json({ success: false, message: "Invalid or expired token" });
};