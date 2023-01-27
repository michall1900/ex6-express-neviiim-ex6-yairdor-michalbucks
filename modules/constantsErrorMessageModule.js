const constantsErrorMessageModule= (function(){
    const EMAIL_EXIST_ERR = "Can't register, email in use."
    const EMPTY_ERR = "Error, you must enter "
    const MAX_LENGTH_ERR = "Please make sure your input is in maximum length of 32."
    const MIN_AND_MAX_LENGTH_ERR = "Please make sure your input's length >= 3 and <=32."
    const NO_ALPHA_ERR = "Please make sure your input includes only letters."
    const EMAIL_ERR = "Please make sure you entered valid email."
    const INVALID_PASSWORD_ERR = "One of the passwords are invalid. Make sure that the first one is the same as the " +
        "second."

    const TOO_LONG = "Too long, The max length is"
    const USERNAME_ERROR = "Username should contain first and last name"
    const LOGIN_ERR = "User doesn't exist or you entered invalid email/ password"
    const SOMETHING_WENT_WRONG = "Oops, something went wrong..."
    const INVALID_STRING_ERROR = "should be a string"
    const FIND_COMMENTS = "Error while reaching to find comments in the db"
    const CREATE_COMMENT = "Error while trying to create a new comment"
    const DELETE_COMMENT = "Error while trying to delete a comment"
    const UPDATE_COMMENT = "Error while trying to update a comment"
    const MISSING_IMAGES = "request's images array is missing!"
    const DATES_INVALID_FORMAT = "One or more of the dates sent are in an invalid format"
    const CANT_PARSE_DATA = "could not parse data - wrong format"
    const REQUEST_NO_QUERY = "Request contains no query"
    const MISSING_PARAMETERS = "required parameters are missing, The required parameters are image (url), username (string) " +
        "and comment (string)"
    const COULDNT_FIND_UPDATE_DATE = "Couldn't find last update"
    const COMMENT_NOT_FOUND = "Comment not found, maybe deleted before"
    const CANT_DELETE_COMMENT = "You can't delete this comment"

    return {
        EMAIL_EXIST_ERR, EMPTY_ERR, MIN_AND_MAX_LENGTH_ERR, MAX_LENGTH_ERR, NO_ALPHA_ERR,EMAIL_ERR,
        INVALID_PASSWORD_ERR, LOGIN_ERR, SOMETHING_WENT_WRONG,INVALID_STRING_ERROR, FIND_COMMENTS,
        CREATE_COMMENT, DELETE_COMMENT,UPDATE_COMMENT, MISSING_IMAGES, DATES_INVALID_FORMAT,
        CANT_PARSE_DATA, REQUEST_NO_QUERY, MISSING_PARAMETERS, COULDNT_FIND_UPDATE_DATE, USERNAME_ERROR, TOO_LONG,
        COMMENT_NOT_FOUND, CANT_DELETE_COMMENT
    }
})();

module.exports = constantsErrorMessageModule