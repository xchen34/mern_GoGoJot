import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
     email: {type: String,required: true,trim: true, unique: true, index: true},
     passwordHash: {type: String, required: false, default: null},
     name:{type: String, required: false, trim: true, maxlength: 50},
     isEmailVerified: {type: Boolean, default: false, index: true},
     emailVerificationToken: {type: String, default: null},
     emailVerificationExpires: {type: Date, default: null},
     resetPasswordToken: {type: String, default: null},
     resetPasswordExpires: {type: Date, default: null},
},
{timestamps: true}
);


export default mongoose.model("User", userSchema);
