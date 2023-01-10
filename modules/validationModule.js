const validationModule = (function(){
    const isValidEmailTemplate = (email) =>{
        let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
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

    const isNotEmpty = (object)=>{
        return (!!object && !!object.length)
    }

    const isInMinimumLength = (object, min) =>{
        return (!!object && object.length >= min)
    }

    const isInMaximumLength = (object, max) =>{
        return (!!object && object.length <= max)
    }

    const isInPattern = (object, pattern) =>{
        return (isString(object) && object.match(pattern))
    }

    return{
        isNotEmpty, isInMaximumLength, isInMinimumLength,isInPattern, isString, isValidEmailTemplate
    }

})();

module.exports = validationModule