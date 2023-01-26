// Note: this module will be move to somewhere else for client's needs.



const validationModule = (function(){
    const isValidEmailTemplate = (email) =>{
        let re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    /**
     * Return if object is a string or not.
     * @param object
     * @returns {boolean}
     */
    const isString= (object)=>{
        return (!!object instanceof String || typeof (object) === "string")
    }
      /**
       * Return true if object is not empty (otherwise, false)
       * @param object
       * @returns {boolean}
       */
    const isNotEmpty = (object)=>{
        return (!!object && !!object.length)
    }
    /**
     * Return true if object is >= minimum length (otherwise, false)
     * @param object
     * @param min - minimum length
     * @returns {boolean}
     */
    const isGreaterThanMinimumLength = (object, min) =>{
        return (!!object && object.length >= min)
    }
    /**
     * Return true if object is <= maximum length (otherwise, false)
     * @param object
     * @param max - maximum length
     * @returns {boolean}
     */
    const isLowerThanMaximumLength = (object, max) =>{
        return (!!object && object.length <= max)
    }
    /**
     * Return true if the string includes the wanted pattern (otherwise false)
     * @param object
     * @param pattern
     * @returns {false|*}
     */
    const isInPattern = (object, pattern) =>{
        return (isString(object) && object.match(pattern))
    }

    /**
     * Receives an object (should be a string) and return if it is a date.
     * @param object - any object
     * @returns {boolean} - true if it is valid date, otherwise false.
     */
    function isValidDate(object) {
        return ((!!object && isString(object) &&
            object.toString().match(/\d{4}-\d{2}-\d{2}/)) && !((new Date(object)).toString().toLowerCase().includes("invalid date")))
    }


    return{
        isNotEmpty, isLowerThanMaximumLength, isGreaterThanMinimumLength,isInPattern, isString, isValidEmailTemplate, isValidDate
    }

})();

module.exports = validationModule
