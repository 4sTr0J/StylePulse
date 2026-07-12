import { supabase } from '../config/db.js';
import bcrypt from 'bcryptjs';


// register function

const register = async (req, res) => {
    try {const {name,email,password}=req.body;

        // Check existing user
        const {data:userExist, error:checkError}=await supabase
            .from("users")
            .select("*")
            .eq("email", email);


        if(checkError){throw checkError;}


        if(userExist.length > 0){return res.status(400).json({message:"User already exists"});
    }

    //hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        // Insert new user
        const {data, error}=await supabase
            .from("users")
            .insert([{
                name,
                email,
                password: hashedPassword
            }])
            .select();

        if(error){throw error;}

        res.status(201).json({message:"User registered successfully",user:data});


    } catch(error){

        console.log(error);

        res.status(500).json({
            message:"Server error",
            error:error.message
        });

    }

};



// login function

const login = async (req, res) => {
    try{
        const {email, password} = req.body;

    // Check existing email
        const {data:user, error:checkError}=await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .maybeSingle();


        if(checkError){return res.status(500).json({ message: "Database query error", error: checkError.message });}

        // Check if user DOES NOT exist
        if(!user){
            return res.status(401).json({message:"Invalid credentials"});
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        return res.status(200).json({
            message: "Login successful",
            user: { id: user.id, email: user.email }
        });
    } catch(error){
        return res.status(500).json({message:"Server error", error:error.message});
    }
};    
        
export {register, login};