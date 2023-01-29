"# ex6-express-neviiim-ex6-yairdor-michalbucks" 
<h1>Ex6 - Yair Dor and Michal Bucks</h1>
<h5>Yair's email : yairdo@edu.hac.ac.il, id's: 318169505</h5>
<h5>Michal's email : michalbu@edu.hac.ac.il, id's: 205980725</h5>

<h3>Note: Maybe part of the code will be similar to Eliad Karni's exercise (the part in this program that using ex5). 
Yair and Michal become a couple, Yair and Eliad done ex5 together, so we are taking code from both exercises (ex5 of Yair and Eliad
and ex5 of Michal).</h3>

<h4>For database, run the command node_modules/.bin/sequelize db:migrate </h4>
<h3>Note: We have done the polling thing</h3>
<div>How the polling working?</div>
<div>
    If there is an error on update images' comments/ get nasa images (at first time), the timer is stopped until an 
    event coming (create/ delete comment) and the response and the request were ok.
    If everything ok, Each 15 seconds the client is sending update request with range of dates and a timestamp, and the server is giving
    him back new timestamp (the maximum between last comment updatedAt time and received timestamp) and the comments
    that client should update. We will talk about the received object later.
</div>

<h5>Server</h5>
<div>
In each point here we'll explain how does it work for each url:
    <ol>
        <li>
            It's important to tell that every url is go over middlewares. There is a middleware that check if user  
            is login and trying to get a page that he couldn't get (like the case that user login and trying to get the
            register page or user is trying to get home page while he isn't login, etc. There are many cases that could 
            happen that handled here)
        </li>
        <li> 
            get "/" - When user is not login, "/" is refers to login page (its url is "/") - it will show the user login page 
            that is given with view. When user is login, if he is trying to get "/", the server return him the home page without errors 
            (We think that user shouldn't get an error if he is trying to get home page when he is login, just redirect him to home page).
        </li> 
        <li>
            post "/" - Is using to login. If there is an error while login, user get the login page with an  
            error. body should be: "email": email address, "password": user's password.
        </li>
        <li>
            get "/users/register" - This route is giving the first registration page.  
        </li>
        <li>
            post "/users/register" - This route is handle with first registration login page. It checks if all details
            are valid. If they are, it gives to the user "/users/register-password" page. Anyway, the route is keeping
            user's data for 30 seconds inside a cookie for the register-password page and for finish the process.
            body should look like: email: email address, lName: user's last name, fName: user's first name.
        </li>
        <li>
            get "/users/register-password" - This page is giving to user the password page. If the user trying to 
            get into this page when the cookie deleted/ the details that insert before invalid, he will go back to
            "/users/register" page with an error.
        </li>
        <li>
            post "/users/register-password" - This page is finishing the registration process. If the user is trying
            to get this page when he is not finished the first registration page/ cookie expired, he will turn back 
            to the "/users/register" page with an error (like before).
            If the password will be invalid, it will get an error in this page ("/users/register-password").
            On success (password ok and all details are ok include email doesn't exist in table), the user will get to 
            login page with success message. It's important to tell that every password encrypt before saving inside
            the database.
        </li>
        <li>
            get /home - This page is giving the home page only if user is login. At first, the user is getting inside 
            the dom an element with "token" as an id that he should save and delete.
        </li>
        <li>
            <h6>Some Notes (about server api, after login)</h6>
            <div>
                From now on, any error message will get to user as a json that look like this: 
                {status: the status, msg: an error message}.The status also sent in res.status. 
                The client should handle with the errors itself and display them.
            </div>
            <div>
                Status code 404 - will tell the client to render its page (also define for addresses above).
            </div>
            <div>
                Status code 302 - will tell the client to redirect.
            </div>
            <div>
                Status code 400 - will tell about an error while trying to do any api request.
            </div>
            <div>
                Every request from now on (until user logged out) should include a header called "token" with the token as 
            a value. 
                Also, it's important that when user is trying to fetch, he needs to include a header called 
                'x-is-fetch': 'true' to tell the server that it is a fetch request (so the answer will give back in an
                appropriate way).
            </div>
        </li>
        <li>
            get "/home/api" - Needs to receive a range of dates. If every date is ok, the server will send back an 
            object that looks like this (in res.json): 
            <div>{"comments": {(for every date that found in comments) </div>
            <div>"{date}" :{"add":[{"comment":(comment that user should insert [the ones that created after the 
                                    timestamp]includes fields content, updatedAt, username, id(of the comment)),
            </div>
            <div>                    "couldDelete": boolean that says if user could delete the comment for client needs}],</div>
            <div>          "delete":[](will be empty in this case)}} </div>
            <div>"lastUpdate": (date iso string includes the date of the last comment that received/ received time stamp)}</div>
            That means the user will receive all comments for the wanted dates (excluded the deleted once).
            Its important that client will save the timestamp.
        </li>
        <li>
            get "/home/api/update" - Needs to receive a range of dates and the last time stamp that client received.
            If every date is ok and the timestamp valid, the server will send back an object that looks like this (in res.json): 
            <div>{"comments": {(for every date that found in comments) </div>
            <div>"{date}" :{"add":[{"comment":(comment that user should insert [the ones that created after the 
                                    timestamp]includes fields content, updatedAt, username, id(of the comment)),
            </div>
            <div>                    "couldDelete": boolean that says if user could delete the comment for client needs}],</div>
            <div>          "delete":[comments ids to delete (deleted after timestamp) - maybe user didn't received 
                                    those comments at all]}} </div>
            <div>"lastUpdate": (date iso string includes the date of the last comment that received/ received time stamp)}</div>
            That means the user will receive all comments for the wanted dates (excluded the deleted once).
            Its important that client will save the timestamp
        </li>
        <li>
            delete "/home/api" - should receive a picDate and id (comment id) and delete the wanted comment 
            (after validate that user could delete this comment with session user id).
            On success - return res.json({status:200}). We talked about the error message earlier.
        </li>
        <li>
            post "/home/api" - should receive picDate and content value in body. If it is a valid comment, the server is 
            returning res.json({status:200}).
        </li>
        <li>
            get /home/logout - will logout server, delete session and redirect user to login page.
        </li>
    </ol>
</div>