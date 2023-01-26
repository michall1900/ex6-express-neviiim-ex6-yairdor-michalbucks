const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const db = require('../models');
const constants = require("./constantsErrorMessageModule");

/**
 * The rout receives a get request which contains an images array and returns a json of each image's comments.
 */
router.get('/', function(req, res, next) {
    if(validateGetRequest(req,res) && validateAllDates(req,res)) {
        let dataArray = JSON.parse(req.query.images);
        return db.Comments.findAll({
            attributes: {exclude: ['userid']},
            where: {
                picDate: {
                    [Sequelize.Op.or]: dataArray
                }
            }
        }).then((comms) => {
            res.send(comms);
        })
        .catch((err) => {
            ErrorMsg(res,constants.FIND_COMMENTS);
        })
    }
});

/**
 * The route posting a comment on the received image by the received username.
 */
router.post('/', function(req, res, next) {
    if (validateNewCommentInput(req, res)) {
        const {picDate, content} = req.body;
        let username = req.session.username;
        let userid = req.session.userId;
        return db.Comments.create({picDate, username, userid, content})
            .then((comment) => res.send(comment))
            .catch((err) => {
                ErrorMsg(res,constants.CREATE_COMMENT);
            })
    }
});

/**
 * The route deletes an image's comment if possible.
 */
router.delete('/', function(req, res, next) {
    if(validateDeleteRequestInput(req,res)) {
        const index = parseInt(req.query.id);
        let userid = req.session.userId;
        return db.Comments.findOne({where: {id: index}})
            .then((comment) => {
                if (comment.userid !== userid) {
                    updateCommentDeletion(comment);
                    comment.destroy({force: true});
                }
            })
            .then(() => res.send({index}))
            .catch((err) => {
                ErrorMsg(res,constants.DELETE_COMMENT);
            })
    }
});

/**
 *
 */
router.get('/update', (req, res) =>{
    if(validateGetRequest(req,res) && validateAllDates(req,res)) {
        let dataArray = JSON.parse(req.query.images);
        let timeStamp = dataArray.pop();
            db.Comments.findAll({
                attributes: {exclude: ['userid']},
                where: {
                    picDate: {
                        [Sequelize.Op.or]: dataArray
                    },
                    [Sequelize.Op.or]: [
                        { createdAt:{
                            [Sequelize.Op.gte]: timeStamp
                        }},
                        { deletionTime:{
                            [Sequelize.Op.not] : null,
                            [Sequelize.Op.gte]: timeStamp
                            }}
                    ]
                }
            }).then((comments) => { res.send(parseComments(comments))})
                .catch((err)=>{
                    ErrorMsg(res,constants.UPDATE_COMMENT);
                })
        }
});

/**
 *
 */
function parseComments(comments){
    let ans = {};
    for (let comment in comments){
        if (ans[comment.picDate] === undefined){
            ans[comment.picDate] = {"add": [], "delete": []}
        }
        if (comment.deletionTime === undefined){
            ans[comment.picDate]["add"].push(comment);
        }
        else{
            ans[comment.picDate]["delete"].push(comment);
        }
    }
    return ans;
}

/**
 *
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
    if(req.query === undefined || req.query.images === undefined) {
        ErrorMsg(res,constants.MISSING_IMAGES);
        return false;
    }
    return true;
}

/**
 *
 */
function validateAllDates(req,res){
    try{
        let dataArray = JSON.parse(req.query.images);
        for(let val in dataArray){
            let tempDate = new Date(val).toISOString().substring(0,10);
            if (tempDate === "Invalid Date" || isNaN(tempDate)){
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
 *
 */
function ErrorMsg(res, err){
    res.status(400);
    res.send(err);
}

module.exports = router;