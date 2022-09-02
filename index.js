const express = require("express")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
require("./config")
const app=express()
const ClassInfo= require("./class")
const enrolment = require("./enrolment")
const userInfo = require("./userInfo")
const joi = require("joi")

const cors = require('cors');
const corsOptions ={
    origin:'http://localhost:3000', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors(corsOptions));
app.use(express.json())

app.post("/post2", async (req, resp)=>{
    let data = new ClassInfo({"code": "V2RU22BV",
    "total": 5,
    "start": "Aug 05, 2021",
    "section": "AUG 05 SECTION -02",
    "end": " Dec 19, 2022",
    "subject": "Science",
    "teacher": "DEC03T1",
    "standard": "2019 Alabama Course Study Science",
    "lastsync": "Nov 13,2021",
    "grade": "grade 05",
    "name":"Canny Cougars",
    "course": "AUG 05 Course -02"})
    let res = await data.save()
    resp.send(res)
    console.log(res)

})

app.get("/manageclass", async(req,resp)=>{
    let res = await ClassInfo.find()
    console.log(res)
    resp.send(res)
})

app.post("/post1", async (req, resp)=>{
    let data = new ClassInfo({"code": "V2RU21MTV",
    "total": 0,
    "start": "Oct 05, 2021",
    "section": "Oct 05 SECTION -02",
    "end": " Jan 19, 2022",
    "subject": "Mathematics",
    "teacher": "DEC03T1",
    "standard": "2019 Alabama Course Study Mathematics",
    "lastsync": "Nov 13,2021",
    "grade": "grade 03",
    "course": "OCT 05 Course -02"})
    let res = await data.save()
    resp.json(res)
    console.log(res)

})

const userValidator=(user)=>{
    const JoiSchema = joi.object({
        username: joi.string()
                    .email()
                    .min(5)
                    .max(50)
                    .required(),
        password: joi.string()
                    .min(1)
                    .max(30)
                    .required(),
        firstName: joi.string()
                    .min(1)
                    .max(30)
                    .required(),
        middleName: joi.string()
                    .min(0)
                    .max(30),
        lastName: joi.string()
                    .min(0)
                    .max(30),
        status: joi.string(),
        role: joi.string(),
        classId: joi.string(),
        key:    joi.string()


                    
    })
    return JoiSchema.validate(user)
}

app.post("/postuser", async(req,resp)=>{

    const body = req.body
    console.log(userValidator(body).error)
    if(userValidator(body).error){ 
        console.log("username not valid")
        resp.status(205).send(body)}else{



    let user = await userInfo.findOne({username:body.username});
    let clas = await ClassInfo.findOne({_id : body.classId})
    // console.log("req.body=",req.body)
    if (!user){
        let data = req.body
        let res = new userInfo(data)
        const salt = await bcrypt.genSalt(10)
        res.password = await bcrypt.hash(res.password, salt);
        let ans = await res.save()
        console.log("data saved to userInfo database")
        try {
            const new_enrolment_object = {
                "classId": clas._id,
                "userId": res._id,
                "status": 1,
                "createdOn": new Date().getTime(),
                "updatedOn": new Date().getTime()
            }
            // console.log("new_enrolment = ", new_enrolment_object)
            let data2 = new enrolment(new_enrolment_object)
            let res2 = data2.save()
            console.log(`${data2} now saved to enrolment collection` )
            // console.log("date = ", new Date().getTime())
            const x = await enrolment.find({"classId":req.body.classId, "status": true}).count()
            console.log("enrolments=",x, req.body.classId)
            const y = await ClassInfo.findOneAndUpdate(
                {_id:req.body.classId},
                {
                    $set:{
                        total: x
                    }
                })
            console.log(y)
            resp.status(201).send(user)
        } catch (error) {
            console.log(error)
        }
       
        }else{

        // console.log("user hai ",user)
        // console.log(`student with same username ${req.body.username} is already existing in classInfo collection`)
        let enrol = await enrolment.findOne({"classId":clas._id,
                                            "userId":user._id})
        if (enrol){
            // console.log("enrol",enrol)
            const x = await enrolment.find({"classId":req.body.classId, "status": true}).count()
            console.log("enrolments=",x, req.body.classId)
            const y = await ClassInfo.findOneAndUpdate(
                {_id:req.body.classId},
                {
                    $set:{
                        total: x
                    }
                })
            console.log(y)
            console.log(`student with username ${req.body.username} is already enrolled with ${req.body.classId}`)
            resp.status(202).send(user)
        }else{
            // console.log("date = ", new Date().getTime())
            let data2 = new enrolment({
                "classId": clas._id,
                "userId": user._id,
                "status": 1,
                "createdOn": new Date().getTime(),
                "updatedOn": new Date().getTime()
            })
            // console.log("enrolment::::::::::::", {newEnrolment: data2})
            let saveData = await data2.save()
            const x = await enrolment.find({"classId":req.body.classId, "status": true}).count()
            console.log("enrolments=",x, req.body.classId)
            const y = await ClassInfo.findOneAndUpdate(
                {_id:req.body.classId},
                {
                    $set:{
                        total: x
                    }
                })
            console.log(y)

            console.log(`Congratulations! student with username ${body.username} is now enrolled with ${body.classId}`)

            resp.status(201).send(user)
        }
        
    }
    
}

})



app.get("/:classId", async (req,resp)=>{

    const classId = req.params.classId
    const result = {}
    // let data = await ClassInfo.findOne({_id:mongoose.Types.ObjectId(classId)})
    // console.log(req.params)
    let data = await ClassInfo.findOne({_id:classId})
    result.classInfo = data
    result.users=[]
    console.log(data._id)
    let datas = await enrolment.find({classId: classId})
    console.log("enrolments", datas)
    for(i=0;i<datas.length;i++){
        let user=await userInfo.findOne({_id:datas[i].userId}).lean()
        console.log(user)
        user.status=datas[i].status
        user.createdOn=datas[i].createdOn
        user.updatedOn=datas[i].updatedOn
        result.users.push(user)
    }
    resp.send(result)


})

// app.deleteOne("/deleteuser", async()=>{
//     let data = await find
// })

app.post("/statusupdate", async(req,resp)=>{
    console.log(req.body)
    const rowKeys = req.body.rowKeys
    const classId = req.body.classId
    for(i=0;i<rowKeys.length; i++){
        const updateEnrol = await enrolment.updateOne(
            {"userId":rowKeys[i],
            "classId":classId},
            {
                $set: {
                    status: false,
                    updatedOn: new Date().getTime()
                }
            })
    }
    const x = await enrolment.find({"classId":req.body.classId, "status": true}).count()
    const y = await ClassInfo.findOneAndUpdate(
        {_id:req.body.classId},
        {
            $set:{
                total: x
            }
        })
    resp.status(201).send(y)
})

app.post("/updateuser", async(req,resp)=>{
    const body = req.body
    console.log(body)
    if(userValidator(body).error){ 
        console.log("username not valid")
        console.log(userValidator(body).error)
        resp.status(205).send(body)}else{
    const user = await userInfo.findOne({username:body.username})
    if (!user || user._id==body.key){
    const update = await userInfo.findOneAndUpdate(
        {_id:body.key},
        {
            $set:{
                firstName:body.firstName,
                lastName:body.lastName,
                middleName:body.middleName,
                password:body.password,
                username:body.username
            }
        })
    console.log(update.password)
    const salt = await bcrypt.genSalt(10)
    update.password = await bcrypt.hash(update.password, salt)
    let data = await update.save();
    resp.status(201).send(update)}else{resp.status(202).send({})}}
})




app.get("/users", async(req,resp)=>{
    data = await ClassInfo.findOne({_id:"62ee7898837ee047ab4d4e0d" })
    resp.send(data)
})

app.get("/", async (req,resp)=>{
    let datas = await enrolment.find()
    
    resp.json(datas)
    console.log(datas)


})



app.delete("/delete", async(req,resp)=>{
    let dt = await ClassInfo.deleteOne({"code":"V2RU22BV"})
    resp.send(dt)
})





app.get("/*", (req,resp)=>{
    const element= "Page Not Found"
    resp.send(element)
})

app.listen(5000, ()=>console.log("running on port 5000"))





