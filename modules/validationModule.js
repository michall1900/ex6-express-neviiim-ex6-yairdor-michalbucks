/**
 * This module holds some validation checks.
 * @type {{isValidDate: (function(*)), isString: (function(*))}}
 */
const validationModule = (function(){

    /**
     * Return if object is a string or not.
     * @param object
     * @returns {boolean}
     */
    const isString= (object)=>{
        return (!!object instanceof String || typeof (object) === "string")
    }

    /**
     * Receives an object (should be a string) and return if it is a date.
     * @param object - any object
     * @returns {boolean} - true if it is valid date, otherwise false.
     */
    function isValidDate(object) {
        return ((!!object && isString(object) &&
            object.toString().match(/\d{4}-\d{2}-\d{2}/)) && !(new Date(object).toString().toLowerCase().includes("invalid date")))
    }


    return{
        isValidDate, isString
    }

})();

module.exports = validationModule
