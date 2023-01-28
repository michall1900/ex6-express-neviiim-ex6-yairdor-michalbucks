const validation = require("./validationModule.js")
const utilitiesModule = (function(){

    /**
     * The function is doing trim() and to lower case to the received string.
     * @param string
     * @returns {string|*}
     */
    const trimAndLower = (string)=>{
        return (validation.isString(string))? string.trim().toLowerCase(): string
    }

    const stringToTitle = (string) =>{
        let convertedStr = (validation.isString(string))? string.split(" ").map((str)=>str.charAt(0).toUpperCase() +str.slice(1)).reverse().join(" ") : string
        console.log(convertedStr)
        return convertedStr
    }

    return {trimAndLower, stringToTitle}
})();

module.exports = utilitiesModule