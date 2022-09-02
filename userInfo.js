const mongoose = require("mongoose")
require("./config")
// import bcrypt from "bcrypt"

const schema = mongoose.Schema({
    "role": String,
    "firstName":{type: String, required: true},
    "username": {type: String, required: true}, 
    "middleName": String,
    "lastName":String,
    "password": String
})




module.exports = mongoose.model("userInfo", schema)