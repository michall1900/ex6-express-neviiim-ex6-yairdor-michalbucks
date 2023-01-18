module.exports = class Database{
    #data;
    constructor() {
        this.#data ={};
    }

    /**
     * The method build a dictionary of each picture's comments at the received request. if the picture isn't exist
     * at the database it creates an empty comments dictionary for that picture and returns it.
     * @param req A dictionary of the wanted pictures.
     * @returns {{}} The pictures' comments at the database.
     */
    getContent(req){
        let ans = {}
        for(const [index, name] of Object.entries(req)){
            if(this.#data[name] === undefined){
                this.#data[name] = {};
            }
            ans[name] = this.#data[name];
        }
        return ans;
    }

    /**
     * The method adds a new comment to an image, if there is no such image the function don't add it.
     * @param image The comment's image.
     * @param user The comment writer.
     * @param comment The comment content.
     */
    add(image,user, comment){
        if(this.imageIsExist(image)) {
            let commentId = this.#generateId(image);
            this.#data[image][commentId] = [user, comment];
        }
    }

    /**
     * The method generates and returns an id for a new picture's comment.
     * @param img The image url.
     * @returns {number} The new comment id.
     */
    #generateId(img){
        let ans = -1;
        for(let id in this.#data[img]){
            if(ans === -1 || ans < id)
                ans = id;
        }
        ++ans;
        return ans;
    }

    /**
     *  The method deletes a comment by its id if the comment's writer's username was received.
     * @param image The comment's image.
     * @param id The comment id.
     */
    del(image, id){
        delete this.#data[image][id];
    }

    /**
     * The method returns if the received deletion's parameters are valid to delete the received comment.
     * @param image
     * @param id
     * @param username
     */
    deleteIsLegal(image, id, username){
        return (this.imageIsExist(image) && id in this.#data[image] && username === this.#data[image][id][0]);
    }

    /**
     * The method returns if the received image exits at the database.
     * @param image Checked image.
     * @returns {boolean} If the image exits at the database.
     */
    imageIsExist(image){
        return image in this.#data;
    }
}