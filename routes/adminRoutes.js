var express = require("express");
var jwt = require('jsonwebtoken');
// var multer = require('multer');

var adminService = require('../services/adminService');

var config = require('../config');

var secretKey = config.secretKey;

 // var storage = multer.diskStorage({
 //        destination: function (req, file, callback) {
 //          console.log("destination",req.files);
 //          callback(null, 'assets/advertiseImgs/');
 //        },
 //        filename: function (req, file, callback) {
 //          console.log("upload",upload);
 //          callback(null, file.fieldname + '-' + Date.now());
 //        }
 //      });

 //      var upload = multer({ storage : storage });
 //      console.log("upload",upload);


module.exports = (app, express) => {

  var admin = express.Router();

  admin.post('/adminregistration', (req, res) => {
    var registerData = req.body;
    var imageData = req.files;
    adminService.adminregistration(registerData, imageData, (response) => {
      res.send(response);
    });
  });

  admin.post('/addsubadmin', (req, res) => {
    var registerData = req.body;
    var imageData = req.files;
    adminService.addsubadmin(registerData, imageData, (response) => {
      res.send(response);
    });
  });

  admin.post('/login', (req, res) => {
    var loginData = req.body;
    adminService.login(loginData, (response) => {
      res.send(response);
    });
  });

  admin.post('/sendpasswordlink', (req, res) => {
    var sendpasswordlinkData = req.body;
    adminService.sendpasswordlink(sendpasswordlinkData, (response) => {
      res.send(response);
    });
  });

  admin.post('/newpassword', (req, res) => {
    var forgotpassData = req.body;
    adminService.newpassword(forgotpassData, (response) => {
      res.send(response);
    });
  });

  admin.post('/forgotpassword', (req, res) => {
    var forgotpasswordData = req.body;
    adminService.forgotpassword(forgotpasswordData, (response) => {
      res.send(response);
    });
  });


  //=================
  //Middleware to check token
  //=================

  admin.use((req, res, next) => {
    var token = req.body.token || req.param('token') || req.headers['x-access-token'];
    if (token) {
      jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
          res.status(403).send({
            success: false,
            message: "Authentication failed"
          });
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      res.status(403).send({
        success: false,
        message: "Authentication token required"
      });
    }
  });

  //=================
  //  Middleware end
  //=================


 admin.post('/helperregistration', (req, res) => {
     var tokendata = req.decoded;
    //console.log("tokendata",tokendata);
    var registerData = req.body;
    registerData.admin_id = tokendata.id;   
    console.log(registerData);
    var imageData = req.files;
    adminService.helperregistration(registerData, imageData, (response) => {
      res.send(response);
    });
  });

  admin.get('/getdashboarddata', (req, res) => {
    var tokendata = req.decoded;
    console.log("tokendata",tokendata);
    adminService.getdashboarddata(tokendata, (response) => {
      res.send(response);
    });
  });

  admin.get('/getprofiledata', (req, res) => {
    var tokendata = req.decoded;
    console.log("tokendata",tokendata);
    adminService.getprofiledata(tokendata, (response) => {
      res.send(response);
    });
  });

  admin.post('/updateprofile', (req, res) => {
    var updateprofileData = req.body;
    var updateprofileimage = req.files;
    var tokendata = req.decoded;
    adminService.updateprofile(updateprofileData, updateprofileimage, tokendata, (response) => {
      res.send(response);
    });
  });

  admin.post('/changepassword', (req, res) => {
    var changepasswordData = req.body;
    var tokendata = req.decoded;
    adminService.changepassword(changepasswordData, tokendata, (response) => {
      res.send(response);
    });
  });

  admin.get('/getalluserdetails', (req, res) => {
    var pagenum = req.param('page');
    adminService.getalluserdetails(pagenum, (response) => {
      res.send(response);
    });
  });
  
  admin.get('/getallhelpersdetails', (req, res) => {
    var tokendata =req.decoded;
    var pagenum = req.param('page');
    var adminData ={};
    adminData.admin_id = tokendata.id;
    adminData.role = tokendata.role;
    adminService.getallhelpersdetails(pagenum, adminData,(response) => {
      res.send(response);
    });
  });

  admin.get('/getallrequestdetails', (req, res) => {
    var pagenum = req.param('page');
    adminService.getallrequestdetails(pagenum, (response) => {
      res.send(response);
    });
  });

  admin.get('/getallsubadminlist', (req, res) => {
    var pagenum = req.param('page');
    adminService.getallsubadminlist(pagenum, (response) => {
      res.send(response);
    });
  });
  admin.post('/getrequestdetails', (req, res) => {
   // var pagenum = req.param('page');
    var requestData = req.body;
    var tokendata = req.decoded;
    adminService.getrequestdetails(requestData, (response) => {
      res.send(response);
    });
  });

  admin.post('/getuserdetails', (req, res) => {
   // var pagenum = req.param('page');
    var requestData = req.body;
    var tokendata = req.decoded;
    adminService.getuserdetails(requestData, (response) => {
      res.send(response);
    });
  });

   admin.post('/gethelperdetails', (req, res) => {
   // var pagenum = req.param('page');
    var requestData = req.body;
    var tokendata = req.decoded;
    adminService.gethelperdetails(requestData, (response) => {
      res.send(response);
    });
  });

  admin.post('/approveCareRequest', (req, res) => {
    var requestData = req.body;
    var tokendata = req.decoded;
    adminService.approveCareRequest(requestData, tokendata, (response) => {
      res.send(response);
    });
  });

   admin.post('/updatecustomerblockstatus', (req, res) => {
    var Data = req.body;
    var tokendata = req.decoded;
    adminService.updatecustomerblockstatus(Data, tokendata, (response) => {
      res.send(response);
    });
  });  
  
  admin.post('/updatehelperblockstatus', (req, res) => {
    var Data = req.body;
    var tokendata = req.decoded;
    adminService.updatehelperblockstatus(Data, tokendata, (response) => {
      res.send(response);
    });
  });

  admin.get('/getallbookinglist', (req, res) => {
    var pagenum = req.param('page');
    adminService.getallbookinglist(pagenum, (response) => {
      res.send(response);
    });
  });

  admin.post('/getbookingdetails', (req, res) => {
   // var pagenum = req.param('page');
    var requestData = req.body;
    var tokendata = req.decoded;
    adminService.getbookingdetails(requestData,tokendata, (response) => {
      res.send(response);
    });
  });

  admin.post('/getbookingdetailsbyrequestId', (req, res) => { //not required any more
    var requestData = req.body;
    var tokendata = req.decoded;
    adminService.getbookingdetailsbyrequestId(requestData, (response) => {
      res.send(response);
    });
  });

  admin.post('/getHelperforbooking', (req, res) => {
    var requestData = req.body;
    var tokendata = req.decoded;

    adminService.getHelperforbooking(requestData,tokendata, (response) => {
      res.send(response);
    });
  });
  
  admin.post('/assignHelper', (req, res) => { 
    var updateData = req.body;
    var tokendata = req.decoded;
    adminService.assignHelper(updateData,tokendata, (response) => {
      res.send(response);
    });
  });
  
  admin.post('/getBookingListOfCustomer', (req, res) => { 
    var customerData = req.body;
    var tokendata = req.decoded;
    adminService.getBookingListOfCustomer(customerData, (response) => {
      res.send(response);
    });
  });

   admin.post('/getBookingListOfHelper', (req, res) => { 
    var helperData = req.body;
    var tokendata = req.decoded;
    adminService.getBookingListOfHelper(helperData, (response) => {
      res.send(response);
    });
  });

  admin.post('/getsearchuserData', (req, res) => {
    var userdata = req.body;
    adminService.getsearchuserData(userdata, (response) => {
      res.send(response);
    });
  });

  admin.post('/getsearchhelperData', (req, res) => {
    var userdata = req.body;
    adminService.getsearchhelperData(userdata, (response) => {
      res.send(response);
    });
  }); 

  admin.post('/getsearchrequestData', (req, res) => {
    var userdata = req.body;
    adminService.getsearchrequestData(userdata, (response) => {
      res.send(response);
    });
  });

 admin.post('/getsearchbookingData', (req, res) => {
    var userdata = req.body;
    adminService.getsearchbookingData(userdata, (response) => {
      res.send(response);
    });
  });
 
 admin.post('/fetchMessagesByAdmin', (req, res) => {
    var tokendata =req.query;
    var userdata = req.body;
    adminService.fetchMessagesByAdmin(userdata, (response) => {
      res.send(response);
    });
  });

  admin.post('/fetchMessagesOfAdminAndHelper', (req, res) => {
    console.log(req);
    var tokendata =req.query;
    var messagedata = req.body;
    adminService.fetchMessagesOfAdminAndHelper(messagedata, (response) => {
      res.send(response);
    });
  });
 
  admin.post('/updatehelper', (req, res) => {
    var tokendata =req.query;
    var userdata = req.body;
    adminService.updatehelper(userdata, (response) => {
      res.send(response);
    });
  });

   admin.post('/getTotalTimeOfHelper', (req, res) => { 
    var helperData = req.body;
    var tokendata = req.decoded;
    adminService.getTotalTimeOfHelper(helperData, (response) => {
      res.send(response);
    });
  });


  admin.post('/sendInvoiceToCustomer', (req, res) => {
    var tokendata =req.query;
    var userdata = req.body;
    adminService.sendInvoiceToCustomer(userdata, (response) => {
      res.send(response);
    });
  });
  
  admin.post('/getHelperLastLoc', (req, res) => {
    var tokendata =req.query;
    var userdata = req.body;
    adminService.getHelperLastLoc(userdata, (response) => {
      res.send(response);
    });
  });

  admin.post('/checkCustomerEmail', (req, res) => {
    var customerData = req.body;
    adminService.checkCustomerEmail(customerData, (response) => {
      res.send(response);
    });
  });

  admin.post('/addBookingByAdmin', (req, res) => { 
    var updateData = req.body;
    var tokendata = req.decoded;
    adminService.addBookingByAdmin(updateData, (response) => {
      res.send(response);
    });
  });

  admin.post('/addAdvertise', (req, res,next) => {   
     var addAdvertiseData = req.body;
     var addAdvertiseFiles = req.files;
     var tokendata = req.decoded;
    adminService.addAdvertise(addAdvertiseFiles, tokendata, (response) => {
      res.send(response);
    });
  });

  admin.post('/blockuser', (req, res) => {
    var userdata = req.body;
    adminService.blockuser(userdata, (response) => {
      res.send(response);
    });
  });

  admin.post('/unblockuser', (req, res) => {
    var userdata = req.body;
    adminService.unblockuser(userdata, (response) => {
      res.send(response);
    });
  });

  admin.post('/removeuser', (req, res) => {
    var userdata = req.body;
    adminService.removeuser(userdata, (response) => {
      res.send(response);
    });
  });

  admin.get('/getoneuserData', (req, res) => {
    var userid = req.param('user_id');
    adminService.getoneuserData(userid, (response) => {
      res.send(response);
    });
  });

  admin.post('/updateuser', (req, res) => {
    var userdata = req.body;
    adminService.updateuser(userdata, (response) => {
      res.send(response);
    });
  });

  admin.post('/addcategory', (req, res) => {
    var categoryData = req.body;
    adminService.addcategory(categoryData, (response) => {
      res.send(response);
    });
  });

  admin.get('/getcategorydata', (req, res) => {
    var pagenum = req.param('page');
    adminService.getcategorydata(pagenum, (response) => {
      res.send(response);
    });
  });

  admin.post('/getsearchcategorydata', (req, res) => {
    var categorydata = req.body;
    adminService.getsearchcategorydata(categorydata, (response) => {
      res.send(response);
    });
  });

  admin.post('/blockcategory', (req, res) => {
    var categorydata = req.body;
    adminService.blockcategory(categorydata, (response) => {
      res.send(response);
    });
  });

  admin.post('/unblockcategory', (req, res) => {
    var categorydata = req.body;
    adminService.unblockcategory(categorydata, (response) => {
      res.send(response);
    });
  });

  admin.get('/getonecategorydata', (req, res) => {
    var categoryid = req.param('cat_id');
    adminService.getonecategorydata(categoryid, (response) => {
      res.send(response);
    });
  });

  admin.post('/updatecategory', (req, res) => {
    var categorydata = req.body;
    adminService.updatecategory(categorydata, (response) => {
      res.send(response);
    });
  });

  admin.post('/removecategory', (req, res) => {
    var categorydata = req.body;
    adminService.removecategory(categorydata, (response) => {
      res.send(response);
    });
  });

  admin.post('/addcoupons', (req, res) => {
    var coupondata = req.body;
    var imagedata = req.files;
    adminService.addcoupons(coupondata, imagedata, (response) => {
      res.send(response);
    });
  });

  admin.get('/getcouponlist', (req, res) => {
    var pagenum = req.param('page');
    adminService.getcouponlist(pagenum, (response) => {
      res.send(response);
    });
  });

  admin.post('/getsearchcoupondata', (req, res) => {
    var coupondata = req.body;
    adminService.getsearchcoupondata(coupondata, (response) => {
      res.send(response);
    });
  });

  admin.post('/blockcoupon', (req, res) => {
    var coupondata = req.body;
    adminService.blockcoupon(coupondata, (response) => {
      res.send(response);
    });
  });

  admin.post('/unblockcoupon', (req, res) => {
    var coupondata = req.body;
    adminService.unblockcoupon(coupondata, (response) => {
      res.send(response);
    });
  });

  admin.get('/getonecoupondata', (req, res) => {
    var couponid = req.param('coup_id');
    adminService.getonecoupondata(couponid, (response) => {
      res.send(response);
    });
  });

  admin.post('/updatecoupon', (req, res) => {
    var coupondata = req.body;
    adminService.updatecoupon(coupondata, (response) => {
      res.send(response);
    });
  });

  admin.post('/removecoupon', (req, res) => {
    var coupondata = req.body;
    adminService.removecoupon(coupondata, (response) => {
      res.send(response);
    });
  });

  return admin;
}
