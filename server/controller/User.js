
import bcrypt from 'bcryptjs'
import cloudinary from '../lib/cloudinay.js'
import { generateToken } from "../lib/Utils.js"
import User from "../model/User.js"

// Signup a new user
export const signUp = async(req, res) => {
    const {fullName, email, password, bio} = req.body
    try{
        if(!fullName || !email || !password || !bio){
            return res.json({success: false, message: 'there is problem'})
        }

        const user = await User.findOne({email})

        if(user){
            return res.json({success: false, message: 'Account already exist'})
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPwd = await bcrypt.hash(password, salt)

        const newUser = await User.create({
            fullName, email, password: hashedPwd, bio
        })

        const token = generateToken(newUser._id)

        return res.json({
            success: true, message: 'Account has been successfully created', token, userData: newUser
        })

    }catch(error){
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

export const login = async(req, res) => {
    const {email, password} = req.body

    try{
        const user = await User.findOne({email})

        if(!user){
            return res.json({success: false, message: 'No account exist with that email'})
        }

        const pwdCompare = await bcrypt.compare(password, user.password)

        if(!pwdCompare){
            return res.json({success: false, message: 'password incorrect, please repeat again'})
        }

        const token = generateToken(user._id)

        console.log('req.user', req.user)
        return res.json({success: true, message: "You've successfully logged in", user, token})

    }catch(error){
        console.log(error)
        return res.json({success: false, message: error.message})
    }

}
// Controller to check if user is authenticated
export const checkAuth = (req, res) => {
    res.json({ success: true, user: req.user })
}


//Controller to update user profile details

export const updateProfile = async(req, res) => {
    try{
        const {profilePic, bio, fullName} = req.body
        let updatedUser

        const userId = req.user._id
        if(!profilePic){
            updatedUser = await User.findOneAndUpdate(userId, {bio, fullName}, {new: true});
        }else{
            const upload = (await cloudinary.uploader.upload(profilePic));
            updatedUser = await User.findOneAndUpdate(userId, {profilePic: upload.secure_url, bio, fullName}, {new: true});
        }

        return res.json({ success: true, user: updatedUser })

    }catch(error){
        console.log(error.message)
        res.status({ success: false, message: error.message })
    }
}