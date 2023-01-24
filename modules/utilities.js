
const utilitiesModule = (function(){
    /**
     * Return if object is a string or not.
     * @param object
     * @returns {boolean}
     */
    const isString= (object)=>{
        return (!!object instanceof String || typeof (object) === "string")
    }

    /**
     * The function is doing trim() and to lower case to the received string.
     * @param string
     * @returns {string|*}
     */
    const trimAndLower = (string)=>{
        return (isString(string))? string.trim().toLowerCase(): string
    }

    const stringToTitle = (string) =>{
        let convertedStr = (isString(string))? string.split(" ").map((str)=>str.charAt(0).toUpperCase() +str.slice(1)).reverse().join(" ") : string
        console.log(convertedStr)
        return convertedStr
    }

    return {trimAndLower,isString, stringToTitle}
})();

module.exports = utilitiesModule