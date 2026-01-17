import mongoose from "mongoose";
import { string } from "zod";

const userSchema = new mongoose.Schema({
     email: {type: String,required: true,trim: true, unique: true, index: true},
     passwordHash: {type: String, required: true},
     name:{type: String, required: true, trim: true, maxlength: 50},
     resetPasswordToken: {type: string, default: null},
     resetPasswordExpires: {type: Date, default: null},
},
{timestamps: true}
);


export default mongoose.model("User", userSchema);