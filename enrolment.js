const mongoose = require("mongoose")
require("./config")

const schema= mongoose.Schema({
    "userId":mongoose.Schema.Types.ObjectId,
    "classId": mongoose.Schema.Types.ObjectId,
    "status": Boolean,
    "createdOn": Number,
    "updatedOn": Number
})

module.exports = mongoose.model("enrolment", schema)