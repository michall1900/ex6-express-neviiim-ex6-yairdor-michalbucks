const db = require("../models");
const constants = require("./constantsErrorMessageModule");
const Sequelize = require("sequelize");
const cookiesHandler = require("./cookiesHandler");
const bcrypt = require('bcrypt');

/**
 * This module is handle with the user db for validation checks.
 * @type {{isEmailNotExistCheck: ((function(*): Promise<void>)|*), isUserRegisterCheck: ((function(*): Promise<Model|null>)|*), validateUser: ((function(*, *): Promise<void>)|*), errorHandler: errorHandler}}
 */
const userDbHandlerModule = (function(){
    /**
     * Checks in the database that user's email exist.
     * @throws an error if the email exist
     * @param email - email address.
     * @returns {Promise<void>}
     */
    const isEmailNotExistCheck = async (email)=>{
        const user = await db.User.findOne({where:{email: email}})
        if (user)
            throw new Error (constants.EMAIL_EXIST_ERR)

    }
    /**
     * Checks in database that the login details are exist.
     * The assumption is the user is a valid user object (build before and validate all fields)
     * @throws an error if the email or both email and password not found.
     * @param userObj - user that builds before
     * @returns {Promise<Model|null>}
     */
    const isUserRegisterCheck = async (userObj)=>{

        const user = await db.User.findOne({ where: { email:userObj.email } })
        if (!user)
            throw new Error (constants.LOGIN_ERR)
        else{
            const result = await bcrypt.compare(userObj.password, user.password)
            if (!result)
                throw new Error (constants.LOGIN_ERR)
            return user
        }
    }
    /**
     * This function is validate user's wanted fields
     * The assumption is user exist (build before)
     * @param user - user record
     * @param validationsFields - the wanted fields to check
     * @returns {Promise<void>}
     */
    const validateUser = async (user, validationsFields) =>{
        await user.validate({fields: validationsFields})
    }
    /**
     * This function outputs the error messages
     * @param req
     * @param res
     * @param err
     */
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