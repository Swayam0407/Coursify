const {Router} = require('express');
const { adminModel, courseModel } = require('../db');
const {z} = require('zod');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const {JWT_ADMIN_SECRET} = require("../config");
const {adminMiddleware} = require("../middlewares/admin");

const adminRouter = Router();

adminRouter.post("/signup", async function (req, res) {
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
    const admin = await adminModel.create({
        email:email,
        password:hashedPassword,
        firstName:firstName,
        lastName:lastName
    })

    res.json({
        message:"You are signed up!"
    })
    console.log(admin);
}
    catch(e){
        res.json({
            message:"error signingup!"
        })
    }

    
});

adminRouter.post("/login", async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;

    const admin = await adminModel.findOne({
      email: email,
    });

    if (!admin) {
      res.json({
        message: "admin doesnt exist",
      });
      return;
    }

    const matchPassword = await bcrypt.compare(password, admin.password);

    if (matchPassword) {
      const token = jwt.sign(
        {
          adminId: admin._id.toString(),
        },
        JWT_ADMIN_SECRET
      );

      res.json({
        token: token,
      });
    }
});

adminRouter.post("/course",adminMiddleware, async function (req, res) {  //course creation

    const requiredBody = z.object({
      title: z.string().min(3).max(20),
      description: z.string().min(3).max(100),
      price: z.number().min(3).max(1000),
      imageURL: z.string().min(3).max(200),
    });

    const parsedSuccess = requiredBody.safeParse(req.body);

    if (!parsedSuccess.success) {
      res.json({
        message: "invalid format",
        error: parsedSuccess.error,
      });
      return;
    }

    const adminId = req.adminId;
    const title = req.body.title;
    const description = req.body.description;
    const price = req.body.price;
    const imageURL = req.body.imageURL;

    const course = await courseModel.create({
        title,
        description,
        price,
        imageURL,
        creatorId:adminId
    })

    res.json({
        message:"course created",
        courseId:course._id
    })
});

adminRouter.put("/editcourse", async function (req, res) { //edit course
  const adminId = req.adminId;

  const { title , description, price, imageURL, courseId} = req.body;

  const course = await courseModel.updateOne({
    _id:courseId,
    creatorId:adminId //to make sure it is updated by the creator itself 
  }, {
    title:title,
    description:description,
    price:price,
    imageURL:imageURL
  })

  res.json({
    message:"course updated",
    courseId:courseId
  })
});

adminRouter.get("/course/bulk", adminMiddleware, async function (req, res) {
  const adminId = req.adminId;
  const courses = await courseModel.find({
    creatorId:adminId,
  })
  res.json({
    message:"here are all the courses created by you",
    courses:courses
  })
});

module.exports = {
    adminRouter:adminRouter
}


