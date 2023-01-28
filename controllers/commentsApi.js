const db = require("../models");
const Sequelize = require("sequelize");
const constants = require("../modules/constantsErrorMessageModule");
const commentsController = require("../modules/commentsUtils");

/**
 * This route receives a get request which contains an images array and returns a json of each image's comments.
 */
exports.commentsGet = (req, res) => {
    if(commentsController.validateGetRequest(req,res) && commentsController.validateAllDates(req,res)) {
        let dataArray = JSON.parse(req.query.images);
        return db.Comments.findAll({
            where: {
                picDate: {
                    [Sequelize.Op.or]: dataArray
                }
            }
        }).then((comments) => {
            res.json({
                "comments":commentsController.parseComments(comments,
                    false,req.session.userId), "lastUpdate": commentsController.findLastUpdate(comments)});
        })
            .catch((err) => {
                commentsController.errorMsg(res,constants.FIND_COMMENTS);
            })
    }
}

/**
 * The route handles the post request of '/' - gets a new comment and adds it to the DB
 */
exports.commentsPost = (req,res) => {
    if (commentsController.validateNewCommentInput(req, res)) {
        const {picDate, content} = req.body;
        let username = req.session.username;
        let userid = req.session.userId;
        return db.Comments.create({picDate, username, userid, content})
            .then((comment) => res.json({status:200}))//res.send(comment))
            .catch((err) => {
                commentsController.errorMsg(res,constants.CREATE_COMMENT);
            })
    }
}

/**
 * The route deletes a comment from the DB if possible - If the user who tried to
 * delete it is the owner of this comment.
 */
exports.commentsDelete = (req,res) => {
    if(commentsController.validateDeleteRequestInput(req,res)) {
        const index = parseInt(req.query.id);
        let userid = req.session.userId;
        return db.Comments.findOne({where: {id: index}})
            .then((comment) => {
                if (!comment || comment.deletionTime)
                    throw new Error(constants.COMMENT_NOT_FOUND)
                if (comment.userid !== userid) {
                    commentsController.updateCommentDeletion(comment);
                }
                else{
                    throw new Error(constants.CANT_DELETE_COMMENT)
                }
            })
            .then(() => res.json({status:200}))
            .catch((err) => {
                commentsController.errorMsg(res,constants.DELETE_COMMENT);
            })
    }
}

/**
 * This route gets dates of images to fetch comments from and a time-stamp that
 * represents that last update the person who sent the request did.
 * returns all comments that got updated later to the timestamp.
 */
exports.commentsUpdate = (req,res) => {
    if(commentsController.validateGetRequest(req,res) && commentsController.validateAllDates(req,res)) {
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
                "comments":commentsController.parseComments(comments,
                    true,req.session.userId), "lastUpdate": commentsController.findLastUpdate(comments,timeStamp)})
        })
            .catch((err)=>{
                commentsController.errorMsg(res,constants.UPDATE_COMMENT);
            })
    }
}