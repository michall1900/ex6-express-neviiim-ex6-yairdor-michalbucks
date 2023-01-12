const validationModule = require("./validationModule.js")

const cookiesHandler = (function() {
    const NAME_PATTERN = "^[a-zA-Z]*$"
    const MIN_NAME_LENGTH = 3
    const MAX_FIELD_SIZE = 32
    return {
        /**
         * Check if email is valid (email is non-empty string, in email format,and in maximum length of MAX_FIELD_SIZE
         * characters)
         * @param email - user's email address.
         * @returns {false|*}
         */
        isValidEmail: (email) => {
            return validationModule.isString(email) && validationModule.isNotEmpty(email) &&
                validationModule.isValidEmailTemplate(email) &&
                validationModule.isLowerThanMaximumLength(email, MAX_FIELD_SIZE)
        },
        /**
         * This function is check if name (last and first) is valid (non-empty string, with only a-z/A-Z characters and
         * in maximum length of MAX_FIELD_SIZE characters).
         * @param string
         * @returns {false|*}
         */
        isValidName: (string) => {
            return validationModule.isString(string) &&
                validationModule.isGreaterThanMinimumLength(string, MIN_NAME_LENGTH) &&
                validationModule.isInPattern(string, NAME_PATTERN) &&
                validationModule.isLowerThanMaximumLength(string, MAX_FIELD_SIZE)
        },
        /**
         * This function is check if password are valid (the first is equal to the second, the password is non-empty
         * string, and in maximum length of MAX_FIELD_SIZE characters)
         * @param password1
         * @param password2
         * @returns {false|*}
         */
        isValidPassword: (password1, password2) => {
            return password1 === password2 && validationModule.isString(password1) &&
                validationModule.isNotEmpty(password1) &&
                validationModule.isLowerThanMaximumLength(password1, MAX_FIELD_SIZE)
        }
    }
})();

module.exports = cookiesHandler