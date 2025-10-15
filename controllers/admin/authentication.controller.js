const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const response = require('../../utils/response.js');
const { Admin } = require('../../models/zindex.js');
const path = require('path');

exports.register = asyncHandler(async (req, res) => {
    const { email, password, mobile } = req.body; // Removed name
    let image = req?.file?.path; // Fixed path replace
    const existedUser = await Admin.findOne({ email }).lean();
  
    if (existedUser) {
      return response.conflict("User with email already Exists", res);
    }
  
    const user = await Admin.create({
      avatar: image,
      email,
      password,
      mobile,
    });
  
    const createdUser = await Admin.findById(user._id)
      .select("-password -refreshToken")
      .lean();
  
    if (!createdUser) {
      return response.serverError(res);
    }
    return response.create("User Registered Successfully", createdUser, res);
  });

  exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await Admin.findOne({ email }).select('+password');
    
    if(!user){
      return response.notFound("user not found", res);
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return response.unauthorized("Invalid credentials", res);
    }

    const { accessToken, refreshToken } = await user.generateAccessAndRefreshTokens();

    const loggedInUser = await Admin.findById(user._id).select("-password -refreshToken");

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new response.ApiResponse(
          200,
          "User logged in successfully",
          {
            user: loggedInUser,
            accessToken,
            refreshToken,
          }
        )
      );
  });
  
  exports.updateProfile = asyncHandler(async (req, res) => {
    const {email, mobile} = req.body; 
    const _id = req.admin._id;
    let avatar = req.file?.path;
  
    if (!_id) {
      return response.requiredField("id must required", res);
    }
  
    let updateFields = { email, mobile };
    if (avatar) updateFields.avatar = avatar;
  
    const user = await Admin.findByIdAndUpdate(
      _id, 
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password -refreshToken");
  
    if (!user) return response.notFound("user not found", res);
  
    return response.success(
      "Admin details updated successfully",
      user,
      res
    );
  });

  exports.getUser = asyncHandler(async (req, res) => {
    const user = await Admin.findById(req.admin._id).select("-password -refreshToken");
    return response.success("Admin details fetched successfully", user, res);
  });

  exports.changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    // Need password field to verify current password
    const user = await Admin.findById(req.admin._id).select('+password');
    
    if(!user){
      return response.notFound("user not found", res);
    }

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordValid) {
      return response.unauthorized("Invalid old password", res);
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return response.success("Password changed successfully", null, res);
  });

  exports.logout = asyncHandler(async (req, res) => {
    await Admin.findByIdAndUpdate(
      req.admin._id,
      {
        $unset: {
          refreshToken: 1
        }
      }
    );

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    };

    res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(
        new response.ApiResponse(
          200,
          "User logged out successfully",
          {}
        )
      );
  });

  exports.refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      return response.unauthorized("Unauthorized request", res);
    }

    try {
      const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET || 'fallback_refresh_secret_key');
      const user = await Admin.findById(decodedToken._id);

      if (!user) {
        return response.unauthorized("Invalid refresh token", res);
      }

      if (incomingRefreshToken !== user.refreshToken) {
        return response.unauthorized("Refresh token is expired or used", res);
      }

      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
      };

      const { accessToken, refreshToken } = await user.generateAccessAndRefreshTokens();

      res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
          new response.ApiResponse(
            200,
            "Access token refreshed successfully",
            { accessToken, refreshToken }
          )
        );
    } catch (error) {
      return response.unauthorized("Invalid refresh token", res);
    }
  });

  