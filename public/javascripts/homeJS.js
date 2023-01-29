(function () {
    let TIMEOUT = setTimeout(updateImagesComments, 15000);
    let IMAGES = [];
    const TOKEN_ID = "token"
    let TOKEN
    const APIKEY = "aKRnQfhPmxqeskcpdkcfomXKcIGbW1p8FFvuQhsa";
    const IMAGES_TO_FETCH = 5;
    let currStartDate = "";
    const NASA_API_URL = "https://api.nasa.gov/planetary/apod/"
    const COMMENTS_SERVER_URL = "/home/api"
    const SPINNER_BACKGROUND_CLASS_NAME = "spinner-background"
    let SPINNER_BACKGROUND_ELEMENT;
    let SHOW_MORE_BUTTON_ELEMENT;
    const ERROR_WITH_API_SERVER = "There is an error with api server"
    const ERROR_WITH_NASA_SERVER = "There is an error with NASA server"
    const MIN_OK_STATUS = 200;
    const MAX_OK_STATUS = 300;
    let MODAL_ERROR_MESSAGE_ELEMENT;
    let MODAL_ERROR_BUTTON_ELEMENT;
    let USER_DATE_ELEMENT;
    let CONTENT_ELEMENT;
    const MAX_WORDS_NUMBER_IN_DESCRIPTION = 30
    let TIMESTAMP = "0"
    const INVALID_DATE_ERROR ="Error, you picked invalid date"
    const INVALID_CONTENT_ERROR= "Invalid comment content. Comment couldn't be empty or bigger than 128 characters"

    /**
     * This module is validates fields.
     * @type {{isValidCommentsObject: (function(*)), isValidTimeStamp: (function(*)), isValidDate: (function(*)), isString: (function(*)), isValidURL: ((function(*): boolean)|*)}}
     */
    const validateModule = (function () {
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
                object.toString().match(/\d{4}-\d{2}-\d{2}/)) && isValidTimeStamp(object))
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
         * This function is validate time stamp (integer number)
         * @param object
         * @returns {boolean}
         */
        function isValidTimeStamp(object) {
            return !!object && !((new Date(object)).toString().toLowerCase().includes("invalid date")) && new Date (object) <= new Date()
        }

        /**
         * checks that the date exists.
         * @param date
         * @returns {boolean}
         */
        const isValidExistDate = (date)=>{
            return isValidDate(date) && !!IMAGES.find(img => img.getDate() === date)
        }
        /**
         * checks that all keys are valid dates
         * @param keys
         * @returns {*}
         */
        const isAllKeysAreValidDates = (keys)=>{
            return keys.every((val)=> isValidExistDate(val))
        }
        /**
         * Checks that the value can be added
         * @param addValues
         * @returns {*}
         */
        const isValidAddValue = (addValues)=>{
            return addValues.every((elem)=>{return (typeof elem.couldDelete === "boolean" && elem.comment && elem.comment.username
                && elem.comment.id && elem.comment.content && isValidTimeStamp(elem.comment.updatedAt))})

        }
        /**
         * Checks that the comment structure is valid
         * @param CommentsValues
         * @returns {false|*|boolean}
         */
        const isValidCommentStructure = (CommentsValues) =>{
            return  CommentsValues.add && CommentsValues.add instanceof Array && isValidAddValue(CommentsValues.add) &&
                CommentsValues.delete && CommentsValues.delete instanceof Array
        }
        /**
         * Checks that the comment object is valid
         * @param commentsObj
         * @returns {*|this is unknown[]}
         */
        const isValidCommentsObject = (commentsObj)=> {
            return (isAllKeysAreValidDates(Object.keys(commentsObj)) &&
                Object.values(commentsObj).every((val) =>
                    isValidCommentStructure(val)))
        }

        return {
            isValidURL,
            isValidDate,
            isValidCommentsObject,
            isValidTimeStamp,
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
        CONTENT_ELEMENT = document.getElementById("content-list");
        let tokenElement = document.getElementById(TOKEN_ID)
        TOKEN = (tokenElement && tokenElement.innerText.match(/[a-zA-Z0-9]+/))?  tokenElement.innerText:""
        tokenElement.remove()
        document.querySelectorAll(`#closeModal1, #closeModal2`).forEach((elem)=>{
            elem.addEventListener("click",(event)=>{
                MODAL_ERROR_MESSAGE_ELEMENT.innerText = ""
            })
        })
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
        if (MODAL_ERROR_MESSAGE_ELEMENT.innerText.match("[a-z]+"))
            MODAL_ERROR_BUTTON_ELEMENT.click()
    });


    /**
     * The function is showing the error message to the user inside a modal.
     * @param error - Error object.
     */
    function displayError(error) {
        MODAL_ERROR_MESSAGE_ELEMENT.innerHTML = `${error.message ?? error}`
        MODAL_ERROR_BUTTON_ELEMENT.click()


    }

    /**
     * The function is checking if there was status code < 200 or >=300 in the respone.
     * It checks if
     * The assumption is the response is server's response.
     * @param response
     * @param url
     * @returns {Promise<any>}
     */
    function status(response,url) {
        const isNasaRequest = url.includes(NASA_API_URL)

        //If everything ok
        if (response.status >= MIN_OK_STATUS && response.status < MAX_OK_STATUS) {
            return Promise.resolve(response)
        }

        //If server api ask to redirect
        else if((response.status === 301 || response.status===302) && !isNasaRequest){
            return redirectUser(response)
        }

        //If server api wants to render
        else if (response.status === 404 && !isNasaRequest){
            return renderWindow(response)
        }
        //There is an error we need to handle with
        else {
            return getError(response, isNasaRequest)
        }

    }

    /**
     * When the server asks to render the page while we are in a fetch
     * @param response
     * @returns {any}
     */
    function renderWindow(response){
        let parser = new DOMParser();
        return response.text()
            .then(html=>{
                let doc = parser.parseFromString(html, "text/html");

                // Select the elements that you want to update
                let container = document.querySelector('.container');
                let title = document.querySelector('title');

                // Update the elements
                container.innerHTML = doc.querySelector('.container').innerHTML;
                title.innerHTML = doc.querySelector('title').innerHTML;
                return Promise.reject(new Error ("Page not found"))
            })
    }

    /**
     * redirects the user
     * @param response
     * @returns {Promise<never>}
     */
    function redirectUser(response){
        const currentWindow = window
        return Promise.resolve(response)
            .then(res=>res.json())
            .then((data)=>{
                currentWindow.location.href= data.redirect
                return Promise.reject(new Error("Redirected"))
            })
    }

    /**
     * returns the error in the response
     * @param response
     * @param isNasaRequest
     * @returns {Promise<never>}
     */
    function getError(response, isNasaRequest){
        return Promise.resolve(response)
            .then((data)=>{
                try {
                    return data.json()
                }
                catch{
                    return Promise.reject(data).then(res=>res.text()).
                    then(text => Promise.reject(new Error(`status ${response.status??"unknown"}: error: ${text}`)))
                }
            })
            .then((jsonData)=>
                Promise.reject(new Error(`status ${jsonData.code??jsonData.status}:
                     ${jsonData.msg?? jsonData.message??((isNasaRequest)? ERROR_WITH_NASA_SERVER: ERROR_WITH_API_SERVER)}`) ))
            .catch ((err) => {return Promise.reject(new Error(err.message))} )
    }

    /**
     *  responsible on fetching new data from the api.
     * @param url
     * @param responseHandler
     * @param spinnerElementsArr
     * @param dataForResHandler
     * @param request
     * @returns {Promise<void>}
     */
    async function fetchRequest(url, responseHandler,spinnerElementsArr=[], dataForResHandler = undefined, request = {}) {
        //there needs to be many spinners, for loading comments for adding comments.. it can't be just in full page
        let spinnerElements = getValidWorkingSpinners(spinnerElementsArr)
        request = addRelevantHeaders(request)

        fetch(url, request)
            .then((res) => {
                return status(res, url)
            })
            .then(function (response) {
                return response.json();
            })
            .then(data => responseHandler(data, dataForResHandler))
            .catch((err) => {
                //if there is a problem with nasa response, we don't want to show the load more button.
                //also, we don't want to timeout work when there is no images.
                if (url.includes(NASA_API_URL)) {
                    SHOW_MORE_BUTTON_ELEMENT.classList.add("d-none")
                    if (!IMAGES.length)
                        clearTimeout(TIMEOUT)
                }
                displayError(err)
            })
            .finally(() => {
                turnOffSpinners(spinnerElements)
            })
    }

    /**
     * push and return the spinner elements
     * @param spinnerElementsArr
     * @returns {*[]}
     */
    function getValidWorkingSpinners(spinnerElementsArr){
        let spinnerElements = []
        spinnerElementsArr.forEach((elem)=>{
            if(elem) {
                spinnerElements.push(elem)
                elem.classList.remove("d-none")
            }
        })
        return spinnerElements
    }

    /**
     * Add headers to the request
     * @param request
     * @returns {{headers}|*}
     */
    function addRelevantHeaders(request){
        if (!request.headers){
            request.headers = {}
        }
        request.headers['X-Is-Fetch'] = 'true'
        request.headers['token'] = `${TOKEN}`
        return request
    }

    /**
     * turn off spinners
     * @param spinnerElements
     */
    function turnOffSpinners(spinnerElements){
        spinnerElements.forEach((spinnerElem)=>{
            spinnerElem.classList.add("d-none")})
    }

    /**
     *
     * @param event
     */
    function onChangeDate(event) {
        event.preventDefault();
        //think about moving it somewhere else
        if (validateModule.isValidDate(USER_DATE_ELEMENT.value)) {
            currStartDate = USER_DATE_ELEMENT.value;
            CONTENT_ELEMENT.innerHTML = "";
            IMAGES = [];
            sendNasaRequests()
        } else {
            displayError(new Error(INVALID_DATE_ERROR))
        }
    }

    /**
     * Sends the request to nasa api to fetch images
     */
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
        fetchRequest(`${NASA_API_URL}?${params.toString()}` ,handleNasaResponse, [SPINNER_BACKGROUND_ELEMENT])
        currStartDate = newStartDate.toISOString().substring(0, 10);
    }

    /**
     * Handles the nasa response from the fetch request -> create the HTML based on the response
     * @param data
     */
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

        params.append("images", `[${getPicsDates(newImages).toString()}]`)
        fetchRequest(`${COMMENTS_SERVER_URL}?${params.toString()}`,setComments,[SPINNER_BACKGROUND_ELEMENT], startIndex)
        SHOW_MORE_BUTTON_ELEMENT.classList.remove("d-none")
    }

    /**
     * valides nasas response
     * @param data
     */
    function validateNasaResponse(data) {
        if (!data || !(data instanceof Array) || !data.length ||
            !data.every((element) => validateModule.isValidURL(element.url) && validateModule.isValidDate(element.date)))
            throw (new Error(ERROR_WITH_NASA_SERVER))
    }

    /**
     * sets each image and his comments + the timestamp to be the last update on the image
     * @param comments
     * @param startIndex
     */
    function setComments(comments, startIndex) {
        validateComments(comments)

        IMAGES.slice(startIndex).forEach((img) => {
            img.setComments(getImageComments(comments.comments, img.getDate()), comments.lastUpdate)
        })
        if(comments.lastUpdate && comments.lastUpdate > TIMESTAMP) {
            TIMESTAMP = comments.lastUpdate
        }
        TIMEOUT = setTimeout(updateImagesComments, 15000);
    }

    /**
     * validates the comments.
     * @param comments
     */
    function validateComments(comments) {

        if (!comments.comments || !comments.lastUpdate || !validateModule.isValidTimeStamp(comments.lastUpdate) ||
            !validateModule.isValidCommentsObject(comments.comments))
            throw new Error(ERROR_WITH_API_SERVER)
    }

    /**
     * returns the comments in the date specified.
     * @param comments
     * @param date
     * @returns {*}
     */
    function getImageComments(comments, date) {
        return comments[date]??{}
    }

    /**
     * The function gets from the server the time stamp of its last database modification.
     */
    function updateImagesComments() {
        clearTimeout(TIMEOUT)
        let params = new URLSearchParams()
        //we should replace it with range of dates and not all of the dates, just like nasa that taking start and end.
        let dates = getPicsDates(IMAGES)
        dates.push(`"${TIMESTAMP}"`)
        params.append("images", `[${dates.toString()}]`)
        fetchRequest(`${COMMENTS_SERVER_URL}/update?${params.toString()}`, setComments,getSpinnersElements(),0)
    }

    /**
     * finds the image spinners and returns it.
     * @returns {*[]}
     */
    function getSpinnersElements(){
        let spinnersElementsArr = []
        IMAGES.forEach((img)=>{
            spinnersElementsArr.push(img.getSpinnerElement())
        })
        return spinnersElementsArr
    }


    /**
     * The function gets from the NASA response the pictures urls.
     * @param data The NASA response.
     * @returns {*[]} A list of the pictures Dates.
     */
    function getPicsDates(data) {
        let pics = [];
        data.forEach(function (pic) {
            pics.push(`"${pic.getDate()}"`);
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
        #date
        #data
        #comments = new Map() //key=comment Id, value = element
        #displayComments
        #imageHtml
        #commentsElement
        #spinnerElement

        constructor(item) {
            this.#date = item.date;
            this.#data = item;
            this.#displayComments = false;
        }

        /**
         * sets the image comments and last update
         * @param comments
         * @param lastUpdate
         */
        setComments(comments, lastUpdate) {
            this.#deleteComments(comments.delete)
            if(comments.add && comments.add.length) {
                let sortedComments = comments.add
                sortedComments.sort((a, b) => {return a.comment.id - b.comment.id})
                this.#setHtmlComments(sortedComments)
            }
        }

        /**
         * returns the image element spinners
         * @returns {*}
         */
        getSpinnerElement(){
            return this.#spinnerElement
        }

        /**
         * returns the image html
         * @returns {*}
         */
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

        /**
         * Gets the comments to delete from this image and deletes them.
         * @param commentsToDelete
         */
        #deleteComments(commentsToDelete){
            const imagePointer = this;
            if (commentsToDelete) {
                commentsToDelete.forEach((id) => {
                    if (imagePointer.#comments.has(id)) {
                        imagePointer.#comments.get(id).remove()
                        imagePointer.#comments.delete(id)
                    }
                })
            }
        }

        /**
         * sets the image comments html
         * @param newComments
         */
        #setHtmlComments(newComments) {
            const imagePointer = this;
            newComments.forEach(function (val) {
                let li = document.createElement('li');
                li.className = "list-group-item mt-2 bg-light border-5 border-white";
                let div = document.createElement("div")
                div.className = "row align-items-center"
                div.appendChild(imagePointer.#getUserDataCol(val.comment))
                div.appendChild(imagePointer.#getContentAndDeleteCol(val))
                li.appendChild(div)
                imagePointer.#commentsElement.appendChild(li);
                imagePointer.#comments.set(val.comment.id, li);
            })
        }

        /**
         * Sets the Html of the comment to show the user info
         * @param val
         * @returns {HTMLDivElement}
         */
        #getUserDataCol(val) {
            let usersDataCol = document.createElement('div');
            usersDataCol.className = "col-12 col-lg-3 col-xl-2"
            let row = document.createElement('div')
            row.className = "row"
            let username = document.createElement('div');
            username.className = "col-12 text-dark text-break fw-bold title-text";
            username.innerText = `${val.username}`;
            let dateCol = document.createElement('div')
            dateCol.className = "col-12 me-auto text-muted text-break"
            let date = new Date(val.updatedAt);
            let localDate = date.toLocaleDateString();
            let localTime = date.toLocaleTimeString();
            dateCol.innerText = `${localDate} ${localTime}`
            row.appendChild(username)
            row.appendChild(dateCol)
            usersDataCol.appendChild(row)
            return usersDataCol
        }

        /**
         * Make the Html of the delete button
         * @param val
         * @returns {HTMLDivElement}
         */
        #getContentAndDeleteCol(val) {
            let contentAndDeleteCol = document.createElement('div');
            contentAndDeleteCol.className = "col-12 col-lg-9 col-xl-10"
            let contentDiv = document.createElement('div')
            contentDiv.className = "row align-items-center"
            let content = document.createElement('div');
            content.className = "col-9 text-body text-break text-body "
            content.innerText = `${val.comment.content}`;
            contentDiv.appendChild(content)
            if(val.couldDelete)
                contentDiv.appendChild(this.#getDelButton(val.comment.id))
            contentAndDeleteCol.appendChild(contentDiv)
            return contentAndDeleteCol
        }

        /**
         * init the image HTML
         */
        #initializePictureHtml() {
            this.#imageHtml = document.createElement('li');
            this.#imageHtml.className = "list-group-item";
            this.#imageHtml.id = `${this.#date}-post`;
            let imageRow = document.createElement("div");
            imageRow.className = "row";
            imageRow.appendChild(this.#getName());
            imageRow.appendChild(this.#getSpinner());
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
            title.className = "col-10";
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

        /**
         * Make the HTML for the image explanation
         * @returns {HTMLDivElement}
         */
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

        /**
         * Make the HTML for the show more of the image description
         * @param beforeMoreCol
         * @param afterMoreText
         * @returns {(*|HTMLDivElement)[]}
         */
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
            let col = document.createElement("div")
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

                    fetchRequest(`${COMMENTS_SERVER_URL}`, updateImagesComments,[this.#spinnerElement], undefined, message)
                    //fetchRequest(`/users/register`, setComments,getSpinnersElements(),0)
                }
                else{
                    displayError(new Error(INVALID_CONTENT_ERROR))
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
            ans.appendChild(this.#getCommentButton());
            ans.appendChild(this.#getCommentTextField());
            return ans;
        }

        #getSpinner(){
            const div = document.createElement("div")
            div.className = "d-none col-2 me-auto"
            div.id = `${this.#date}-spinner`
            const spinner = document.createElement("div")
            spinner.className="spinner-grow"
            div.appendChild(spinner)
            this.#spinnerElement = div
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
                fetchRequest(`${COMMENTS_SERVER_URL}?${params.toString()}`,updateImagesComments, [this.#spinnerElement], undefined, message)
            });
            buttonDiv.appendChild(button)
            return buttonDiv;
        }

    }
})();
