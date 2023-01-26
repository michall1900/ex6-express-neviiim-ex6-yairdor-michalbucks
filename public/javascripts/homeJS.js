(function () {
    let TIMEOUT = setTimeout(updateImages, 15000);
    let USERNAME = "";
    let IMAGES = [];
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
    const MAX_WORDS_NUMBER_IN_DESCRIPTION = 30
    /**
     * This module is validates fields.
     * @type {{isValidItemId: (function(*)), isValidCommentsArray: (function(*)), isValidTimeStamp: (function(*)), isValidDate: (function(*)), isString: (function(*)), isValidURL: ((function(*): boolean)|*)}}
     */
    const validateModule = (function () {
        const PARAMS_IN_COMMENTS_ARRAY_RESULT = 2

        /**
         * this function is checking if the string is valid url address.
         * @param string - any string
         * @returns {boolean} - True if the string is url, otherwise false.
         */
        const isValidURL = (string) => {
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
        function isValidDate(object) {

            return ((!!object && isString(object) &&
                object.toString().match(/\d{4}-\d{2}-\d{2}/)) && !!new Date(object))
        }


        /**
         * Return if object is a string or not.
         * @param object
         * @returns {boolean}
         */
        const isString = (object) => {
            return (object instanceof String || typeof (object) === "string")
        }


        /**
         * Return if item id is valid (in url format and define)
         * @param object
         * @returns {boolean}
         */
        function isValidItemId(object) {
            return (!!object && isValidDate(object))
        }

        /**
         * This function is validate time stamp (integer number)
         * @param object
         * @returns {boolean}
         */
        function isValidTimeStamp(object) {
            return (!!object && !isNaN(object) && Number.isInteger(object))
        }

        /**
         * Return if comments array is valid.
         * @param object
         * @returns {false|this is *[]}
         */
        function isValidCommentsArray(object) {
            return (!!object && object instanceof Array && object.every((currentVal) => {
                return currentVal.length === PARAMS_IN_COMMENTS_ARRAY_RESULT && isValidTimeStamp(currentVal[0])
            }))
        }

        return {
            isValidURL,
            isValidDate,
            isValidItemId,
            isValidTimeStamp,
            isValidCommentsArray,
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
        nasaFormElement.addEventListener("submit", function (event) {
            onChangeDate(event)
        })
        SHOW_MORE_BUTTON_ELEMENT.addEventListener("click", function () {
            sendNasaRequests()
        })

        //Display current date.
        let todaysDate = new Date();
        USER_DATE_ELEMENT.value = todaysDate.toISOString().substring(0, 10);

        //Ask for the first time the feed page without user involved.
        const event = new Event("submit", {bubbles: true, cancelable: true});
        nasaFormElement.dispatchEvent(event);
    });


    /**
     * The function is showing the error message to the user inside a modal.
     * @param error - Error object.
     */
    function errorHandler(error) {
        // need to fix this function
        if (error.message) {
            const [status, errorMsg] = [...error.message.split(",")]
            if (status.includes("301") || status.includes("302")) {
                //do redirect from client and display error message
                return
            } else {
                MODAL_ERROR_MESSAGE_ELEMENT.innerText = `${errorMsg??error}`
            }
        } else {
            MODAL_ERROR_MESSAGE_ELEMENT.innerText = `${error.msg??error}`
        }
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
        } else {
            return response.text().then(text => {
                throw new Error(`status: ${response.status} ,error: ${text}`)
            })
        }
    }

    async function fetchRequest(url, responseHandler,spinnerId, dataForResHandler = undefined, request = undefined) {
        //there needs to be many spinners, for loading comments for adding comments.. it can't be just in full page
        let spinnerElem
        if (spinnerId)
            spinnerElem = document.getElementById(spinnerId)

        if(spinnerElem)
            spinnerElem.classList.remove("d-none")
        try {
            let res = await fetch(url, request)
            await status(res)
            const data = await res.json()
            responseHandler(data, dataForResHandler)
        } catch (err) {
            SHOW_MORE_BUTTON_ELEMENT.classList.add("d-none")
            errorHandler(err)
        }
        if(spinnerElem)
            spinnerElem.classList.add("d-none")
    }

    function onChangeDate(event) {
        event.preventDefault();
        //think about moving it somewhere else
        if (validateModule.isValidDate(USER_DATE_ELEMENT.value)) {
            currStartDate = USER_DATE_ELEMENT.value;
            CONTENT_ELEMENT.innerHTML = "";
            IMAGES = [];
            sendNasaRequests()
        } else {
            errorHandler(new Error("Error, you picked invalid date"))
        }
    }

    function sendNasaRequests() {
        const newDate = new Date(currStartDate);
        newDate.setDate(newDate.getDate() - IMAGES_TO_FETCH + 1);
        const start = newDate.toISOString().substring(0, 10);
        const newStartDate = new Date(start);
        newStartDate.setDate(newStartDate.getDate() - 1);
        let params = new URLSearchParams()
        params.append("api_key", `${APIKEY}`)
        params.append("start_date", `${start}`)
        params.append("end_date", `${currStartDate}`)
        fetchRequest(`${NASA_API_URL}?${params.toString()}` ,handleNasaResponse, SPINNER_BACKGROUND_CLASS_NAME)
        currStartDate = newStartDate.toISOString().substring(0, 10);
    }

    function handleNasaResponse(data) {
        validateNasaResponse(data)
        let newImages = []
        data.forEach(function (item) {
            newImages.push(new Image(item));
        });
        newImages.sort((a, b) => {
            return b.getDate().toString().localeCompare(a.getDate().toString());
        });
        newImages.forEach(function (image) {
            CONTENT_ELEMENT.appendChild(image.getImageHtml());
        })
        let startIndex = IMAGES.length
        IMAGES.push(...newImages)
        let params = new URLSearchParams()
        //we should replace it with range of date and not all of the dates, just like nasa that taking start and end.
        params.append("images", `[${getPicsDates(data).toString()}]`)
        fetchRequest(`${COMMENTS_SERVER_URL}?${params.toString()}`,buildImages,SPINNER_BACKGROUND_CLASS_NAME, startIndex)
        SHOW_MORE_BUTTON_ELEMENT.classList.remove("d-none")
    }

    function validateNasaResponse(data) {
        if (!data || !(data instanceof Array) || !data.length ||
            !data.every((element) => validateModule.isValidURL(element.url) && validateModule.isValidDate(element.date)))
            throw (new Error("Error occurred while getting Nasa response"))
    }

    function buildImages(comments, startIndex) {
        //validateComments(comments)
        IMAGES.slice(startIndex).forEach((img) => {
            img.setComments(getImageComments(comments, img.getDate()))
        })
    }

    function validateComments(comments) {

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
    function getImageComments(comments, date) {
        let imageComments = [];
        comments.forEach(function (comment) {
            if (comment.picDate === date) {
                imageComments.push(comment);
            }
        })
        return imageComments;
    }

    /**
     * The function gets from the server the time stamp of its last database modification.
     */
    function updateImages() {
        fetchRequest(`${COMMENTS_SERVER_URL}/timeStamp`, handleUpdateResponse)
    }

    function handleUpdateResponse(version) {
        //should validate returned version format and check for value
        IMAGES.forEach((image) => {
            if (parseInt(version["value"]) > image.getLastUpdate())
                image.updateComments();
        });
        TIMEOUT = setTimeout(updateImages, 15000);
    }


    /**
     * The function gets from the NASA response the pictures urls.
     * @param data The NASA response.
     * @returns {*[]} A list of the pictures Dates.
     */
    function getPicsDates(data) {
        let pics = [];
        data.forEach(function (pic) {
            pics.push(`"${pic.date}"`);
        });
        return pics;
    }

    /**
     * The function validates that the received comment isn't empty.
     * @param id The comment id.
     * @returns {boolean} If the typed comment is not empty.
     */
    function sendCommentValid(id) {
        let content = document.getElementById(id).value;
        return content.trim().length > 0;
    }

    function handleCommentsUpdateResponse(comments, currentImage) {
        currentImage.setComments(comments)
    }

    function responseToChangeComments(_, currentImage) {
        currentImage.updateComments()
    }
    /**
     * This function is checking if there is need to split the explanation (explanation > MAX_WORDS_NUMBER_IN_DESCRIPTION)
     * It returns the result of the splitting if there was one.
     * The assumption is the explanation is a text.
     * @param explanation - Text
     * @returns {{isSplit: boolean, beforeMore: string, afterMore: string}}
     */
    function isNeedToSplit(explanation){
        let splitDescription,beforeMore ="", afterMore=""
        let isSplit = false
        if (explanation){
            splitDescription =  explanation.split(" ")
            if (splitDescription.length >= MAX_WORDS_NUMBER_IN_DESCRIPTION) {
                isSplit = true
                beforeMore = splitDescription.slice(0, MAX_WORDS_NUMBER_IN_DESCRIPTION).join(" ")
                afterMore = splitDescription.slice(MAX_WORDS_NUMBER_IN_DESCRIPTION).join(" ")
            }
            else
                beforeMore = explanation
        }
        return {isSplit: isSplit, beforeMore:beforeMore, afterMore:afterMore}
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

        setComments(comments) {
            //this will be change, we want to delete comments from dom and insert new one into it

            //easy way - don't delete from dom directly, but delete all the comments that should be deleted and
            //insert the new one.
            // After that, use the code below to put again all comments in dom.
            // Harder way - delete each element from dom, and add the new once
            // (you could give them to #setHtmlComments).
            this.#comments = comments
            this.#setHtmlComments(this.#comments)
            this.#lastUpdate = Date.now();
        }

        getImageHtml() {
            if (!this.#imageHtml)
                this.#initializePictureHtml()
            return this.#imageHtml
        }

        /**
         * The method returns the images date (by the NASA api).
         * @returns {string}
         */
        getDate() {
            return this.#date;
        }

        #setHtmlComments(newComments) {
            this.#commentsElement.innerText = ""
            const imagePointer = this;
            newComments.forEach(function (val) {
                let li = document.createElement('li');
                li.className = "list-group-item mt-2 bg-light border-5 border-white";
                let div = document.createElement("div")
                div.className = "row align-items-center"
                div.appendChild(imagePointer.#getUserDataCol(val))
                div.appendChild(imagePointer.#getContentAndDeleteCol(val))
                li.appendChild(div)
                imagePointer.#commentsElement.appendChild(li);
            })
        }

        #getUserDataCol(val) {
            let usersDataCol = document.createElement('div');
            usersDataCol.className = "col-12 col-lg-3 col-xl-2"
            let username = document.createElement('div');
            username.className = "text-dark text-break fw-bold";
            username.innerText = `${val.username}`;
            usersDataCol.appendChild(username)
            return usersDataCol
        }

        #getContentAndDeleteCol(val) {
            let contentAndDeleteCol = document.createElement('div');
            contentAndDeleteCol.className = "col-12 col-lg-9 col-xl-10"
            let contentDiv = document.createElement('div')
            contentDiv.className = "row align-items-center"
            let content = document.createElement('div');
            content.className = "col-9 text-body text-break text-body "
            content.innerText = `${val.content}`;
            contentDiv.appendChild(content)
            //if(val.username === USERNAME)
                contentDiv.appendChild(this.#getDelButton(val.id))
            contentAndDeleteCol.appendChild(contentDiv)
            return contentAndDeleteCol
        }

        #initializePictureHtml() {
            this.#imageHtml = document.createElement('li');
            this.#imageHtml.className = "list-group-item";
            this.#imageHtml.id = `${this.#date}-post`;
            let imageRow = document.createElement("div");
            imageRow.className = "row";
            imageRow.appendChild(this.#getName());
            imageRow.appendChild(this.#getImage());
            imageRow.appendChild(this.#getInfo());
            this.#imageHtml.appendChild(imageRow);
            let commentsRow = document.createElement("div")
            commentsRow.className = "row"
            commentsRow.appendChild(this.#getCommentsElement());
            commentsRow.appendChild(this.#getShowComments());
            this.#imageHtml.appendChild(commentsRow);
        }

        /**
         * This method creates and returns an h3 element with the title of the data
         * @returns {HTMLHeadingElement}
         */
        #getName() {
            let title = document.createElement("h3");
            title.innerText = this.#data.title;
            title.className = "col-12";
            return title;
        }

        /**
         * This method creates and returns an image or iframe element depends on the data media type
         * @returns {HTMLDivElement}
         */
        #getImage() {
            let div = document.createElement("div")
            div.className="col-5 col-lg-3"
            let img = document.createElement(`${(this.#data.media_type === "video") ? "iframe" : "img"}`)
            img.src = this.#data.url;
            img.alt = "";
            img.className = "img-fluid nasa-images";
            div.appendChild(img)
            return div;
        }

        /**
         * This method creates and returns an p element with the title of the data
         * @returns {HTMLDivElement}
         */
        #getInfo() {
            let ans = document.createElement("div");
            ans.className = "col-7 col-lg-9";
            let row = document.createElement("div");
            row.className = "row"
            let firstCol = document.createElement("div")
            firstCol.className = "col-12 text-break"
            firstCol.innerText = `Copyright: ${this.#data.copyright ?? "Unknown"}`
            let secondCol = document.createElement("div")
            firstCol.className = "col-12 text-break"
            secondCol.innerText = `Date: ${this.#date}`

            row.appendChild(firstCol)
            row.appendChild(secondCol)
            row.appendChild(this.#getExplanation())
            ans.appendChild(row)
            return ans;
        }
        #getExplanation(){
            let {isSplit, beforeMore, afterMore } =isNeedToSplit(this.#data.explanation)
            let thirdCol = document.createElement("div")
            thirdCol.className = "col-12 my-2 text-break text-body"
            let row = document.createElement("div")
            row.className = "row text-break text-body"
            let beforeMoreCol = document.createElement("div")
            beforeMoreCol.className = "col-12"
            beforeMoreCol.innerText = `Explanation: ${beforeMore?? ""}`
            if (isSplit)
                this.#getMoreColumnsElements(beforeMoreCol, afterMore).forEach((elem)=> row.appendChild(elem))
            else
                row.appendChild(beforeMoreCol)
            thirdCol.appendChild(row)
            return thirdCol
        }

        #getMoreColumnsElements(beforeMoreCol, afterMoreText){
            let afterMoreCol = document.createElement("div")
            afterMoreCol.className = "col-auto me-auto mt-2"
            let dots = document.createElement("span")
            dots.className = "d-lg-none"
            dots.innerText = "..."
            let moreText = document.createElement("span")
            moreText.className = "d-none d-lg-block text-break"
            moreText.innerText = ` ${afterMoreText}`
            let moreButton = document.createElement("button")
            moreButton.className = "btn btn-secondary d-lg-none"
            moreButton.innerText = "Read more"
            moreButton.addEventListener("click",()=>{
                dots.classList.toggle('d-none')
                moreText.classList.toggle('d-none')
                moreButton.innerText = (moreButton.innerText === "Read more") ? "Read less":"Read more"
            })
            beforeMoreCol.appendChild(dots)
            beforeMoreCol.appendChild(moreText)
            afterMoreCol.appendChild(moreButton)
            return [beforeMoreCol, afterMoreCol]
        }

        /**
         * This method creates and returns a button element allowing the user to click and add a comment
         * @returns {HTMLDivElement}
         */
        #getCommentButton() {
            let row = document.createElement("div");
            row.className = "row mt-2";
            row.id = `${this.#date}-comment_button`
            let col = document.createElement("col")
            col.className = "col"
            let commentButton = document.createElement('button');
            commentButton.className = "comment-button btn btn-primary "
            commentButton.innerText = 'Comment';
            commentButton.addEventListener("click", (event) => {
                document.getElementById(`${this.#date}-comment_button`).classList.add("d-none")
                document.getElementById(`${this.#date}-div`).classList.toggle("d-none")
            });
            col.appendChild(commentButton)
            row.appendChild(col);
            return row;
        }

        /**
         * This method creates and returns a button element allowing the user to click and add a comment
         * @returns {HTMLDivElement}
         */
        #getSendCommentButton() {
            let div = document.createElement("div");
            div.className = "col mt-2";
            let button = document.createElement("button");
            button.className = "input-group-text send-comment-button btn btn-primary";
            button.innerText = "Send Comment";
            button.addEventListener("click", (event) => {
                if (sendCommentValid(`${this.#date}-text-area`)) {
                    let message = {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({
                            "picDate": this.#date,
                            "content": document.getElementById(`${this.#date}-text-area`).value
                        })
                    }
                    document.getElementById(`${this.#date}-text-area`).value = ""
                    document.getElementById(`${this.#date}-div`).classList.add("d-none")
                    document.getElementById(`${this.#date}-comment_button`).classList.remove("d-none")

                    fetchRequest(`${COMMENTS_SERVER_URL}`, responseToChangeComments,`${this.#date}-spinner`, this, message)
                }
                else{
                    errorHandler(new Error("Invalid comment content. Comment couldn't be empty or bigger than 128 characters"))
                }
            });
            div.appendChild(button);
            return div;
        }


        /**
         * This method creates and returns a textarea element for the user to write a comment in
         * @returns {HTMLDivElement}
         */
        #getCommentTextField() {
            let div = document.createElement('div');
            let textArea = document.createElement("textarea");
            div.className = "row mt-2 d-none";
            div.id = `${this.#date}-div`;
            textArea.className = "col-12 border-dark";
            textArea.ariaLabel = "With textarea";
            textArea.maxLength = 128;
            textArea.minLength = 1;
            textArea.id = `${this.#date}-text-area`;
            div.appendChild(textArea);
            div.appendChild(this.#getSendCommentButton());
            return div;
        }

        /**
         * This method creates and returns a button for the user to clikc when he wants to see the comments
         * @returns {HTMLButtonElement}
         */
        #getShowComments() {
            let showComments = document.createElement("button");
            showComments.innerText = "Show Comments";
            showComments.id = `${this.#date}-show`;
            showComments.className = 'btn btn-primary col-12 my-2';
            showComments.addEventListener("click", (event) => {
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
        #getCommentsElement() {
            let ans = document.createElement('div')
            ans.className = `col-12 ${this.#displayComments ? "" : "d-none"}`
            ans.id = `${this.#date}-show-comments`
            this.#commentsElement = document.createElement('ol');
            this.#commentsElement.className = `list-group container`;
            this.#commentsElement.id = `${this.#date}-show-all-comments`;
            ans.appendChild(this.#commentsElement)
            ans.appendChild(this.#getSpinner())
            ans.appendChild(this.#getCommentButton());
            ans.appendChild(this.#getCommentTextField());
            return ans;
        }

        #getSpinner(){
            const div = document.createElement("div")
            div.className = "text-align-center d-none"
            div.id = `${this.#date}-spinner`
            const spinner = document.createElement("div")
            spinner.className="spinner-border"
            div.appendChild(spinner)
            return div
        }
        /**
         * This method creates and returns a button for the user to delete his comments
         * @param id
         * @returns {HTMLDivElement}
         */
        #getDelButton(id) {
            let buttonDiv = document.createElement("div")
            buttonDiv.className = "col-3 me-auto mt-2"
            let button = document.createElement('button');
            button.className = "btn btn-secondary delete-comment ";
            button.innerText = "Delete";
            button.id = `${this.#date}-${id}-del-button`;
            button.addEventListener("click", (event) => {
                let params = new URLSearchParams();
                params.append("id", id.toString())
                let message = {method: "DELETE"}
                fetchRequest(`${COMMENTS_SERVER_URL}?${params.toString()}`, responseToChangeComments, `${this.#date}-spinner`, this, message)
            });
            buttonDiv.appendChild(button)
            return buttonDiv;
        }

        updateComments() {
            let params = new URLSearchParams()
            params.append("images", `["${this.#date}"]`)
            fetchRequest(`${COMMENTS_SERVER_URL}?${params.toString()}`, handleCommentsUpdateResponse,`${this.#date}-spinner`, this)
        }

        getLastUpdate() {
            return this.#lastUpdate;
        }
    }
})();
