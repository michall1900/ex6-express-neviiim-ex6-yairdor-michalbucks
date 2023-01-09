const validationModule = require("./validationModule.js")
const fieldsValidation = require("./fieldsValidationModule")

class User {
    INVALID_FIELD_ERR = 'User must have valid email address, first name, last name and password.'
    USER_EXIST_ERR =  'User is already exist'
    INVALID_PASSWORD_ERR = "The password is invalid. Make sure that the first one is the same as the " +
        "second and none of them is empty"

    constructor(emailAdd, fName,lName, password) {
        this.emailAdd=emailAdd
        this.fName = fName
        this.lName = lName
        this.password = password
    }

    save() {
        this.validateAttributes(true)
        usersMap.set(this.emailAdd, this);
    }

    isEmailExist(){
        return usersMap.has(this.emailAdd)
    }

    // static validateUserData(email, fName, lName){
    //     if (!email || !fName || !lName || !validationModule.isValidEmail(email)) {
    //         throw new Error('User must have valid email address, first name, last name and password');
    //     }
    //     if (User.isEmailExist(email))
    //         throw new Error('User is already exist');
    // }
    //
    // static validatePassword(password){
    //
    // }

    validateAttributes(checkWithPassword = false){
        if (!fieldsValidation.isValidEmail(this.emailAdd) || !fieldsValidation.isValidName(this.lName) ||
            !fieldsValidation.isValidName(this.fName))
            throw new Error(this.INVALID_FIELD_ERR)
        if (this.isEmailExist())
            throw new Error(this.USER_EXIST_ERR)
        if (checkWithPassword && !fieldsValidation.isValidPassword(this.password)){
            throw new Error(this.INVALID_PASSWORD_ERR)
        }
    }
}

/*
 this example stores the model in memory. Ideally these should be stored
 persistently in a database.
 */
let usersMap = new Map();


module.exports = User