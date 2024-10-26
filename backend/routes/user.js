const {Router, application} = require('express');
const {userModel, purchaseModel, courseModel} = require('../db');
const {z} = require('zod');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {JWT_USER_SECRET} = require("../config");
const {userMiddleware} = require("../middlewares/user");

const userRouter= Router();

userRouter.post("/signup", async function (req, res) {

    const requiredBody = z.object({
      email: z.string().min(3).max(100).email(),
      password: z.string().min(3).max(100),
      firstName: z.string().min(3).max(100),
      lastName: z.string().min(3).max(100),
    });

    const parsedSuccess = requiredBody.safeParse(req.body);

    if (!parsedSuccess.success) {
      res.json({
        message: "invalid format",
        error: parsedSuccess.error, 
      });
      return;
    }

    const email = req.body.email;
    const password = req.body.password;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;

    const hashedPassword = await bcrypt.hash(password, 5);

   try{
    const user = await userModel.create({
        email:email,
        password:hashedPassword,
        firstName:firstName,
        lastName:lastName
    })

    res.json({
        message:"You are signed up!"
    })}
    catch(e){
        res.json({
            message:"error signingup!"
        })
    }

    console.log(user);
});

userRouter.post("/login", async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;

    const user = await userModel.findOne({
        email:email
    })

    if(!user){
        res.json({
            message:"user doesnt exist"
        })
        return;
    }

    const matchPassword = await bcrypt.compare(password, user.password);

    if(matchPassword){
        const token = jwt.sign({
            userId : user._id.toString()
        },JWT_USER_SECRET);

        res.json({
            token:token
        })
    }
});

userRouter.get("/purchases", userMiddleware, async function (req, res) {
    const userId = req.userId;

    const purchases = await purchaseModel.find({
        userId
    })

    //now map this purchase to the course bought 
    const courseData = await courseModel.find({
        _id: {$in: purchases.map(x=>x.courseId)}
    })

    res.json({
        message:"these are your purchases!",
        purchases,
        courseData
    })

});

module.exports = {
    userRouter:userRouter
}
