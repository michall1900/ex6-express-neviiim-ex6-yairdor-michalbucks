const validationModule = require("./validationModule.js")

module.exports= (function() {
    const NAME_PATTERN = "^[a-zA-Z]*$"
    const MIN_NAME_LENGTH = 3
    const MAX_FIELD_SIZE = 32
    return {
        isValidEmail: (email) => {
            return validationModule.isString(email) && validationModule.isNotEmpty(email) &&
                validationModule.isValidEmailTemplate(email) && validationModule.isInMaximumLength(email, MAX_FIELD_SIZE)
        },

        isValidName: (string) => {
            return validationModule.isString(string) && validationModule.isInMinimumLength(string, MIN_NAME_LENGTH)
                && validationModule.isInPattern(string, NAME_PATTERN) &&
                validationModule.isInMaximumLength(string, MAX_FIELD_SIZE)
        },
        isValidPassword: (password1, password2) => {
            return password1 === password2 && validationModule.isString(password1) &&
                validationModule.isNotEmpty(password1) && validationModule.isInMaximumLength(password1, MAX_FIELD_SIZE)
        }
    }
})();