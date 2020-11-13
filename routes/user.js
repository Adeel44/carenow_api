const express = require('express')
const User = require('../models/user')
const bcrypt = require('bcryptjs');

const router = express.Router();

router.post('/create', async (req, res) => {

    // checking if email already exist
   const emailExist = await User.findOne({email:req.body.email})
   if(emailExist) return res.status(400).send("Email already exist")
  
   // hash the password
//    const salt = await bcrypt.genSalt(10);
//    const hashPassword = await bcrypt.hash( req.body.password, salt);
  
    const user = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email:req.body.email,
        contact_no:req.body.contact_no,
        location:req.body.location,
       // password: hashPassword,
        password: req.body.password,
        role:req.body.role
          
    })

    // try{
    //     const savedUser = await user.save()
    //     res.send({user:user._id})

    // }catch(err){
    //     res.status(400).send(err)
    // }

   await user.save()
    .then(data => {
        if (!data || data == null) {
            return res.status(200).send({
                message: "User Not Saved",
                data: {},
                status: 'error'
            });
        }
        res.status(200).send({
            message: "User saved successfully",
            status: 'status',
            data: data
        })
    })
    .catch(err => {
        res.status(400).send(err)
    }) 
    
});

router.post('/test',  (req, res) => {
    res.send("testing")

    
});
  

module.exports = router;
