const constantsModule= (function(){
    const EMAIL_EXIST_ERR = "Can't register, email in use."
    const EMPTY_ERR = "Error, you must enter "
    const MAX_LENGTH_ERR = "Please make sure your input is in maximum length of 32."
    const MIN_AND_MAX_LENGTH_ERR = "Please make sure your input's length >= 3 and <=32."
    const NO_ALPHA_ERR = "Please make sure your input includes only letters."
    const EMAIL_ERR = "Please make sure you entered valid email."
    const INVALID_PASSWORD_ERR = "One of the passwords are invalid. Make sure that the first one is the same as the " +
        "second."

    return {
        EMAIL_EXIST_ERR, EMPTY_ERR, MIN_AND_MAX_LENGTH_ERR, MAX_LENGTH_ERR, NO_ALPHA_ERR,EMAIL_ERR,
        INVALID_PASSWORD_ERR
    }
})();

module.exports = constantsModule