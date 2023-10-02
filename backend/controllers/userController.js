const Product = require("../models/productModels");
const ErrorHandler = require("../utils/errorHandler");
const User = require("../models/userModels");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
//register a user
exports.registerUser = catchAsyncErrors( async(req,res,next)=>{
    const {name,email,password} = req.body;
    const user = await User.create({
        name,email,password,
        avatar:{
            public_id:"this is a sample id",
            url: "profilepicUrl",
        },
    });
    sendToken(user,201,res);
});
//login user
exports.loginUser = catchAsyncErrors(async(req,res,next)=>{
    const {email,password} = req.body;
    //checking if user has given password and email both
    if(!email || password)
    {
        return next(new ErrorHandler("please  enter email and password",400));
    }
    const user = await  User.findOne({email}).select("+password");
    if(!user){
        return next(new ErrorHandler("invalid email or password",401));
    }
    const isPasswordMatched = user.comparePassword(password);
    if(!isPasswordMatched){
        return next(new ErrorHandler("invalid email or password",401));
    }
    sendToken(user,200,res);
});
//logout user
exports.logout = catchAsyncErrors(async(req,res,next)=>{
    res.cookie("token",null,{
     expires:new Date(Date.now()),
     httpOnly:true,
    });
    res.status(200).json({
        success:true,
        message: "Logged Out",
    });
});
//forgot password
 exports.forgotPassword = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findOne({email:req.body.email});
    if(!user){
        return next(new ErrorHandler("user not found",404));
    }
    //get resetpassword token
    const resetToken = user.getResetPasswordToken();
    await  user.save({validateBeforeSave : false});
    const resetPasswordUrl =`${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;
    const message = `your password reset token is : \n\n ${resetPasswordUrl} \n \n  if you have not requested this email then, please ignore it`;
    try{
        await sendEmail({
            email:user.email,
            subject:`Ecommerce password Recovery`,
            message,
        });
        res.status(200).json({
            success:true,
            message:`email sent to ${user.email} successfully`,
        });
    }catch(error){
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({validateBeforeSave:false});
        return next(new ErrorHandler(error.message,500));
    }
 });
 //reset password
 exports.resetPassword = catchAsyncErrors(async(req,res,next)=>{
    //creating token hash
    const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt: Date.now()},
    });
    if(!user){
        return next(new ErrorHandler("Reset Password Token is invalid or has been expires",404));
    }
    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("Password does not password",404));
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendToken(user,200,res);
 });
 //get user detail
exports.getUserDetails = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success:true,
      user,
    });
});
 //update user password
 exports.updatePassword = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.user.id).select("+password");
    const isPasswordMatched = user.comparePassword(req.body.oldPassword);
    if(!isPasswordMatched){
        return next(new ErrorHandler("Old password is incorrect ",400));
    }
    
    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("password does not match", 400));
      }
    
      user.password = req.body.newPassword;
      await user.save();

      sendToken(user, 200, res);  

});
 //update user profile
 exports.updateProfile = catchAsyncErrors(async(req,res,next)=>{
    
     const newUserData = {
        name:req.body.name,
        email:req.body.email,
     }

     //will add cloudinary later
     const user = User.findByIdAndUpdate(req.body.id, newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify: false,
     });
      res.status(200).json({
        success:true,
      }); 
});
// Get all users(admin)
exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find();
  
    res.status(200).json({
      success: true,
      users,
    });
  });
//get single users (admin)
exports.getSingleUser = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(
          new ErrorHander(`User does not exist with Id: ${req.params.id}`)
        );
      }
    res.status(200).json({
        success:true,
        user,
    });
});
// update User Role -- Admin
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
    
  });

  res.status(200).json({
    success: true,
  });
});

// Delete User --Admin
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHander(`User does not exist with Id: ${req.params.id}`, 400)
    );
  }

   //will add cloudinary later

  await user.remove();

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});


