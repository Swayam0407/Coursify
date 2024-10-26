const {Router} = require('express');
const { courseModel, purchaseModel } = require('../db');
const {userMiddleware} = require('../middlewares/user');

const courseRouter = Router();

courseRouter.get("/allcourses", async function (req, res) {
    const courses = await courseModel.find({});

    res.json({
      courses
    })
});

//to purchases a course
courseRouter.post("/purchase", userMiddleware, async function (req, res) {
    const userId = req.userId;
    const courseId = req.body.courseId;

    await purchaseModel.create({
      userId,
      courseId
    })

    res.json({
      message:"you have successfully bought the course!",
      courseId
    })
});

module.exports = {
    courseRouter:courseRouter
}