const db = require("../models");
const Sequelize = require("sequelize");
const constants = require("../modules/constantsErrorMessageModule");
const commentsController = require("../modules/commentsUtils");

/**
 * This route receives a get request which contains an images dates array (unique) and returns a json of each
 * image's comments.
 * In error with input, sending code 400 with the relevant error message (json with Error object).
 * The comments structure is:
 * {"comments": {(for every date that found in comments)
 *      "{date}" :{"add":[{"comment":(comment includes fields content, updatedAt, username, id(of the comment)),
 *                          "couldDelete": boolean that says if user could delete the comment for client needs}],
 *                "delete":[](will be empty in this case)}}
 * "lastUpdate": (date iso string includes the date of the last comment that received/ received time stamp)}
 */
exports.commentsGet = (req, res) => {
    if(commentsController.validateStartAndEndDates(req,res)) {
        let dataArray = commentsController.getDatesArray(req.query.start_date, req.query.end_date)
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
            .catch((_) => {
                commentsController.errorMsg(res,constants.FIND_COMMENTS);
            })
    }
}

/**
 * The route handles the post request of '/' - gets a new comment and adds it to the DB only if the comment is
 * legal.
 * In error, sending code 400 with the relevant error message (json with Error object).
 * In success, send json with {status:200}
 */
exports.commentsPost = (req,res) => {
    if (commentsController.validateNewCommentInput(req, res)) {
        const {picDate, content} = req.body;
        let username = req.session.username;
        let userid = req.session.userId;
        return db.Comments.create({picDate, username, userid, content})
            .then((_) => res.json({status:200}))
            .catch((err) => {
                commentsController.errorMsg(res,err ?? constants.CREATE_COMMENT)//constants.CREATE_COMMENT);
            })
    }
}

/**
 * The route deletes a comment from the DB if it possible- if the user who tried to
 * delete it is the owner of this comment.
 * In error, sending code 400 with the relevant error message (json with Error object).
 * In success, send json with {status:200}
 */
exports.commentsDelete = (req,res) => {
    if(commentsController.validateDeleteRequestInput(req,res)) {
        const index = parseInt(req.query.id);
        let userid = req.session.userId;
        return db.Comments.findOne({where: {id: index}})
            .then((comment) => {
                if (!comment || comment.deletionTime)
                    throw new Error(constants.COMMENT_NOT_FOUND)
                else if (comment.userid === userid.toString()) {
                    commentsController.updateCommentDeletion(comment);
                }
                else{
                    throw new Error(constants.CANT_DELETE_COMMENT)
                }
            })
            .then(() => res.json({status:200}))
            .catch((err) => {
                commentsController.errorMsg(res,err.message ?? constants.DELETE_COMMENT);
            })
    }
}

/**
 * This route gets dates of images to fetch comments from and a time-stamp that
 * represents that last update the person who sent the request did.
 * returns all comments that got updated later to the timestamp.
 * The comments structure is:
 * {"comments": {(for every date that found in comments)
 *      "{date}" :{"add":[{"comment":(comment includes fields content, updatedAt, username, id(of the comment)),
 *                          "couldDelete": boolean that says if user could delete the comment for client needs}],
 *                "delete":[comments ids to delete]}}
 * "lastUpdate": (date iso string includes the date of the last comment that received/ received time stamp)}
 * In error, sending code 400 with the relevant error message (json with Error object).
 */
exports.commentsUpdate = (req,res) => {
    if (commentsController.validateStartAndEndDates(req,res) && commentsController.validateTimestamp(req,res)){
        let dataArray = commentsController.getDatesArray(req.query.start_date, req.query.end_date)
        let date = new Date(req.query.timestamp)
        let stringTimeStamp = date.toISOString()
        if (!dataArray.length)
            commentsController.errorMsg(res, constants.NO_IMAGES_ERROR);
        else {
            db.Comments.findAll({
                where: {
                    picDate: {
                        [Sequelize.Op.or]: dataArray
                    },
                    [Sequelize.Op.or]: [
                        {
                            createdAt: {
                                [Sequelize.Op.gt]: stringTimeStamp
                            }
                        },
                        {
                            deletionTime: {
                                [Sequelize.Op.not]: null,
                                [Sequelize.Op.gt]: stringTimeStamp
                            }
                        }
                    ]
                }
            }).then((comments) => {
                res.json({
                    "comments": commentsController.parseComments(comments,
                        true, req.session.userId), "lastUpdate":
                        commentsController.findLastUpdate(comments, req.query.timestamp)
                })
            })
                .catch((_) => {
                    commentsController.errorMsg(res, constants.UPDATE_COMMENT);
                })
        }
    }
}