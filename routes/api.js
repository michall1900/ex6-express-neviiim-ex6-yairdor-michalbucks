const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const db = require('../models');
const constants = require("../modules/constantsErrorMessageModule.js");
const validations = require("../modules/validationModule.js")
/**
 * The rout receives a get request which contains an images array and returns a json of each image's comments.
 */
router.get("/print", (req,res)=>{
    return db.Comments.findAll().then((comments) =>{res.json(comments)})
})
router.get('/', function(req, res, next) {
    if(validateGetRequest(req,res) && validateAllDates(req,res)) {
        let dataArray = JSON.parse(req.query.images);
        return db.Comments.findAll({
            //attributes: {exclude: ['userid']},
            where: {
                picDate: {
                    [Sequelize.Op.or]: dataArray
                }
                // },
                // deletionTime:{
                //     [Sequelize.Op.is]: null
                // }
            }
        }).then((comments) => {
            console.log(comments)
            //res.send(comments)
            res.json({
                "comments":parseComments(comments,false,req.session.userId), "lastUpdate": findLastUpdate(comments)});
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
            .then((comment) => res.json({status:200}))//res.send(comment))
            .catch((err) => {
                ErrorMsg(res,constants.CREATE_COMMENT);
            })
    }
});

/**
 * The route deletes an image's comment if possible.
 */
router.delete('/', function(req, res, next) {
    console.log("here")
    if(validateDeleteRequestInput(req,res)) {
        const index = parseInt(req.query.id);
        let userid = req.session.userId;
        return db.Comments.findOne({where: {id: index}})
            .then((comment) => {
                if (!comment)
                    throw new Error("Comment not found, maybe deleted before")
                if (comment.userid !== userid) {
                    updateCommentDeletion(comment);
                    //comment.destroy({force: true});
                }
                else{
                    throw new Error("You can't delete this comment")
                }
            })
            .then(() => res.json({status:200}))//res.send({index}))
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
        let timeStamp = new Date(dataArray.pop());
        const sequelizeTimestamp = Sequelize.literal(`'${timeStamp.toISOString()}'`);
        console.log(timeStamp)
        console.log(sequelizeTimestamp)
            db.Comments.findAll({
                //attributes: {exclude: ['userid']},
                where: {
                    picDate: {
                        [Sequelize.Op.or]: dataArray
                    },
                    [Sequelize.Op.or]: [
                        { createdAt:{
                            [Sequelize.Op.gte]: sequelizeTimestamp
                        }},
                        { deletionTime:{
                            [Sequelize.Op.not] : null,
                            [Sequelize.Op.gte]: sequelizeTimestamp
                            }}
                    ]
                }
            }).then((comments) => {
                res.json({
                    "comments":parseComments(comments,true,req.session.userId), "lastUpdate": findLastUpdate(comments)})
                //res.send(parseComments(comments));
            })
                .catch((err)=>{
                    ErrorMsg(res,constants.UPDATE_COMMENT);
                })
        }
});

/**
 *
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
    if(req.query === undefined || req.query.images === undefined || !req.query.images.length) {
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
        //req.query.images[req.query.images.length-1] = JSON.stringify(req.query.images)
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
 *
 */
function ErrorMsg(res, err){
    res.status(400);
    res.send(err);
}

function findLastUpdate(comments=[]){
    const max = comments.reduce((max, record)=>{
        return new Date(record.updatedAt).valueOf() > new Date(max.updatedAt).valueOf()? record:max
    },{updatedAt:new Date(0)})
    return (max.updatedAt.toISOString() === new Date(0).toISOString())? new Date().toISOString(): max.updatedAt.toISOString()
}

module.exports = router;