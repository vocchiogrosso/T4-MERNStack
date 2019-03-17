const Validator = require('validator');
const isEmpty =require("./is-empty");

module.exports = function validateLoginInput(data) {
    let errors = {};

    data.email = !isEmpty(data.email) ? data.email:'';
    data.password = !isEmpty(data.password) ? data.password:'';

    if(!Validator.isEmail(data.email)){
        errors.email = "Email Is Invalid";
    }

    if(!Validator.isLength(data.password, {min:6,max:30})){
        errors.password = "Password Must Be At Least 6 Characters";
    }

    if(Validator.isEmpty(data.email)){
        errors.email = "Email Field Is Required";
    }

    if(Validator.isEmpty(data.password)){
        errors.password = "Password Field Is Required";
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};