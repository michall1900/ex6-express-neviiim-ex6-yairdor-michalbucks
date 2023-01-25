class Image {
    #lastUpdate
    #date
    #data
    #comments = []
    #displayComments
    #imageHtml
    #commentsElement
    constructor(item) {
        this.#lastUpdate = 0
        this.#date = item.date;
        this.#data = item;
        this.#displayComments = false;
    }

    setComments(comments){
        //this will be change, we want to delete comments from dom and insert new one into it

        //easy way - don't delete from dom directly, but delete all the comments that should be deleted, then update
        //comments (this.#comments = comments). After that, use the code below to put again all comments in dom.
        //insert all comments
        this.#comments = comments
        this.#setHtmlComments()
    }

    getImageHtml(){
        if (!this.#imageHtml)
            this.#initializePictureHtml()
        return this.#imageHtml
    }

    /**
     * The method returns the images date (by the NASA api).
     * @returns {string}
     */
    getDate(){
        return this.#data.date;
    }

    #setHtmlComments(){
        //need to split to add new comments and delete or something like that.
        const comments = document.getElementById(`${this.#data.date}-show-comments`)
        comments.innerText = ""
        const imagePointer = this;
        imagePointer.#comments.forEach(function(val){
            let li = document.createElement('li');
            li.className = "list-group-item row mt-2 bg-light border-5 border-white";
            li.appendChild(imagePointer.#getUserDataCol(val))
            li.appendChild(imagePointer.#getContentAndDeleteCol(val))
            comments.appendChild(li);
        })
    }
    #getUserDataCol(val){
        let usersDataCol = document.createElement('div');
        usersDataCol.className = "col-12 col-lg-3 col-xl-2"
        let username = document.createElement('div');
        username.className = "row text-dark text-break fs-5 fw-bolder";
        username.innerText = `Username: ${val.username}`;
        usersDataCol.appendChild(username)
        return usersDataCol
    }
    #getContentAndDeleteCol(val){
        let contentAndDeleteCol = document.createElement('div');
        contentAndDeleteCol.className = "col-12 col-lg-9 col-xl-10"
        let content = document.createElement('div');
        content.className = "row text-body text-break text-body fs-5"
        content.innerText = `${val.content}`;
        contentAndDeleteCol.appendChild(content)
        //if(val.username === USERNAME)
            contentAndDeleteCol.appendChild(imagePointer.#getDelButton(val.id));
        return contentAndDeleteCol
    }
    #initializePictureHtml(){
        this.#imageHtml = document.createElement('li');
        this.#imageHtml.className = "list-group-item";
        this.#imageHtml.id = `${this.#data.date}-post`;
        let row = document.createElement("div");
        row.className = "row";
        row.appendChild(this.#getName());
        row.appendChild(this.#getImage());
        row.appendChild(this.#getInfo());
        row.appendChild(this.#getCommentsElement());
        row.appendChild(this.#getShowComments());
        this.#imageHtml.appendChild(row);
    }
    /**
     * This method creates and returns an h3 element with the title of the data
     * @returns {HTMLHeadingElement}
     */
    #getName(){
        let title = document.createElement("h3");
        title.innerText = this.#data.title;
        title.className = "col-12";
        return title;
    }

    /**
     * This method creates and returns an image or iframe element depends on the data media type
     * @returns {HTMLImageElement}
     */
    #getImage(){
        let ans = document.createElement(`${(this.#data.media_type === "video") ? "iframe": "img"}`)
        ans.src = this.#data.url;
        ans.alt = "";
        ans.className = "img-fluid col-6 nasa-images";
        return ans;
    }

    /**
     * This method creates and returns an p element with the title of the data
     * @returns {HTMLParagraphElement}
     */
    #getInfo(){
        let ans = document.createElement("div");
        ans.className = "col";
        let row = document.createElement("div");
        row.className = "row"
        let firstCol = document.createElement("div")
        firstCol.className = "col-12 text-break"
        firstCol.innerText = `Copyright: ${this.#data.copyright ?? "Unknown"} Date: ${this.#data.date}`
        let secondCol = document.createElement("div")
        secondCol.className = "col-12 my-2 text-break fs-5"
        secondCol.innerText = `Explanation: ${this.#data.explanation ?? ""}`
        row.appendChild(firstCol)
        row.appendChild(secondCol)
        ans.appendChild(row)
        return ans;
    }

    /**
     * This method creates and returns a button element allowing the user to click and add a comment
     * @returns {HTMLLIElement}
     */
    #getCommentButton(){
        let li = document.createElement("li");
        li.className = "list-group-item";
        let commentButton = document.createElement('button');
        commentButton.className = "comment-button btn btn-primary"
        commentButton.innerText = 'Comment';
        commentButton.id = `${this.#data.date}-comment_button`;
        commentButton.addEventListener("click", (event)=>{
            document.getElementById(`${this.#data.date}-comment_button`).classList.add("d-none")
            document.getElementById(`${this.#data.date}-div`).classList.toggle("d-none")
        });
        li.appendChild(commentButton);
        return li;
    }

    /**
     * This method creates and returns a button element allowing the user to click and add a comment
     * @returns {HTMLLIElement}
     */
    #getSendCommentButton(){
        let li = document.createElement("li");
        li.className = "list-group-item";
        let button = document.createElement("button");
        button.className ="input-group-text send-comment-button btn btn-primary";
        button.innerText = "Send Comment";
        button.addEventListener("click", (event)=> {
            if (sendCommentValid(`${this.#data.date}-text-area`)) {
                let message = {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        "picDate": this.#data.date,
                        "content": document.getElementById(`${this.#data.date}-text-area`).value
                    })
                }
                fetchRequest(`${COMMENTS_SERVER_URL}`, responseToChangeComments,this, message)
                // fetch("/home/api", {
                //     method: "POST",
                //     headers: {"Content-Type": "application/json"},
                //     body: JSON.stringify({
                //         "picDate": this.#data.date,
                //         "content": document.getElementById(`${this.#data.date}-text-area`).value
                //     })
                // }).then((res)=>{
                //     this.updateComments();
                // });
            }
        });
        li.appendChild(button);
        return li;
    }


    /**
     * This method creates and returns a textarea element for the user to write a comment in
     * @returns {HTMLDivElement}
     */
    #getCommentTextField(){
        let div = document.createElement('div');
        let textArea = document.createElement("textarea");
        div.className = "input-group d-none";
        div.id = `${this.#data.date}-div`;
        textArea.className = "col-12";
        textArea.ariaLabel= "With textarea";
        textArea.maxLength = "128";
        textArea.id = `${this.#data.date}-text-area`;
        div.appendChild(textArea);
        div.appendChild(this.#getSendCommentButton());
        return div;
    }

    /**
     * This method creates and returns a button for the user to clikc when he wants to see the comments
     * @returns {HTMLButtonElement}
     */
    #getShowComments(){
        let showComments = document.createElement("button");
        showComments.innerText = "Show Comments";
        showComments.id = `${this.#data.date}-show`;
        showComments.className = 'btn btn-primary col-12 my-2';
        showComments.addEventListener("click", (event)=>{
            this.#displayComments = !this.#displayComments;
            document.getElementById(`${event.target.id}-comments`).classList.toggle("d-none")
            showComments.innerText = this.#displayComments ? 'Hide Comments' : 'Show Comments';
        });
        return showComments
    }

    /**
     * This method creates and returns a ol of all the comments we have in the data for each image
     * returning it with the username and content data.
     * @returns {HTMLOListElement}
     */
    #getCommentsElement(){
        let comments = document.createElement('ol');
        comments.className = `list-group col-12 ${this.#displayComments ? "": "d-none"}`;
        comments.id = `${this.#data.date}-show-comments`;
        comments.appendChild(this.#getCommentButton());
        comments.appendChild(this.#getCommentTextField());
        return comments;
    }

    /**
     * This method creates and returns a button for the user to delete his comments
     * @param id
     * @returns {HTMLButtonElement}
     */
    #getDelButton(id){
        let button = document.createElement('button');
        button.className = "btn btn-primary delete-comment row";
        button.innerText = "Delete";
        button.id = `${this.#data.date}-${id}-del-button`;
        button.addEventListener("click", (event)=>{
            let params = new URLSearchParams();
            params.append("id", id.toString())
            let message = {method:"DELETE"}
            fetchRequest(`${COMMENTS_SERVER_URL}?${params.toString()}`,responseToChangeComments,this,message)
            // fetch(`/home/api?${params.toString()}`, {
            //     method: "DELETE"
            // }).then((event)=>{
            //     this.updateComments();
            // });
        });

        return button;
    }
}

class Image {
    #lastUpdate
    #date
    #data
    #comments = []
    #displayComments
    #imageHtml
    #commentsElement
    constructor(item) {
        this.#lastUpdate = 0
        this.#date = item.date;
        this.#data = item;
        this.#displayComments = false;
    }

    setComments(comments){
        //this will be change, we want to delete comments from dom and insert new one into it

        //easy way - don't delete from dom directly, but delete all the comments that should be deleted and
        //insert the new one.
        // After that, use the code below to put again all comments in dom.
        // Harder way - delete each element from dom, and add the new once
        // (you could give them to #setHtmlComments).
        this.#comments = comments
        this.#setHtmlComments(this.#comments)
    }

    getImageHtml(){
        if (!this.#imageHtml)
            this.#initializePictureHtml()
        return this.#imageHtml
    }

    /**
     * The method returns the images date (by the NASA api).
     * @returns {string}
     */
    getDate(){
        return this.#data.date;
    }

    #setHtmlComments(newComments){
        this.#commentsElement.innerText = ""
        const imagePointer = this;
        newComments.forEach(function(val){
            let li = document.createElement('li');
            li.className = "list-group-item row mt-2 bg-light border-5 border-white";
            li.appendChild(imagePointer.#getUserDataCol(val))
            li.appendChild(imagePointer.#getContentAndDeleteCol(val))
            imagePointer.#commentsElement.appendChild(li);
        })
    }
    #getUserDataCol(val){
        let usersDataCol = document.createElement('div');
        usersDataCol.className = "col-12 col-lg-3 col-xl-2"
        let username = document.createElement('div');
        username.className = "row text-dark text-break fs-5 fw-bolder";
        username.innerText = `Username: ${val.username}`;
        usersDataCol.appendChild(username)
        return usersDataCol
    }
    #getContentAndDeleteCol(val){
        let contentAndDeleteCol = document.createElement('div');
        contentAndDeleteCol.className = "col-12 col-lg-9 col-xl-10"
        let content = document.createElement('div');
        content.className = "row text-body text-break text-body fs-5"
        content.innerText = `${val.content}`;
        contentAndDeleteCol.appendChild(content)
        //if(val.username === USERNAME)
        contentAndDeleteCol.appendChild(this.#getDelButton(val.id));
        return contentAndDeleteCol
    }
    #initializePictureHtml(){
        this.#imageHtml = document.createElement('li');
        this.#imageHtml.className = "list-group-item";
        this.#imageHtml.id = `${this.#data.date}-post`;
        let row = document.createElement("div");
        row.className = "row";
        row.appendChild(this.#getName());
        row.appendChild(this.#getImage());
        row.appendChild(this.#getInfo());
        row.appendChild(this.#getCommentsElement());
        row.appendChild(this.#getShowComments());
        this.#imageHtml.appendChild(row);
    }
    /**
     * This method creates and returns an h3 element with the title of the data
     * @returns {HTMLHeadingElement}
     */
    #getName(){
        let title = document.createElement("h3");
        title.innerText = this.#data.title;
        title.className = "col-12";
        return title;
    }

    /**
     * This method creates and returns an image or iframe element depends on the data media type
     * @returns {HTMLImageElement}
     */
    #getImage(){
        let ans = document.createElement(`${(this.#data.media_type === "video") ? "iframe": "img"}`)
        ans.src = this.#data.url;
        ans.alt = "";
        ans.className = "img-fluid col-6 nasa-images";
        return ans;
    }

    /**
     * This method creates and returns an p element with the title of the data
     * @returns {HTMLParagraphElement}
     */
    #getInfo(){
        let ans = document.createElement("div");
        ans.className = "col";
        let row = document.createElement("div");
        row.className = "row"
        let firstCol = document.createElement("div")
        firstCol.className = "col-12 text-break"
        firstCol.innerText = `Copyright: ${this.#data.copyright ?? "Unknown"} Date: ${this.#data.date}`
        let secondCol = document.createElement("div")
        secondCol.className = "col-12 my-2 text-break fs-5"
        secondCol.innerText = `Explanation: ${this.#data.explanation ?? ""}`
        row.appendChild(firstCol)
        row.appendChild(secondCol)
        ans.appendChild(row)
        return ans;
    }

    /**
     * This method creates and returns a button element allowing the user to click and add a comment
     * @returns {HTMLLIElement}
     */
    #getCommentButton(){
        let li = document.createElement("li");
        li.className = "list-group-item";
        let commentButton = document.createElement('button');
        commentButton.className = "comment-button btn btn-primary"
        commentButton.innerText = 'Comment';
        commentButton.id = `${this.#data.date}-comment_button`;
        commentButton.addEventListener("click", (event)=>{
            document.getElementById(`${this.#data.date}-comment_button`).classList.add("d-none")
            document.getElementById(`${this.#data.date}-div`).classList.toggle("d-none")
        });
        li.appendChild(commentButton);
        return li;
    }

    /**
     * This method creates and returns a button element allowing the user to click and add a comment
     * @returns {HTMLLIElement}
     */
    #getSendCommentButton(){
        let li = document.createElement("li");
        li.className = "list-group-item";
        let button = document.createElement("button");
        button.className ="input-group-text send-comment-button btn btn-primary";
        button.innerText = "Send Comment";
        button.addEventListener("click", (event)=> {
            if (sendCommentValid(`${this.#data.date}-text-area`)) {
                let message = {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        "picDate": this.#data.date,
                        "content": document.getElementById(`${this.#data.date}-text-area`).value
                    })
                }
                fetchRequest(`${COMMENTS_SERVER_URL}`, responseToChangeComments,this, message)
                // fetch("/home/api", {
                //     method: "POST",
                //     headers: {"Content-Type": "application/json"},
                //     body: JSON.stringify({
                //         "picDate": this.#data.date,
                //         "content": document.getElementById(`${this.#data.date}-text-area`).value
                //     })
                // }).then((res)=>{
                //     this.updateComments();
                // });
            }
        });
        li.appendChild(button);
        return li;
    }


    /**
     * This method creates and returns a textarea element for the user to write a comment in
     * @returns {HTMLDivElement}
     */
    #getCommentTextField(){
        let div = document.createElement('div');
        let textArea = document.createElement("textarea");
        div.className = "input-group d-none";
        div.id = `${this.#data.date}-div`;
        textArea.className = "col-12";
        textArea.ariaLabel= "With textarea";
        textArea.maxLength = "128";
        textArea.id = `${this.#data.date}-text-area`;
        div.appendChild(textArea);
        div.appendChild(this.#getSendCommentButton());
        return div;
    }

    /**
     * This method creates and returns a button for the user to clikc when he wants to see the comments
     * @returns {HTMLButtonElement}
     */
    #getShowComments(){
        let showComments = document.createElement("button");
        showComments.innerText = "Show Comments";
        showComments.id = `${this.#data.date}-show`;
        showComments.className = 'btn btn-primary col-12 my-2';
        showComments.addEventListener("click", (event)=>{
            this.#displayComments = !this.#displayComments;
            document.getElementById(`${event.target.id}-comments`).classList.toggle("d-none")
            showComments.innerText = this.#displayComments ? 'Hide Comments' : 'Show Comments';
        });
        return showComments
    }

    /**
     * This method creates and returns a ol of all the comments we have in the data for each image
     * returning it with the username and content data.
     * @returns {HTMLOListElement}
     */
    #getCommentsElement(){
        this.#commentsElement = document.createElement('ol');
        this.#commentsElement.className = `list-group col-12 ${this.#displayComments ? "": "d-none"}`;
        this.#commentsElement.id = `${this.#data.date}-show-comments`;
        this.#commentsElement.appendChild(this.#getCommentButton());
        this.#commentsElement.appendChild(this.#getCommentTextField());
        return this.#commentsElement;
    }

    /**
     * This method creates and returns a button for the user to delete his comments
     * @param id
     * @returns {HTMLButtonElement}
     */
    #getDelButton(id){
        let button = document.createElement('button');
        button.className = "btn btn-primary delete-comment row";
        button.innerText = "Delete";
        button.id = `${this.#data.date}-${id}-del-button`;
        button.addEventListener("click", (event)=>{
            let params = new URLSearchParams();
            params.append("id", id.toString())
            let message = {method:"DELETE"}
            fetchRequest(`${COMMENTS_SERVER_URL}?${params.toString()}`,responseToChangeComments,this,message)
            // fetch(`/home/api?${params.toString()}`, {
            //     method: "DELETE"
            // }).then((event)=>{
            //     this.updateComments();
            // });
        });

        return button;
    }
}