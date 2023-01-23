const db = require("../models");
const constants = require("./constantsErrorMessageModule");
const Sequelize = require("sequelize");
const cookiesHandler = require("./cookiesHandler");

const userDbHandlerModule = (function(){
    const isEmailNotExistCheck = async (email)=>{

        const user = await db.User.findOne({where:{email: email}})
        if (user)
            throw new Error (constants.EMAIL_EXIST_ERR)

    }

    const isUserRegisterCheck = async (userObj)=>{
        const user = await db.User.findOne({where:{[Sequelize.Op.and]:[{email:userObj.email}, {password:userObj.password}]}})
        if (!user)
            throw new Error (constants.LOGIN_ERR)
        return user
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