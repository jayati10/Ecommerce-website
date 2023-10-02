const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"please enter your name"],
        maxLength:[30,"name can not exceed 30 characters "],
        minLength:[4," name should have more than 4 characters"],

    },
    email:{
        type:String,
        required:[true,"please enter your email "],
        unique:true,
        validator:[validator.isEnail,"please enter a valid email"],

    },
    password:{
        type:String,
        required:[true,"please enter your password"],
        minLength:[8,"password should be greater than 8 characters"],
        select:false,
    },
    avatar:{
        
            public_id:{
                type:String,
                required:true
            },
            url:{
                type:String,
                required:true
            }
    },
    role:{
        type:String,
        default:"user",

    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,


});


userSchema.pre("save",async function(next){
  if(this.isModified("password")){
    next();

  }

    this.password =await bcrypt.hash(this.password,10);

});
//jwt token
userSchema.methods.getJWToken = function (){
    return jwt.sign({id:this.id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE,

    });
};

//compare password
userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);

}


// generating password reset token
userSchema.methods.getResetPasswordToken = function(){
    //generating token
    const resetToken = crypto.randomBytes(20).toString("hex");


    //hashing and add resetpasswordtoken to userschema
     this.resetPasswordToken = crypto
     .createHash("sha256")
     .update(resetToken)
     .digest("hex");
 
     this.resetPasswordExpire = Date.now() + 15 *60*1000;

     return resetToken;

};
module.exports = mongoose.model("User",userSchema);
