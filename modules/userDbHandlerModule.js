const db = require("../models");
const constants = require("./constantsErrorMessageModule");
const Sequelize = require("sequelize");
const cookiesHandler = require("./cookiesHandler");
const bcrypt = require('bcrypt');

const userDbHandlerModule = (function(){

    const isEmailNotExistCheck = async (email)=>{
        const user = await db.User.findOne({where:{email: email}})
        if (user)
            throw new Error (constants.EMAIL_EXIST_ERR)

    }

    const isUserRegisterCheck = async (userObj)=>{
        // const user = await db.User.findOne({where:{[Sequelize.Op.and]:[{email:userObj.email}, {password:userObj.password}]}})
        // if (!user)
        //     throw new Error (constants.LOGIN_ERR)
        // return user
        const user = await db.User.findOne({ where: { email:userObj.email } })
        if (!user)
            throw new Error (constants.LOGIN_ERR)
        else{
            const result = await bcrypt.compare(userObj.password, user.password)
            if (!result)
                throw new Error (constants.LOGIN_ERR)
            return user
        }


        // return User.findOne({ where: { email:userObj.email } }).then(user => {
        //     if (!user) {
        //         res.status(401).json({ message: 'Invalid email or password' });
        //     } else {
        //         bcrypt.compare(userObj.password, user.password).then(result => {
        //             if (result) {
        //
        //                 res.json({ message: 'Authentication successful' });
        //             } else {
        //                 res.status(401).json({ message: 'Invalid email or password' });
        //             }
        //         }).catch(err => {
        //             res.status(500).json({ message: 'Error during authentication' });
        //         });
        //     }
        // }).catch(err => {
        //     res.status(500).json({ message: 'Error during authentication' });
        // })
    }

    const validateUser = async (user, validationsFields) =>{
        await user.validate({fields: validationsFields})
    }

    const errorHandler = (req,res,err)=>{
        if (err instanceof Sequelize.ValidationError) {
            let errorMessage = ""
            err.message.split('\n').forEach((error)=>errorMessage+=`<li>${error}</li>`)
            cookiesHandler.createErrorCookie(req, res, `<ul>${errorMessage}</ul>`)
        }
        else
            cookiesHandler.createErrorCookie(req, res, `${constants.SOMETHING_WENT_WRONG} ${err.message ?? err}`)
    }

    return {
        isEmailNotExistCheck,
        isUserRegisterCheck,
        validateUser,
        errorHandler
    }
})();
module.exports = userDbHandlerModule