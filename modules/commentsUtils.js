const db = require("../models");
const constants = require("../modules/constantsErrorMessageModule");
const validations = require("../modules/validationModule");
const Sequelize = require("sequelize");
const {isColString} = require("sequelize/lib/utils");

const commentsUtils = (function() {
    const KEYS_TO_KEEP_IN_RETURN_COMMENT = ["username","content","id","updatedAt"]
    /**
     * This function gets a list of comments and user ID - returns a dictionary that
     * represents which comments needs to be added and which deleted.
     * The structure is:
     * (for every date that found in comments)
     *      "{date}" :{"add":[{"comment":(comment includes fields content, updatedAt, username, id(of the comment)),
     *                          "couldDelete": boolean that says if user could delete the comment for client needs}],
     *                 "delete":[](will be empty in this case)
     *                 }
     * @param comments - comments records that has been found in table.
     * @param isNeedToReceiveDelete - boolean that says if there is need to include deleted comments.
     * @param userId - the current user id - for note the client if the current user could delete the image.
     * @returns {{}}
     */
    const parseComments = (comments, isNeedToReceiveDelete,userId) =>{
        let ans = {};
        for (let comment of comments){
            let newComment = Object.fromEntries(Object.entries(comment.dataValues)
                .filter(([key, _]) => KEYS_TO_KEEP_IN_RETURN_COMMENT.includes(key))
            );
            if (ans[comment.picDate] === undefined){
                ans[comment.picDate] = {"add": [], "delete": []}
            }
            if (!comment.deletionTime){
                ans[comment.picDate].add.push({"comment":newComment,"couldDelete": comment.userid===userId.toString()});
            }
            else if(isNeedToReceiveDelete){
                ans[comment.picDate]["delete"].push(comment.id);
            }
        }
        return ans;
    }

    /**
     * This function gets a comment and update its deletion time to now.
     * The assumption is the comment exist (checked before)
     * @param comment
     */
    const updateCommentDeletion = (comment)=>{
        let nowDate = new Date();
        db.Comments.update({deletionTime: nowDate},
            {where: {id: comment.id}}
        )
    }

    /**
     * This function is make sure that start_date and end dates are legal.
     * @param req
     * @param res
     * @returns {boolean}
     */
    const validateStartAndEndDates= (req,res)=>{
        if (!req.query || !isValidPictureDate(req.query.start_date) || !isValidPictureDate(req.query.end_date) ||
            new Date(req.query.start_date) > new Date(req.query.end_date)) {
            errorMsg(res,constants.INVALID_START_OR_AND_DATE)
            return false
        }
        return true
    }
    /**
     * This function is checking if the date is a valid date for the picture.
     * @param date
     * @returns {boolean}
     */
    const isValidPictureDate = (date)=>{
        return (date && validations.isValidDate(date) && new Date(date) <= new Date())
    }

    /**
     * The function validates that the received delete request is valid to the request to function.
     * @param req The request.
     * @param res The response.
     */
    const validateDeleteRequestInput = (req, res) =>{
        if(req.query === undefined) {
            errorMsg(res,constants.REQUEST_NO_QUERY);
            return false;
        }
        else {
            if (req.query.id === undefined) {
                errorMsg(res,constants.MISSING_COMMENT_ID);
                return false;
            }
        }
        return true;
    }

    /**
     * The function validates that the received request is in the right syntax so the server would be able to operate the
     * comment request.
     * @param req The request.
     * @param res The response.
     */
    const validateNewCommentInput = (req, res) => {
        if(req.body === undefined || req.body.picDate === undefined || req.body.content === undefined){
            errorMsg(res,constants.MISSING_PARAMETERS);
            return false;
        }
        if (!validations.isValidDate(req.body.picDate) || new Date(req.body.picDate) > new Date()) {
            errorMsg(res, constants.DATES_INVALID_FORMAT)
            return false
        }
        return true;
    }

    /**
     * This function gets an error msg and sent it to the client with status 400
     * @param res
     * @param err
     */
    const errorMsg = (res, err) => {
        res.status(400);
        let errorMessage = "<ol>"
        if (err instanceof Sequelize.ValidationError) {

            err.message.split('\n').forEach((error)=>errorMessage+=`<li>${error}</li>`)
            errorMessage+= '</ul>'
            err = errorMessage
        }
        else if (err instanceof Error)
            err = err.message
        else if (!validations.isString(err))
            err = constants.UNKNOWN_ERROR
        //res.json(err);
        res.json({"status":400, "msg":err})
    }
    /**
     * This function finds and returns the last update time among the comments she receives
     * @param comments - comments records
     * @param timeStamp - the time stamp that has been received
     * @returns {string|*}
     */
    const findLastUpdate = (comments=[], timeStamp=new Date(0).toISOString()) => {
        const max = comments.reduce((max, record)=>{
            return new Date(record.updatedAt).valueOf() > new Date(max.updatedAt).valueOf()? record:max
        },{updatedAt:new Date(0)})
        if (max.updatedAt.toISOString() !== new Date(0).toISOString())
            return max.updatedAt.toISOString()
        return timeStamp
    }
    /**
     * This function is checking if a string is in ISODate format.
     * The assumption is str is a string.
     * The function token from stack overflow:
     * https://stackoverflow.com/questions/52869695/check-if-a-date-string-is-in-iso-and-utc-format
     * @param str - string object
     * @returns {boolean}
     */
    const isIsoDate =(str) =>{
        if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str))
            return false;
        const d = new Date(str);
        return d instanceof Date && !isNaN(d) && d.toISOString()===str;
    }

    /**
     * This function is validate that the received timestamp is in the correct format.
     * @param req
     * @param res
     * @returns {boolean}
     */
    const validateTimestamp = (req, res)=>{
        if (!req.query.timestamp  || !validations.isString(req.query.timestamp) || !isIsoDate(req.query.timestamp) ||
            new Date(req.query.timestamp) > new Date()) {
            errorMsg(res, constants.INVALID_TIME_STAMP)
            return false
        }
        return true
    }

    /**
     * Return array of dates in picture format dates that in range between start and end dates
     * @param startDateStr - the first picture's date
     * @param endDateStr - the last picture's date
     * @returns {*[]} - pictures' date array.
     */
    const getDatesArray = (startDateStr, endDateStr)=>{
        let datesArr = []
        console.log(startDateStr, endDateStr)
        let tempDateStr = endDateStr
        let tempDate = new Date(tempDateStr)
        let startDate = new Date(startDateStr)
        while (startDate<= tempDate){
            tempDateStr = tempDate.toISOString().substring(0, 10);
            datesArr.push(tempDateStr)
            tempDate = new Date(tempDate.getTime())
            tempDate.setDate(tempDate.getDate() -1)


        }
        return datesArr
    }


    return {findLastUpdate, updateCommentDeletion, parseComments, errorMsg, validateNewCommentInput,
        validateDeleteRequestInput, validateTimestamp, validateStartAndEndDates, getDatesArray}

})()

module.exports = commentsUtils;