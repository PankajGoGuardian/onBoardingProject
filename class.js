const mongoose = require("mongoose");
require("./config")
const productSchema= mongoose.Schema({
    name:String,
    code: String,
    total: Number,
    start: String,
    section: String,
    end: String,
    subject: String,
    teacher: String,
    standard: String,
    lastsync: String,
    course: String,
    grade: String
  })
const ClassInfo = mongoose.model("classInfo",productSchema)
module.exports = ClassInfo


// data()
