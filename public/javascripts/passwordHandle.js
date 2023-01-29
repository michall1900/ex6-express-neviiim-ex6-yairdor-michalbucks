(function (){
    const DISTINCT_PASSWORD_ERR = "The two passwords that you have been entered are distinct."

    /**
     * This function is validate the form before submit. It checks if the two passwords are the same. If they aren't,
     * error message is display. otherwise, the function submit again the form.
     * @param event - event
     */
    function validatePasswordForm(event) {
        event.preventDefault()
        let password1 = document.getElementById("password1").value
        let password2 = document.getElementById("password2").value
        if (password1 === password2)
            event.target.submit()
        else{
            document.getElementById("errorMsg").innerHTML = `${DISTINCT_PASSWORD_ERR}`
        }
    }
    // listeners setting
    document.addEventListener("DOMContentLoaded", (e)=>{
        document.getElementById("register-password-form").addEventListener("submit", validatePasswordForm)
    })
})();