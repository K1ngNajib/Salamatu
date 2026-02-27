const getUserDetailsFromToken = require('../services/getUserDetailsFromToken');
const UserModel = require('../models/UserModel');
const { assertCanUpdateRole } = require('../utils/roleSecurity');

async function updateUserDetails(request, response){
    try {
        const token = request.cookies.token || '';

        const user = await getUserDetailsFromToken(token);

        const {name, profile_pic, role, commandLevel, unit, department, availabilityStatus } = request.body;
        const currentUserDoc = await UserModel.findById(user._id).select('role');

        assertCanUpdateRole({
            actorRole: currentUserDoc?.role || 'personnel',
            requestedRole: role,
            currentRole: currentUserDoc?.role,
        });

        const payload = {
            name,
            profile_pic,
            commandLevel,
            unit,
            department,
            availabilityStatus,
        };

        if (role !== undefined && currentUserDoc?.role === 'super_admin') {
            payload.role = role;
        }

        Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

        await UserModel.updateOne({_id: user._id}, payload);

        const userInformation = await UserModel.findById(user._id);

        return response.status(200).json({
            message: 'User details updated successfully',
            data : userInformation,
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

module.exports = updateUserDetails;