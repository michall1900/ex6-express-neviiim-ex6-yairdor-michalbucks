const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const API = require('../modules/apiMoudle');
const api = new API();
const db = require('../models');
let TIMESTAMP = Date.now();

/**
 * The rout receives a get request which contains an images array and returns a json of each image's comments.
 */
router.get('/', function(req, res, next) {
    // Validate request!
    let dataArray = JSON.parse(req.query.images);
    let timeStamp = dataArray.pop();
    return db.Comments.findAll({where :{
         picDate :{
             [Sequelize.Op.or]: dataArray
         }
    }}).then((comms) => res.send(comms))
        .catch((err) =>{
            return res.send(err);
        })
    // if(validateGetRequest(req,res))
    //     res.json(api.getContent(JSON.parse(req.query.images)));
    // res.end();
});

/**
 * The route posting a comment on the received image by the received username.
 */
router.post('/', function(req, res, next) {
    const {picDate, content} = req.body;
    let creationDate = new Date();
    let username = req.session.username;
    let userid = req.session.userId;
    // get username + userid  + validate all data
    return db.Comments.create({picDate, username, userid, content,creationDate})
        .then((comment) => res.send(comment))
        .catch((err) => {
            //ERROR
        })
    // if(validateNewComment(req,res)) {
    //     api.add(req.body.picDate, req.body.username, req.body.content);
    //     updateTimeStamp();
    // }
    // res.end();
});

/**
 * The route deletes an image's comment if possible.
 */
router.delete('/', function(req, res, next) {
    const id = parseInt(req.params.id);
    let userid = req.session.userId;
    // validate that I can delete this comment -> the same user
    return db.Comments.findById(id)
        .then((comment) => comment.destroy({force: true}))
        .then(() => res.send({ id }))
        .catch((err) => {
            //ERROR
        })

    // if(validateDeleteRequest(req, res)){
    //     api.del(req.body.picDate, req.body.id);
    //     updateTimeStamp();
    // }
    // res.end();
});

/**
 * The route returns the time stamp of the last time the api data was modified.
 */
router.get('/timeStamp', (req, res) =>{
    res.json({"value": TIMESTAMP.toString()});
});


/**
 *
 */
function parseReq(req){
    // let dataArray = [];
    // for(const [index, name] of Object.entries(req)){
    //     if(this.#data[name] === undefined){
    //         this.#data[name] = {};
    //     }
    //     ans[name] = this.#data[name];
    // }
    return [["test", "test2", "test3"] ,3];
}

/**
 * The function validates that the received get request is in the right syntax needed to the request to function.
 * @param req The request.
 * @param res The response.
 */
function validateGetRequest(req, res){
    if(req.query === undefined || req.query.images === undefined) {
        res.statusMessage ="request's images array is missing!";
        res.status(400);
        return false;
    }
    try {
        req.query.images.split(",");
    }catch (e){
        res.statusMessage ="images format error";
        res.status(400);
        return false;
    }
    return true;
}

/**
 * The function validates that the received delete request is valid to the request to function.
 * @param req The request.
 * @param res The response.
 */
function validateDeleteRequest(req,res){
    if(validateBodyExistence(req,res)){
        if(req.body.picDate === undefined || req.body.id === undefined) {
            res.statusMessage = "required parameters are missing, The required parameters are image (url), username (string) " +
                "and comment (string)";
            res.status(400);
            return false;
        }
        if(!api.deleteIsLegal(req.body.picDate, req.body.id, req.body.username)) {
            res.statusMessage = "Illegal deletion request!";
            res.status(400);
            return false;
        }
    }
    else
        return false;
    return true;
}
/**
 * The function validates that the received request is in the right syntax so the server would be able to operate the
 * comment request.
 * @param req The request.
 * @param res The response.
 * @param api
 */
function validateNewComment(req, res, api){
    if(validateBodyExistence(req, res)){
        if(req.body.picDate === undefined || req.body.username === undefined || req.body.content === undefined){
            res.status(400);
            res.send("required parameters are missing, The required parameters are image (url), username (string) and comment (string)");
            return false;
        }
        if(!validateImageExistence(req, res, api)){
            return false;
        }
    }
    else
        return false;
    return true;

}

/**
 * The function validates that the received request contains a body.
 * @param req The request.
 * @param res The response.
 */
function validateBodyExistence(req, res){
    if(req.body === undefined){
        res.status(400);
        res.send("request has no body");
        return false;
    }
    return true;
}

/**
 * The function validates that the received image is exists at the database.
 * @param req The request.
 * @param res The response.
 */
function validateImageExistence(req, res){
    if(!api.imageIsExist(req.body.picDate)){
        res.status(400);
        res.send("image is not exists!");
        return false;
    }
    return true;
}

/**
 *  The function updated the TIMESTAMP parameter to the current time.
 */
function updateTimeStamp(){
    TIMESTAMP = Date.now();
}
module.exports = router;