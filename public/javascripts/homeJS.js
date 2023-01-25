(function () {
    let TIMEOUT = setTimeout(updateImages, 15000);
    let USERNAME = "";
    let IMAGES = [];
    let SHOWN_DIV = "homepage-div";
    const APIKEY = "aKRnQfhPmxqeskcpdkcfomXKcIGbW1p8FFvuQhsa";
    const IMAGES_TO_FETCH = 5;
    let currStartDate = "";
    const NASA_API_URL = "https://api.nasa.gov/planetary/apod/"
    const COMMENTS_SERVER_URL = "/home/api"
    const SPINNER_BACKGROUND_CLASS_NAME = "spinner-background"
    let SPINNER_BACKGROUND_ELEMENT;
    let SHOW_MORE_BUTTON_ELEMENT;
    const MIN_OK_STATUS = 200;
    const MAX_OK_STATUS = 300;
    let MODAL_ERROR_MESSAGE_ELEMENT;
    let MODAL_ERROR_BUTTON_ELEMENT;
    let USER_DATE_ELEMENT;
    let CONTENT_ELEMENT;
    /**
     * This module is validates fields.
     * @type {{isValidItemId: (function(*)), isValidCommentsArray: (function(*)), isValidUsername: (function(*)), isValidTimeStamp: (function(*)), isValidDate: (function(*)), isValidURL: ((function(*): boolean)|*)}}
     */
    const validateModule =(function(){
        const PARAMS_IN_COMMENTS_ARRAY_RESULT = 2

        /**
         * this function is checking if the string is valid url address.
         * @param string - any string
         * @returns {boolean} - True if the string is url, otherwise false.
         */
        const isValidURL= (string)=>{
            try {
                new URL(string);
                return true;
            } catch (err) {
                return false;
            }
        }
        /**
         * Receives an object (should be a string) and return if it is a date.
         * @param object - any object
         * @returns {boolean} - true if it is valid date, otherwise false.
         */
        function isValidDate(object){

            return ((!!object && isString(object) &&
                object.toString().match(/\d{4}-\d{2}-\d{2}/)) && !!new Date(object))
        }

        /**
         * This function is checking if username is in the wanted format (only letters and digits).
         * @param userName -
         * @returns {boolean}
         */
        const isUserNameInFormat = (userName)=>{
            return (isString(userName) && !!userName.match(`^[a-zA-Z0-9]{1,${globalModule.MAX_USER_NAME_LENGTH}}$`,userName))
        }

        /**
         * Return if object is a string or not.
         * @param object
         * @returns {boolean}
         */
        const isString=(object)=>{
            return (object instanceof String || typeof (object) === "string")
        }

        /**
         * Return if username is valid (in wanted format and define)
         * @param object
         * @returns {boolean}
         */
        function isValidUsername(object){
            return (!!object && isUserNameInFormat(object))
        }

        /**
         * Return if item id is valid (in url format and define)
         * @param object
         * @returns {boolean}
         */
        function isValidItemId(object){
            return (!!object && isValidURL(object))
        }

        /**
         * This function is validate time stamp (integer number)
         * @param object
         * @returns {boolean}
         */
        function isValidTimeStamp(object){
            return (!!object && !isNaN(object) && Number.isInteger(object))
        }

        /**
         * Return if comments array is valid.
         * @param object
         * @returns {false|this is *[]}
         */
        function isValidCommentsArray(object){
            return (!!object && object instanceof Array && object.every((currentVal)=>{
                return currentVal.length === PARAMS_IN_COMMENTS_ARRAY_RESULT && isValidTimeStamp(currentVal[0])
            }))
        }

        return {
            isValidURL,
            isValidDate,
            isValidItemId,
            isValidTimeStamp,
            isValidCommentsArray,
            isValidUsername,
            isString
        }
    })();
    //----------------------------------- listeners initial's definition ----------------------------------------------

    document.addEventListener("DOMContentLoaded", () => {
        SPINNER_BACKGROUND_ELEMENT = document.getElementsByClassName(SPINNER_BACKGROUND_CLASS_NAME)[0]
        SHOW_MORE_BUTTON_ELEMENT = document.getElementById("show-more-button");
        MODAL_ERROR_MESSAGE_ELEMENT = document.getElementById("errorMessage");
        MODAL_ERROR_BUTTON_ELEMENT = document.getElementById("errorModalBtn");
        USER_DATE_ELEMENT = document.getElementById("pictureDate");
        CONTENT_ELEMENT = document.getElementById("content-list")
        const nasaFormElement = document.getElementById("dateForm");
        nasaFormElement.addEventListener("submit", function(event){
            //getData(event);
            onChangeDate(event)
        })
        SHOW_MORE_BUTTON_ELEMENT.addEventListener("click", function (){
            //fetchData(currStartDate, NASA_API_URL, false);
            sendNasaRequests()
        })

        //Display current date.
        let todaysDate = new Date();
        USER_DATE_ELEMENT.value = todaysDate.toISOString().substring(0,10);

        //Ask for the first time the feed page without user involved.
        const event = new Event("submit", {bubbles: true, cancelable: true});
        nasaFormElement.dispatchEvent(event);
    });


    /**
     * The function load 5 more images from the nasa api and displays it.
     * @param event click event parameter.
     */
    function getData(event){
        event.preventDefault();
        let theurl = event.target.action;
        let getDate = document.getElementById("pictureDate").value;
        fetchData(getDate, theurl);
    }


    /**
     * The function is showing the error message to the user inside a modal.
     * The assumption is the error argument is Error object.
     * @param error - Error object.
     */
    function errorHandler(error){
        // need to fix this function
        if (error.message) {

            const [status, errorMsg] = [...error.message.split(",")]
            if (status.includes("301") || status.includes("302")) {
                //do redirect from client and display error message
                return
            }
            else{
                MODAL_ERROR_MESSAGE_ELEMENT.innerText = `${errorMsg}`
            }
        }
        else{
            MODAL_ERROR_MESSAGE_ELEMENT.innerText = `${error}`
        }
        // document.getElementById(ERROR_MESSAGE_SECTION_ID).innerHTML =
        //     (error.message && error.message.includes("status"))?error.message: UNKNOWN_MESSAGE
        MODAL_ERROR_BUTTON_ELEMENT.click()


    }

    /**
     * The function is checking an error if there was status code < 200 or >=300.
     * The assumption is the response is a response from server.
     * @param response - A response object.
     * @returns {Promise<never>|Promise<unknown>}
     */
    async function status(response) {
        if (response.status >= MIN_OK_STATUS && response.status < MAX_OK_STATUS) {
            return response
        }
        else {
            return response.text().then(text =>{
                throw new Error(`status: ${response.status} ,error: ${text}`)
            })
        }
    }

    async function fetchRequest (url, responseHandler,dataForResHandler=undefined, request=undefined){
        //there needs to be many spinners, for loading comments for adding comments.. it can't be just in full page
        SPINNER_BACKGROUND_ELEMENT.classList.remove("d-none")
        try{
            let res = await fetch(url, request)
            await status(res)
            const data = await res.json()
            responseHandler(data,dataForResHandler)
        }
        catch(err) {
            SHOW_MORE_BUTTON_ELEMENT.classList.add("d-none")
            errorHandler(err)
        }
        SPINNER_BACKGROUND_ELEMENT.classList.add("d-none")
    }

    function onChangeDate (event){
        event.preventDefault();
        //think about moving it somewhere else
        if (validateModule.isValidDate(USER_DATE_ELEMENT.value)){
            currStartDate = USER_DATE_ELEMENT.value;
            CONTENT_ELEMENT.innerHTML = "";
            IMAGES = [];
            sendNasaRequests()
        }
        else{
            errorHandler(new Error("Error, you picked invalid date"))
        }
    }
    function sendNasaRequests(){
        const newDate = new Date(currStartDate);
        newDate.setDate(newDate.getDate() - IMAGES_TO_FETCH + 1);
        const start = newDate.toISOString().substring(0,10);
        const newStartDate = new Date(start);
        newStartDate.setDate(newStartDate.getDate() - 1);
        let params = new URLSearchParams()
        params.append("api_key", `${APIKEY}`)
        params.append("start_date", `${start}`)
        params.append("end_date", `${currStartDate}`)
        fetchRequest(`${NASA_API_URL}?${params.toString()}`,handleNasaResponse)
        currStartDate = newStartDate.toISOString().substring(0,10);
    }

    function handleNasaResponse(data){
        validateNasaResponse(data)
        //create here images without comments and display them
        let params = new URLSearchParams()
        //we should replace it with range of date and not all of the dates, just like nasa that taking start and end.
        params.append("images",`[${getPicsDates(data).toString()}]`)
        fetchRequest(`${COMMENTS_SERVER_URL}?${params.toString()}`,buildImages,data)
    }

    function validateNasaResponse(data){
        if (!data || !(data instanceof Array) || !data.length ||
            !data.every((element)=>validateModule.isValidURL(element.url) && validateModule.isValidDate(element.date)))
            throw (new Error("Error occurred while getting Nasa response"))
    }
    //will split to new function - one for new images and one for new comments
    function buildImages(comments, imagesData){
        //validate comments here
        let newImages = []
        imagesData.forEach(function(item){

            newImages.push(new Image(item, getImageComments(comments, item.date)));
        });
        //will be moved to the create images function.
        newImages.sort((a,b)=>{
            return b.getDate().toString().localeCompare(a.getDate().toString());
        });
        newImages.forEach(function (image){
            CONTENT_ELEMENT.appendChild(image.getHtml());
        })
        IMAGES.push(...newImages)
        console.log(IMAGES)
        SHOW_MORE_BUTTON_ELEMENT.classList.remove("d-none")
    }

    function validateComments(comments){

    }
    //
    // /**
    //  * The function fetch from NASA api the images links and displays it on the screen.
    //  * @param end The date of the most old pictures wanted to be displayed.
    //  * @param url The nasa url.
    //  * @param newPage Parameter that tells the function if the page need to be regenerated.
    //  */
    // function fetchData(end, url, newPage=true){
    //     SPINNER_BACKGROUND_ELEMENT.classList.remove("d-none")
    //     const newDate = new Date(end);
    //     newDate.setDate(newDate.getDate() - IMAGES_TO_FETCH + 1);
    //     let start = newDate.toISOString().substring(0,10);
    //     const newStartDate = new Date(start);
    //     newStartDate.setDate(newStartDate.getDate() - 1);
    //     currStartDate = newStartDate.toISOString().substring(0,10);
    //     fetch(`${url}?api_key=${APIKEY}&start_date=${start}&end_date=${end}`)
    //         .then(function(response) {
    //             return response.json();
    //         }).then(function (data) {
    //         fetch(`/home/api?images=[${getPicsDates(data).toString()}]`)
    //             .then(function (comments) {
    //                 return comments.json();
    //             }).then(function (comments){
    //                 //console.log(comments);
    //             let content = document.getElementById("content-list");
    //             if(newPage) {
    //                 IMAGES = [];
    //             }
    //             content.innerHTML = "";
    //             data.forEach(function(item){
    //                 console.log("here");
    //                 IMAGES.push(new Image(item, getImageComments(comments, item.date)));
    //             });
    //             IMAGES.sort((a,b)=>{
    //                 return b.getDate().toString().localeCompare(a.getDate().toString());
    //             });
    //             IMAGES.forEach(function (image){
    //                 content.appendChild(image.getHtml());
    //             })
    //             //showAndHide("show-more-button", "show");
    //             SHOW_MORE_BUTTON_ELEMENT.classList.remove("d-none")
    //         })
    //     }).catch(error =>{
    //         //showAndHide("show-more-button", "hide");
    //         SHOW_MORE_BUTTON_ELEMENT.classList.add("d-none")
    //         console.log("ERRORRRRRRR");
    //     })
    //         .finally(()=>{SPINNER_BACKGROUND_ELEMENT.classList.add("d-none")});
    // }

    /**
     *
     */
    function getImageComments(comments, date){
        let imageComments = [];
        comments.forEach(function(comment){
            if (comment.picDate === date){
                imageComments.push(comment);
            }
        })
        return imageComments;
    }

    /**
     * The function gets from the server the time stamp of its last database modification.
     */
    function updateImages(){
        fetchRequest(`${COMMENTS_SERVER_URL}/timeStamp`, handleUpdateResponse)
        //moved to handleUpdateResponse
        // fetch('home/api/timeStamp').then((response)=>{
        //     return response.json();
        // }).then((version)=>{
        //     IMAGES.forEach((image)=>{
        //         if(parseInt(version["value"]) > image.getLastUpdate())
        //             image.updateComments();
        //     });
        //     TIMEOUT = setTimeout(updateImages, 15000);
        // });
    }

    function handleUpdateResponse(version){
        IMAGES.forEach((image)=>{
            if(parseInt(version["value"]) > image.getLastUpdate())
                image.updateComments();
        });
        TIMEOUT = setTimeout(updateImages, 15000);
    }


    /**
     * The function gets from the NASA response the pictures urls.
     * @param data The NASA response.
     * @returns {*[]} A list of the pictures Dates.
     */
    function getPicsDates(data){
        let pics = [];
        data.forEach(function(pic){
            pics.push(`"${pic.date}"`);
        });
        return pics;
    }

    /**
     * The function validates that the received comment isn't empty.
     * @param id The comment id.
     * @returns {boolean} If the typed comment is not empty.
     */
    function sendCommentValid(id){
        let content = document.getElementById(id).value;
        return content.trim().length > 0;
    }
    function handleCommentsUpdateResponse(comments, currentImage){
        currentImage.handleCommentsUpdateResponse(comments)

    }

    function responseToChangeComments(_,currentImage){
        currentImage.updateComments()
    }

    class Image{
        #lastUpdate
        #date
        #data
        #comments = []
        #displayComments
        constructor(item, comments = []) {
            this.#lastUpdate = 0
            this.#date = item.date;
            this.#data = item;
            this.#displayComments = false;
            this.#comments = comments;
        }

        setComments(comments){
            //this will be change, we want to delete comments from don and insert new one

        }
        /**
         * The method returns the image HTML element.
         * @returns {HTMLLIElement} The image's html.
         */
        getHtml(){
            let ans = document.createElement('li');
            ans.className = "list-group-item";
            ans.id = `${this.#data.date}-post`;
            ans.appendChild(this.#generateHtml());
            return ans;
        }

        /**
         * The method generates or regenerates the image's html element.
         */
        #generateHtml(){
            let row = document.createElement("div");
            row.className = "row";
            row.appendChild(this.#getName());
            row.appendChild(this.#getImage());
            row.appendChild(this.#getInfo());
            row.appendChild(this.#getComments());
            row.appendChild(this.#getShowComments());
            return row;
        }
        /**
         * The method returns the images date (by the NASA api).
         * @returns {string}
         */
        getDate(){
            return this.#data.date;
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
            firstCol.className = "col-12"
            firstCol.innerText = `Copyright: ${this.#data.copyright ?? "Unknown"} Date: ${this.#data.date}`
            let secondCol = document.createElement("div")
            secondCol.className = "col-12"
            secondCol.innerText = `Explanation: ${this.#data.explanation ?? ""}`
            //ans.innerText = `Copyright: ${this.#data.copyright ?? "Unknown"}\nDate: ${this.#data.date}\nExplanation: ${this.#data.explanation}\n`;
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
                //showAndHide(`${this.#data.date}-comment_button`, "hide");
                //showAndHide(`${this.#data.date}-div`, "toggle");
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
            //div.className = "input-group";
            div.className = "input-group d-none";
            div.id = `${this.#data.date}-div`;
            //div.style = "display: none";
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
                //showAndHide(`${event.target.id}-comments`, "toggle");
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
        #getComments(){
            let comments = document.createElement('ol');
            //comments.className = "list-group col-12";
            comments.className = `list-group col-12 ${this.#displayComments ? "": "d-none"}`;
            comments.id = `${this.#data.date}-show-comments`;
            // comments.style.display = this.#displayComments ? "block" : "none";
            const imagePointer = this;
            imagePointer.#comments.forEach(function(val){
                let li = document.createElement('li');
                let username = document.createElement('p');
                let content = document.createElement('p');
                li.className = "list-group-item";
                username.innerText = `Username: ${val.username}`;
                content.innerText = `${val.content}`;
                li.appendChild(username);
                li.appendChild(content);
                //if(val.username === USERNAME)
                    li.appendChild(imagePointer.#getDelButton(val.id));
                comments.appendChild(li);
            })
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
            button.className = "btn btn-primary delete-comment";
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

        /**
         * This function updates the feed so the user will see the last updates
         */
        updateComments(){
            let params = new URLSearchParams()
            params.append("images",`["${this.#data.date}"]`)
            fetchRequest(`${COMMENTS_SERVER_URL}?${params.toString()}`,handleCommentsUpdateResponse, this)
            // fetch(`/home/api?images=["${this.#data.date}"]`)
            //     .then((response)=>{
            //         return response.json();
            //     }).then((comments)=>{
            //         this.#comments = comments;
            //         document.getElementById(`${this.#data.date}-post`).innerHTML = "";
            //         document.getElementById(`${this.#data.date}-post`).appendChild(this.#generateHtml());
            //         this.#lastUpdate = Date.now();
            // });

        }
        handleCommentsUpdateResponse(comments){
            this.#comments = comments;
            document.getElementById(`${this.#data.date}-post`).innerHTML = "";
            document.getElementById(`${this.#data.date}-post`).appendChild(this.#generateHtml());
            this.#lastUpdate = Date.now();
        }

        getLastUpdate(){
            return this.#lastUpdate;
        }
    }

})();