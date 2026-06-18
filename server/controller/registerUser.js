const UserModel = require('../models/UserModel');
const bcryptjs = require('bcryptjs');
const { assertSafeRegistrationRole } = require('../utils/roleSecurity');

async function registerUser(request, response){
    try {
        const {name, email, password, profile_pic, publicKey, encryptedPrivateKey, role, commandLevel, unit, department} = request.body;
        assertSafeRegistrationRole(role);
        
        const checkEmail = await UserModel.findOne({email});

        if(checkEmail){
            return response.status(400).json({
                message: 'Email already exists',
                error: true
            });
        }

        //password into hashpassword
        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(password, salt);

        const newUser = new UserModel({
            name,
            email,
            password: hashPassword,
            profile_pic,
            publicKey: publicKey,
            encryptedPrivateKey: encryptedPrivateKey,
            isMfaActive: false,
            role: 'personnel',
            commandLevel: commandLevel || 'Unit',
            unit: unit || '',
            department: department || '',
        });
        const userSave = await newUser.save();

        return response.status(201).json({
            message: 'User registered successfully',
            data : userSave,
            success: true
        });
    } catch (error) {
        const status = error.message?.startsWith('AuthorizationError:') ? 403 : 500;
        return response.status(status).json({
            message: error.message || error,
            error: true
        });
    }
}

module.exports = registerUser;