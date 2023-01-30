/**
 * This module holds all the error messages of the server.
 * @type {{EMAIL_EXIST_ERR: string, COULDNT_FIND_UPDATE_DATE: string, REQUEST_NO_QUERY: string, EMAIL_ERR: string, DELETE_COMMENT: string, MISSING_PARAMETERS: string, NOT_LOGIN_ERROR: string, MIN_AND_MAX_LENGTH_ERR: string, CANT_PARSE_DATA: string, INVALID_PASSWORD_ERR: string, SOMETHING_WENT_WRONG: string, CANT_GET_LOGIN_PAGE_ERROR: string, MAX_LENGTH_ERR: string, USERNAME_ERROR: string, UPDATE_COMMENT: string, WRONG_ADDRESS: string, INVALID_STRING_ERROR: string, DATES_INVALID_FORMAT: string, CANT_DELETE_COMMENT: string, LOGIN_TO_ANOTHER_USER: string, FIND_COMMENTS: string, INVALID_TOKEN: string, EMPTY_ERR: string, NO_ALPHA_ERR: string, TOO_LONG: string, MISSING_IMAGES: string, LOGIN_ERR: string, CREATE_COMMENT: string, COMMENT_NOT_FOUND: string}}
 */
const constantsErrorMessageModule= (function(){
    const EMAIL_EXIST_ERR = "Can't register, email in use"
    const EMPTY_ERR = "Error, you must enter "
    const MAX_LENGTH_ERR = "Please make sure your input is not empty and in maximum length of 32"
    const MIN_AND_MAX_LENGTH_ERR = "Please make sure your input's length >= 3 and <=32"
    const NO_ALPHA_ERR = "Please make sure your input includes only letters"
    const EMAIL_ERR = "Please make sure you entered valid email"
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
    const MISSING_PARAMETERS = "required parameters are missing. The required parameters are image (date), username (string) " +
        "and comment (string)"
    const COULDNT_FIND_UPDATE_DATE = "Couldn't find last update"
    const NOT_LOGIN_ERROR = "You couldn't get to this page if you are not login"
    const CANT_GET_LOGIN_PAGE_ERROR = "You are login. You can't get registration/ login pages"
    const COMMENT_NOT_FOUND = "Comment not found, maybe deleted before"
    const CANT_DELETE_COMMENT = "You can't delete this comment"
    const INVALID_TOKEN = "You have invalid token, maybe you are connected to another user. " +
        "Please try to refresh the page or login again."
    const WRONG_ADDRESS = " or you tried to get wrong address"
    const NO_IMAGES_ERROR = "No images given while trying to update/ give new comments"
    const UNKNOWN_ERROR = "There was a problem with server api response"
    const INVALID_TIME_STAMP = "Invalid time stamp, you should send a time stamp in ISOString format that <= " +
        "today's time stamp."
    const INVALID_START_OR_AND_DATE = "Error, you should give start_date and end_date in format yyyy-mm-dd with " +
        "start_date <= end_date"

    return {
        EMAIL_EXIST_ERR, EMPTY_ERR, MIN_AND_MAX_LENGTH_ERR, MAX_LENGTH_ERR, NO_ALPHA_ERR,EMAIL_ERR,
        INVALID_PASSWORD_ERR, LOGIN_ERR, SOMETHING_WENT_WRONG,INVALID_STRING_ERROR, FIND_COMMENTS,
        CREATE_COMMENT, DELETE_COMMENT,UPDATE_COMMENT, MISSING_IMAGES, DATES_INVALID_FORMAT,
        CANT_PARSE_DATA, REQUEST_NO_QUERY, MISSING_PARAMETERS, COULDNT_FIND_UPDATE_DATE, USERNAME_ERROR, TOO_LONG,
        NOT_LOGIN_ERROR, CANT_GET_LOGIN_PAGE_ERROR, COMMENT_NOT_FOUND, CANT_DELETE_COMMENT,
        INVALID_TOKEN,WRONG_ADDRESS, NO_IMAGES_ERROR, UNKNOWN_ERROR, INVALID_TIME_STAMP, INVALID_START_OR_AND_DATE

    }
})();

module.exports = constantsErrorMessageModule