const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const db = require('../models');
const constants = require("../modules/constantsErrorMessageModule.js");
const validations = require("../modules/validationModule.js")

/**
 * This route receives a get request which contains an images array and returns a json of each image's comments.
 */
router.get('/', function(req, res, next) {
    if(validateGetRequest(req,res) && validateAllDates(req,res)) {
        let dataArray = JSON.parse(req.query.images);
        return db.Comments.findAll({
            where: {
                picDate: {
                    [Sequelize.Op.or]: dataArray
                }
            }
        }).then((comments) => {
            res.json({
                "comments":parseComments(comments,false,req.session.userId), "lastUpdate": findLastUpdate(comments)});
        })
        .catch((err) => {
            ErrorMsg(res,constants.FIND_COMMENTS);
        })
    }
});

/**
 * The route handles the post request of '/' - gets a new comment and adds it to the DB
 */
router.post('/', function(req, res, next) {
    if (validateNewCommentInput(req, res)) {
        const {picDate, content} = req.body;
        let username = req.session.username;
        let userid = req.session.userId;
        return db.Comments.create({picDate, username, userid, content})
            .then((comment) => res.json({status:200}))//res.send(comment))
            .catch((err) => {
                ErrorMsg(res,constants.CREATE_COMMENT);
            })
    }
});

/**
 * The route deletes a comment from the DB if possible - If the user who tried to
 * delete it is the owner of this comment.
 */
router.delete('/', function(req, res, next) {
    if(validateDeleteRequestInput(req,res)) {
        const index = parseInt(req.query.id);
        let userid = req.session.userId;
        return db.Comments.findOne({where: {id: index}})
            .then((comment) => {
                if (!comment || comment.deletionTime)
                    throw new Error(constants.COMMENT_NOT_FOUND)
                if (comment.userid !== userid) {
                    updateCommentDeletion(comment);
                }
                else{
                    throw new Error(constants.CANT_DELETE_COMMENT)
                }
            })
            .then(() => res.json({status:200}))
            .catch((err) => {
                ErrorMsg(res,constants.DELETE_COMMENT);
            })
    }
});

/**
 * This route gets dates of images to fetch comments from and a time-stamp that
 * represents that last update the person who sent the request did.
 * returns all comments that got updated later to the timestamp.
 */
router.get('/update', (req, res) =>{
    if(validateGetRequest(req,res) && validateAllDates(req,res)) {
        let dataArray = JSON.parse(req.query.images);
        let timeStamp= dataArray.pop()
            db.Comments.findAll({
                where: {
                    picDate: {
                        [Sequelize.Op.or]: dataArray
                    },
                    [Sequelize.Op.or]: [
                        { createdAt:{
                            [Sequelize.Op.gt]: timeStamp
                        }},
                        { deletionTime:{
                            [Sequelize.Op.not] : null,
                            [Sequelize.Op.gt]: timeStamp
                            }}
                    ]
                }
            }).then((comments) => {
                res.json({
                    "comments":parseComments(comments,true,req.session.userId), "lastUpdate": findLastUpdate(comments,timeStamp)})
            })
                .catch((err)=>{
                    ErrorMsg(res,constants.UPDATE_COMMENT);
                })
        }
});

/**
 * This function gets a list of comments and user ID - returns a dictionary that
 * represents which comments needs to be added and which deleted.
 * @param comments
 * @param isNeedToReceiveDelete
 * @param userId
 * @returns {{}}
 */
function parseComments(comments, isNeedToReceiveDelete,userId){
    console.log(!!comments.length)
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
    console.log(ans)
    return ans;
}

/**
 * This function gets a comment and update its deletion time to now.
 * @param comment
 */
function updateCommentDeletion(comment){
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
function validateGetRequest(req, res){
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
function validateAllDates(req,res){
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
function validateDeleteRequestInput(req,res){
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
function validateNewCommentInput(req, res){
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
 * @constructor
 */
function ErrorMsg(res, err){
    res.status(400);
    res.send(err);
}

/**
 * This function finds and returns the last update time among the comments she receives
 * @param comments
 * @param timeStamp
 * @returns {string|*}
 */
function findLastUpdate(comments=[], timeStamp="0"){
    const max = comments.reduce((max, record)=>{
        return new Date(record.updatedAt).valueOf() > new Date(max.updatedAt).valueOf()? record:max
    },{updatedAt:new Date(0)})
    if (max.updatedAt.toISOString() !== new Date(0).toISOString())
        return max.updatedAt.toISOString()
    return timeStamp
}

module.exports = router;