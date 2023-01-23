(function () {
    let TIMEOUT = setTimeout(updateImages, 15000);
    let USERNAME = "";
    let IMAGES = [];
    let SHOWN_DIV = "homepage-div";
    const APIKEY = "aKRnQfhPmxqeskcpdkcfomXKcIGbW1p8FFvuQhsa";
    const IMAGES_TO_FETCH = 5;
    let currStartDate = "";
    let NASA_API_URL = "https://api.nasa.gov/planetary/apod/"

    //----------------------------------- listeners initial's definition ----------------------------------------------

    document.addEventListener("DOMContentLoaded", () => {
        document.getElementById("dateForm").addEventListener("submit", function(event){
            getData(event);
        })
        document.getElementById("show-more-button").addEventListener("click", function (){
            fetchData(currStartDate, NASA_API_URL, false);
        })
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
     * The function fetch from NASA api the images links and displays it on the screen.
     * @param end The date of the most old pictures wanted to be displayed.
     * @param url The nasa url.
     * @param newPage Parameter that tells the function if the page need to be regenerated.
     */
    function fetchData(end, url, newPage=true){
        const newDate = new Date(end);
        newDate.setDate(newDate.getDate() - IMAGES_TO_FETCH + 1);
        let start = newDate.toISOString().substring(0,10);
        const newStartDate = new Date(start);
        newStartDate.setDate(newStartDate.getDate() - 1);
        currStartDate = newStartDate.toISOString().substring(0,10);
        fetch(`${url}?api_key=${APIKEY}&start_date=${start}&end_date=${end}`)
            .then(function(response) {
                return response.json();
            }).then(function (data) {
            fetch(`/home/api?images=[${getPicsDates(data).toString()}]`)
                .then(function (comments) {
                    return comments.json();
                }).then(function (comments){
                    console.log(comments);
                let content = document.getElementById("content-list");
                if(newPage) {
                    IMAGES = [];
                }
                content.innerHTML = "";
                data.forEach(function(item){
                    console.log("here");
                    IMAGES.push(new Image(item, getImageComments(comments, item.date)));
                });
                IMAGES.sort((a,b)=>{
                    return b.getDate().toString().localeCompare(a.getDate().toString());
                });
                IMAGES.forEach(function (image){
                    content.appendChild(image.getHtml());
                })
                showAndHide("show-more-button", "show");
            })
        }).catch(error =>{
            showAndHide("show-more-button", "hide");
            console.log("ERRORRRRRRR");
        });
    }

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
        fetch('home/api/timeStamp').then((response)=>{
            return response.json();
        }).then((version)=>{
            IMAGES.forEach((image)=>{
                if(parseInt(version["value"]) > image.getLastUpdate())
                    image.updateComments();
            });
            TIMEOUT = setTimeout(updateImages, 15000);
        });
    }

    /**
     * This function gets an id of which we want to toggle the display for, and hide the current displayed element.
     * @param divId The element id.
     */
    function changeShownDiv(divId) {
        showAndHide(SHOWN_DIV, "hide");
        showAndHide(divId, "show");
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

    class Image{
        #lastUpdate
        #date
        #data
        #comments
        #displayComments
        constructor(item, comments = []) {
            this.#lastUpdate = 0
            this.#date = item.date;
            this.#data = item;
            this.#comments = comments;
            this.#displayComments = false;
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
            let ans = document.createElement("img");
            if (this.#data.media_type === "video"){
                ans = document.createElement("iframe");
            }
            ans.src = this.#data.url;
            ans.alt = "";
            ans.className = "img-fluid col-6";
            ans.style = "max-width: 400px; max-height: 320px; object-fit: cover";
            return ans;
        }

        /**
         * This method creates and returns an p element with the title of the data
         * @returns {HTMLParagraphElement}
         */
        #getInfo(){
            let ans = document.createElement("p");
            ans.className = "col-6";
            ans.innerText = `Copyright: ${this.#data.copyright}\nDate: ${this.#data.date}\nExplanation: ${this.#data.explanation}\n`;
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
            commentButton.style = "max-width: 25%";
            commentButton.className = "comment-button btn btn-primary"
            commentButton.innerText = 'Comment';
            commentButton.id = `${this.#data.date}-comment_button`;
            commentButton.addEventListener("click", (event)=>{

                showAndHide(`${this.#data.date}-comment_button`, "hide");
                showAndHide(`${this.#data.date}-div`, "toggle");
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
                    fetch("/home/api", {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({
                            "picDate": this.#data.date,
                            "content": document.getElementById(`${this.#data.date}-text-area`).value
                        })
                    }).then((res)=>{
                        this.updateComments();
                    });
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
            div.className = "input-group";
            div.id = `${this.#data.date}-div`;
            div.style = "display: none";
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
            showComments.className = 'btn btn-primary col-12';
            showComments.addEventListener("click", (event)=>{
                this.#displayComments = !this.#displayComments;
                showAndHide(`${event.target.id}-comments`, "toggle");
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
            comments.className = "list-group col-12";
            comments.id = `${this.#data.date}-show-comments`;
            comments.style.display = this.#displayComments ? "block" : "none";
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
                fetch(`/home/api?${params.toString()}`, {
                    method: "DELETE"
                }).then((event)=>{
                    this.updateComments();
                });
            });

            return button;
        }

        /**
         * This function updates the feed so the user will see the last updates
         */
        updateComments(){
            fetch(`/home/api?images=["${this.#data.date}"]`)
                .then((response)=>{
                    return response.json();
                }).then((comments)=>{
                this.#comments = comments;
                document.getElementById(`${this.#data.date}-post`).innerHTML = "";
                document.getElementById(`${this.#data.date}-post`).appendChild(this.#generateHtml());
                this.#lastUpdate = Date.now();
            });
        }
        getLastUpdate(){
            return this.#lastUpdate;
        }
    }

    /**
     * This function gets an id of which we want to toggle the display for.
     * making an element to appear to be hidden. Also gets
     * @param idName The element id.
     * @param indicator The what to do with the element (show or hide).
     */
    function showAndHide(idName, indicator="") {
        let x = document.getElementById(idName);
        if (indicator === 'show'){
            x.style.display = 'block';
        }
        else if (indicator === 'hide'){
            x.style.display = 'none';
        }
        else if (x.style.display === 'none') {
            x.style.display = 'block';
        } else {
            x.style.display = 'none';
        }
    }
})();