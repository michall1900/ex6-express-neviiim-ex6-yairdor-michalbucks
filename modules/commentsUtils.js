const db = require("../models");
const constants = require("../modules/constantsErrorMessageModule");
const validations = require("../modules/validationModule");

const commentsUtils = (function() {
    /**
     * This function gets a list of comments and user ID - returns a dictionary that
     * represents which comments needs to be added and which deleted.
     * @param comments
     * @param isNeedToReceiveDelete
     * @param userId
     * @returns {{}}
     */
    const parseComments = (comments, isNeedToReceiveDelete,userId) =>{
        let ans = {};
        for (let comment of comments){
            let currentUserId = comment.userid
            delete comment.userid
            if (ans[comment.picDate] === undefined){
                ans[comment.picDate] = {"add": [], "delete": []}
            }
            if (!comment.deletionTime){
                ans[comment.picDate]["add"].push({"comment":comment,"couldDelete": currentUserId===userId.toString()});
            }
            else if(isNeedToReceiveDelete){
                ans[comment.picDate]["delete"].push(comment.id);
            }
        }
        return ans;
    }

    /**
     * This function gets a comment and update its deletion time to now.
     * @param comment
     */
    const updateCommentDeletion = (comment)=>{
        let nowDate = new Date();
        db.Comments.update({deletionTime: nowDate},
            {where: {id: comment.id}}
        )
    }

    /**
     * The function validates that the received get request is in the right syntax needed to the request to function.
     * @param req The request.
     * @param res The response.
     */
    const validateGetRequest = (req, res) => {
        if(req.query === undefined || req.query.images === undefined || !req.query.images.length) {
            ErrorMsg(res,constants.MISSING_IMAGES);
            return false;
        }
        return true;
    }

    /**
     * This function validates that all the input in the request query is valid dates.
     * @param req
     * @param res
     * @returns {boolean}
     */
    const validateAllDates = (req,res) => {
        try{
            let dataArray = JSON.parse(req.query.images);
            for(let val of dataArray){
                let tempDate = new Date(val).toISOString().substring(0,10);
                if ( !validations.isValidDate(tempDate)|| new Date(tempDate).valueOf() > new Date().valueOf()){
                    ErrorMsg(res,constants.DATES_INVALID_FORMAT);
                    return false;
                }
            }
        }
        catch {
            ErrorMsg(res,constants.CANT_PARSE_DATA);
            return false;
        }
        return true;
    }

    /**
     * The function validates that the received delete request is valid to the request to function.
     * @param req The request.
     * @param res The response.
     */
    const validateDeleteRequestInput = (req, res) =>{
        if(req.query === undefined) {
            ErrorMsg(res,constants.REQUEST_NO_QUERY);
            return false;
        }
        else {
            if (req.query.id === undefined) {
                ErrorMsg(res,constants.MISSING_PARAMETERS);
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
            ErrorMsg(res,constants.MISSING_PARAMETERS);
            return false;
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
        res.send(err);
    }

    /**
     * This function finds and returns the last update time among the comments she receives
     * @param comments
     * @param timeStamp
     * @returns {string|*}
     */
    const findLastUpdate = (comments=[], timeStamp="0") => {
        const max = comments.reduce((max, record)=>{
            return new Date(record.updatedAt).valueOf() > new Date(max.updatedAt).valueOf()? record:max
        },{updatedAt:new Date(0)})
        if (max.updatedAt.toISOString() !== new Date(0).toISOString())
            return max.updatedAt.toISOString()
        return timeStamp
    }

    return {findLastUpdate, updateCommentDeletion, parseComments, errorMsg, validateNewCommentInput,
        validateDeleteRequestInput, validateAllDates, validateGetRequest }

})()

module.exports = commentsUtils;