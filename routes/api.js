const express = require('express');
const router = express.Router();

const API = require('../modules/apiMoudle');
const api = new API();

let TIMESTAMP = Date.now();

/**
 * The rout receives a get request which contains an images array and returns a json of each image's comments.
 */
router.get('/', function(req, res, next) {
    if(validateGetRequest(req,res))
        res.json(api.getContent(JSON.parse(req.query.images)));
    res.end();
});

/**
 * The route posting a comment on the received image by the received username.
 */
router.post('/', function(req, res, next) {
    if(validateNewComment(req,res)) {
        api.add(req.body.image, req.body.user, req.body.comment);
        updateTimeStamp();
    }
    res.end();
});

/**
 * The route deletes an image's comment if possible.
 */
router.delete('/', function(req, res, next) {
    if(validateDeleteRequest(req, res)){
        api.del(req.body.image, req.body.id);
        updateTimeStamp();
    }
    res.end();
});

/**
 * The route returns the time stamp of the last time the api data was modified.
 */
router.get('/timeStamp', (req, res) =>{
    res.json({"value": TIMESTAMP.toString()});
});

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
        if(req.body.image === undefined || req.body.user === undefined || req.body.id === undefined) {
            res.statusMessage = "required parameters are missing, The required parameters are image (url), username (string) " +
                "and comment (string)";
            res.status(400);
            return false;
        }
        if(!api.deleteIsLegal(req.body.image, req.body.id, req.body.user)) {
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
        if(req.body.image === undefined || req.body.user === undefined || req.body.comment === undefined){
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
    if(!api.imageIsExist(req.body.image)){
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