const express = require('express');
const router = express.Router();
const comments = require('../controllers/commentsApi')

/**
 * This route receives a get request which contains an images array and returns a json of each image's comments.
 */
router.get('/', comments.commentsGet);

/**
 * The route handles the post request of '/' - gets a new comment and adds it to the DB
 */
router.post('/', comments.commentsPost);

/**
 * The route deletes a comment from the DB if possible - If the user who tried to
 * delete it is the owner of this comment.
 */
router.delete('/', comments.commentsDelete);

/**
 * This route gets dates of images to fetch comments from and a time-stamp that
 * represents that last update the person who sent the request did.
 * returns all comments that got updated later to the timestamp.
 */
router.get('/update', comments.commentsUpdate);

module.exports = router;