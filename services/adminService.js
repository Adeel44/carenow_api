var express = require('express');
var jwt = require('jsonwebtoken');
var async = require("async");
var validator = require("email-validator");
var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt-nodejs');
var randomstring = require("randomstring");
var mongoose = require("mongoose");
var asyncLoop = require('node-async-loop');
var path = require('path');
var fs = require('fs');
// var multer = require('multer');
var app = express();

var Admin = require('../models/admin');
var User = require('../models/user');
var Helper = require('../models/helper');
var Request = require('../models/request');
var Booking = require('../models/booking');
var Reviews = require('../models/reviews');
var Chat = require('../models/chat');
var HelperLocation = require('../models/helperlocation');

var Advertisement = require('../models/advertisement');
var Coupons = require('../models/coupons');

var config = require("../config");
var NotificationService = require('../notificationservice');

require('mongoose-pagination');

var siteurl = config.__site_url;
var specialchar = /^[a-zA-Z\s]*$/;

var transporter = nodemailer.createTransport('smtps://avijit.team@gmail.com:avijit_team@smtp.gmail.com');

//Create token while sign in

function createToken(admin) {
  console.log("admin",admin);
  var tokenData = {
    id: admin._id,
    email: admin.email.toLowerCase(),
    role: admin.role
  };
  var token = jwt.sign(tokenData, config.secretKey, {
    expiresIn: '48h'
  });
  return token;
}

var adminService = {

  adminregistration: (registerData, imagedata, callback) => {
    async.waterfall([
      (nextcb) => {
        if (registerData.firstname == undefined || registerData.firstname.trim() == '') {
          callback({
            status: false,
            message: "Please enter first name"
          });
        } else if (registerData.firstname.trim() != '' && !specialchar.test(registerData.firstname)) {
          callback({
            status: false,
            message: "First name can not contain any number or special character"
          });
        } else if (registerData.firstname.trim() != '' && registerData.firstname.trim().length > 36) {
          callback({
            status: false,
            message: "First name can not be longer than 36 characters"
          });
        } else if (registerData.lastname == undefined || registerData.lastname.trim() == '') {
          callback({
            status: false,
            message: "Please enter last name"
          });
        } else if (registerData.lastname.trim() != '' && !specialchar.test(registerData.lastname)) {
          callback({
            status: false,
            message: "Last name can not contain any number or special character"
          });
        } else if (registerData.lastname.trim() != '' && registerData.lastname.trim().length > 36) {
          callback({
            status: false,
            message: "Last name can not be longer than 36 characters"
          });
        } else if (registerData.email == undefined || registerData.email.trim() == '' || !validator.validate(registerData.email)) {
          callback({
            status: false,
            message: "Please enter a valid email"
          });
        } else if (registerData.username == undefined || registerData.username.trim() == '') {
          callback({
            status: false,
            message: "Please enter a valid username"
          });
        }
         else if (registerData.password == undefined || registerData.password == '') {
          callback({
            status: false,
            message: "Please enter a password"
          });
        } else if (registerData.password.length < 6) {
          callback({
            status: false,
            message: "Password length must be minimum 6 characters"
          });
        } else if (registerData.password != registerData.confirmpassword) {
          callback({
            status: false,
            message: "Password and confirm password must match"
          });
        } else {
          nextcb(null);
        }
      },

      (nextcb) => {
        Admin.count({
          username: registerData.username
        }, (err, admincount) => {
          if (err) {
            nextcb(err);
          } else {
            if (admincount > 0) {
              callback({
                status: false,
                message: "Username already registered"
              });
            } else {
              nextcb(null);
            }
          }
        });
      },

      (nextcb) => {
        if (imagedata != undefined) {
          var file = imagedata.profileimage;

          var ext = file.name.slice(file.name.lastIndexOf('.'));
          var fileName = Date.now() + ext;
          var folderpath = 'assets/profileimage/';

          file.mv(folderpath + fileName, (err) => {
            if (err) {
              console.log(err);
            }
          });
        } else {
          fileName = 'default.jpg';
        }

        registerData.profileimage = fileName;

        var admin = new Admin(registerData);
        admin.save((err) => {
          if (err) {
            nextcb(err);
          } else {
            nextcb(null);
          }
        });
      }
    ], (err) => {
      if (err) {
        callback({
          success: false,
          message: "Some internal error has occured",
          err: err
        });
      }
      else {
        callback({
          success: true,
          message: "Registration Successful"
        });
      }
    });
  },

  helperregistration: (registerData, imagedata, callback) => {
    async.waterfall([
      (nextcb) => {
        if (registerData.firstname == undefined || registerData.firstname.trim() == '') {
          callback({
            status: false,
            message: "Please enter first name"
          });
        } else if (registerData.firstname.trim() != '' && !specialchar.test(registerData.firstname)) {
          callback({
            status: false,
            message: "First name can not contain any number or special character"
          });
        } else if (registerData.firstname.trim() != '' && registerData.firstname.trim().length > 36) {
          callback({
            status: false,
            message: "First name can not be longer than 36 characters"
          });
        } else if (registerData.lastname == undefined || registerData.lastname.trim() == '') {
          callback({
            status: false,
            message: "Please provide user type"
          });
        } else if (registerData.lastname.trim() != '' && !specialchar.test(registerData.lastname)) {
          callback({
            status: false,
            message: "Last name can not contain any number or special character"
          });
        } else if (registerData.lastname.trim() != '' && registerData.lastname.trim().length > 36) {
          callback({
            status: false,
            message: "Last name can not be longer than 36 characters"
          });        
        } else if (registerData.email == undefined || registerData.email.trim() == '' || !validator.validate(registerData.email)) {
          callback({
            status: false,
            message: "Please enter a valid email"
          });
        }else if (registerData.password == undefined || registerData.password == '') {
          callback({
            status: false,
            message: "Please enter a password"
          });
        } else if (registerData.password.length < 6) {
          callback({
            status: false,
            message: "Password length must be minimum 6 characters"
          });
        } else if (registerData.password != registerData.confirmpassword) {
          callback({
            status: false,
            message: "Password and confirm password must match"
          });
        } else {
          nextcb(null);
        }
      },

      (nextcb) => {
        Helper.count({
          email: registerData.email
        }, (err, helpercount) => {
          if (err) {
            nextcb(err);
          } else {
            if (helpercount > 0) {
              callback({
                status: false,
                message: "Email already registered"
              });
            } else {
              nextcb(null);
            }
          }
        });
      },

      (nextcb) => {
        if (imagedata != undefined) {
          var file = imagedata.profileimage;

          var ext = file.name.slice(file.name.lastIndexOf('.'));
          var fileName = Date.now() + ext;
          var folderpath = 'assets/profileimage/';

          file.mv(folderpath + fileName, (err) => {
            if (err) {
              console.log(err);
            }
          });
        } else {
          fileName = 'default.jpg';
        }

        registerData.profileimage = fileName;

        var helper = new Helper(registerData);
        helper.save((err) => {
          if (err) {
            nextcb(err);
          } else {
            nextcb(null);
          }
        });

        //start sent mail  to helper to change their password asap
        var mailOptions = {
         // from: '"Care Now">', // sender address
          from: '"Care Now" <avijit.team@gmail.com>',
          to: registerData.email.toLowerCase(), // list of receivers
          subject: 'Care Now registration success !!', // Subject line
          html: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body bgcolor="#ededed"><table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ededed" ><tr><td><table width="60%" border="0" cellspacing="0" cellpadding="0" bgcolor="#FFF" align="center" style="border-radius:10px; border:1px solid #ededed; box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.25); margin: auto;"><tr><td valign="top" align="center" style="padding: 15px"><img src="' + siteurl + 'assets/imgs/logo.png" width="100px" height="120px" alt="Carenow logo" title="Care Now logo" border=0;/></td><tr><td valign="top" style="padding: 40px;" height="200">Hello ' + registerData.firstname + ' ,<br><br>Welcome to Care Now. <br><br>You have successfully registered to this App.<br><br>Your email id is <strong>' + registerData.email + ' </strong> and password is <strong>' + registerData.password + ' </strong>.<br>Please change your password after login for security purpose.<br> Thank you<br><br>Team Care Now</td></tr><tr><td style="padding: 15px" align="center" bgcolor="#FFF"><p style="font:normal 12px Arial, Helvetica, sans-serif;"></p></td></tr></table></td></tr></table></body></html>'
        };

        transporter.sendMail(mailOptions, (err, info) => {
          if (error) {
            console.log(err);
          } else {
            console.log('Mail sent: ' + info.response);
          }
        });
        //end of sent mail
      }
    ], (err) => {
      if (err) {
        callback({
          success: false,
          message: "Some internal error has occured",
          err: err
        });
      }
      else {
        callback({
          success: true,
          message: "Registration Successful"
        });
      }
    });
  },

  
  addsubadmin: (registerData, imagedata, callback) => {
    console.log("123",registerData);
    async.waterfall([
      (nextcb) => {
        if (registerData.firstname == undefined || registerData.firstname.trim() == '') {
          callback({
            status: false,
            message: "Please enter first name"
          });
        } else if (registerData.firstname.trim() != '' && !specialchar.test(registerData.firstname)) {
          callback({
            status: false,
            message: "First name can not contain any number or special character"
          });
        } else if (registerData.firstname.trim() != '' && registerData.firstname.trim().length > 36) {
          callback({
            status: false,
            message: "First name can not be longer than 36 characters"
          });
        } else if (registerData.lastname == undefined || registerData.lastname.trim() == '') {
          callback({
            status: false,
            message: "Please provide user type"
          });
        } else if (registerData.lastname.trim() != '' && !specialchar.test(registerData.lastname)) {
          callback({
            status: false,
            message: "Last name can not contain any number or special character"
          });
        } else if (registerData.lastname.trim() != '' && registerData.lastname.trim().length > 36) {
          callback({
            status: false,
            message: "Last name can not be longer than 36 characters"
          });        
        } else if (registerData.email == undefined || registerData.email.trim() == '' || !validator.validate(registerData.email)) {
          callback({
            status: false,
            message: "Please enter a valid email"
          });
        }else if (registerData.password == undefined || registerData.password == '') {
          callback({
            status: false,
            message: "Please enter a password"
          });
        } else if (registerData.password.length < 6) {
          callback({
            status: false,
            message: "Password length must be minimum 6 characters"
          });
        } else if (registerData.password != registerData.confirmpassword) {
          callback({
            status: false,
            message: "Password and confirm password must match"
          });
        } else if (registerData.username != registerData.username) {
          callback({
            status: false,
            message: "Please enter a valid username"
          });
        } else {
          nextcb(null);
        }
      },

      (nextcb) => {
        Admin.count({
          email: registerData.email
        }, (err, helpercount) => {
          if (err) {
            nextcb(err);
          } else {
            if (helpercount > 0) {
              callback({
                status: false,
                message: "Email already registered"
              });
            } else {
              nextcb(null);
            }
          }
        });
      },

      (nextcb) => {
        if (imagedata != undefined) {
          var file = imagedata.profileimage;

          var ext = file.name.slice(file.name.lastIndexOf('.'));
          var fileName = Date.now() + ext;
          var folderpath = 'assets/profileimage/';

          file.mv(folderpath + fileName, (err) => {
            if (err) {
              console.log(err);
            }
          });
        } else {
          fileName = 'default.jpg';
        }

        registerData.profileimage = fileName;

        var admin = new Admin(registerData);
        admin.save((err) => {
          if (err) {
            nextcb(err);
          } else {
            nextcb(null);
          }
        });

        //start sent mail  to helper to change their password asap
        var mailOptions = {
         // from: '"Care Now">', // sender address
          from: '"Care Now" <avijit.team@gmail.com>',
          to: registerData.email.toLowerCase(), // list of receivers
          subject: 'Care Now Sub admin registration success !!', // Subject line
          html: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body bgcolor="#ededed"><table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ededed" ><tr><td><table width="60%" border="0" cellspacing="0" cellpadding="0" bgcolor="#FFF" align="center" style="border-radius:10px; border:1px solid #ededed; box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.25); margin: auto;"><tr><td valign="top" align="center" style="padding: 15px"><img src="' + siteurl + 'assets/imgs/logo.png" width="100px" height="120px" alt="Carenow logo" title="Care Now logo" border=0;/></td><tr><td valign="top" style="padding: 40px;" height="200">Hello ' + registerData.firstname + ' ,<br><br>Welcome to Care Now. <br><br>You have successfully registered as the sub-admin.<br><br>Your username is <strong>' + registerData.username + ' </strong> and password is <strong>' + registerData.password + ' </strong>.<br>Please change your password after login for security purpose.<br> Thank you<br><br>Team Care Now</td></tr><tr><td style="padding: 15px" align="center" bgcolor="#FFF"><p style="font:normal 12px Arial, Helvetica, sans-serif;"></p></td></tr></table></td></tr></table></body></html>'
        };

        transporter.sendMail(mailOptions, (err, info) => {
          if (error) {
            console.log(err);
          } else {
            console.log('Mail sent: ' + info.response);
          }
        });
        //end of sent mail
      }
    ], (err) => {
      if (err) {
        callback({
          success: false,
          message: "Some internal error has occured",
          err: err
        });
      }
      else {
        callback({
          success: true,
          message: "Sub-admin added successful"
        });
      }
    });
  },


  login: (loginData, callback) => {
    async.waterfall([
      (nextcb) => {
        if (loginData.username == undefined || loginData.username.trim() == '') {
          callback({
            success: false,
            message: "Invalid email"
          });
        } else if (loginData.password == undefined || loginData.password == '' || loginData.password.length < 6) {
          callback({
            success: false,
            message: "Invalid password"
          });
        } else {
          nextcb(null);
        }
      },

      (nextcb) => {
        Admin.findOne({
          username: loginData.username
        }, (err, admindetails) => {
          if (err) {
            nextcb(err);
          } else {
            if (admindetails == null) {
              callback({
                success: false,
                message: "Invalid username"
              });
            } else {
              if (!admindetails.comparePassword(loginData.password)) {
                callback({
                  success: false,
                  message: "Invalid password"
                });
              } else {
                var token = createToken(admindetails);
                console.log("admindetails",admindetails);
                var adminData = {
                  admin_id : admindetails._id,
                  role: admindetails.role
                }
                nextcb(null, token,adminData);                
              }
            }
          }
        });
      }
    ],
      (err, data,adminData) => {
        console.log(adminData);
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
          callback({
            success: true,
            message: "Login successful",
            token: data,
            data: adminData
          });
        }
      });
  },

  sendpasswordlink: (sendpasswordlinkData, callback) => {
    async.waterfall([
      (nextcb) => {
        if (sendpasswordlinkData.email == undefined || sendpasswordlinkData.email.trim() == '' || !validator.validate(sendpasswordlinkData.email)) {
          callback({
            success: false,
            message: "Invalid email"
          });
        }
        else {
          nextcb(null);
        }
      },
      (nextcb) => {
        Admin.findOne({
          email: sendpasswordlinkData.email.toLowerCase()
        }, (err, admindetails) => {
          if (err) {
            nextcb(err);
          } else {
            if (admindetails == null) {
              callback({
                status: false,
                message: "Invalid email"
              });
            } else {
              var mailOptions = {
                from: '"FrasGo">',
                to: admindetails.email,
                subject: 'FrasGo forgot password',
                html: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body bgcolor="#ededed"><table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ededed" ><tr><td><table width="60%" border="0" cellspacing="0" cellpadding="0" bgcolor="#FFF" align="center" style="border-radius:10px; border:1px solid #ededed; box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.25); margin: auto;"><tr><td valign="top" align="center" style="padding: 15px"><img style="width: 60%" src="' + siteurl + 'assets/imgs/logo.png" alt="FrasGo logo" title="FrasGo logo" border=0;/></td><tr><td valign="top" style="padding: 40px;" height="200">Hello ' + admindetails.firstname + ' ' + admindetails.lastname + ' ,<br><br>Forgot your password! No big deal, we all forgot sometimes.<br><br> Click on the below link for new password <br><br><a href="' + config.__baseurl + 'newpassword/' + admindetails._id + '">Click here</a> <br><br> Thank you<br><br>Team FrasGo</td></tr><tr><td style="padding: 15px" align="center" bgcolor="#FFF"><p style="font:normal 12px Arial, Helvetica, sans-serif;"></p></td></tr></table></td></tr></table></body></html>'
              };

              transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log('Mail sent: ' + info.response);
                }
              });

              nextcb(null);
            }
          }
        });
      }
    ],
      (err) => {
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
          callback({
            success: true,
            message: "Please check your email for new password link"
          });
        }
      });

  },

  newpassword: (forgotpassData, callback) => {
    async.waterfall([
      (nextcb) => {
        if (forgotpassData.id == undefined || forgotpassData.id == '') {
          callback({
            success: false,
            message: "Invalid admin id"
          });
        } else if (forgotpassData.newpassword == undefined || forgotpassData.newpassword == '') {
          callback({
            success: false,
            message: "Please enter a new password"
          });
        } else if (forgotpassData.newpassword.length < 6) {
          callback({
            success: false,
            message: "Password must be minimum 6 characters"
          });
        } else if (forgotpassData.newpassword != forgotpassData.confirmnewpassword) {
          callback({
            success: false,
            message: "New password and confirm new password must match"
          });
        } else {
          nextcb(null);
        }
      },
      (nextcb) => {
        Admin.count({
          _id: forgotpassData.id
        }, (err, admincount) => {
          if (err) {
            nextcb(err);
          } else {
            if (admincount != 0) {
              nextcb(null);
            } else {
              callback({
                success: false,
                message: "Invalid admin id"
              });
            }
          }
        })
      },
      (nextcb) => {
        Admin.findOne({
          _id: forgotpassData.id
        }, (err, admindetails) => {
          if (err) {
            nextcb(err);
          } else {
            bcrypt.hash(forgotpassData.newpassword, null, null, function (err, hashedpwd) {
              if (err) {
                nextcb(err);
              } else {
                Admin.update({
                  _id: forgotpassData.id
                }, {
                    password: hashedpwd
                  })
                  .exec((err, data) => {
                    if (err) {
                      nextcb(err);
                    } else {
                      nextcb(null);
                    }
                  });
              }
            });
          }
        })
      }
    ],
      (err) => {
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
          callback({
            success: true,
            message: "Password changed successfully"
          });
        }
      });
  },

  getprofiledata: (tokenData, callback) => {
    //console.log(tokenData);
    Admin.findOne({
      _id: tokenData.id
    }, (err, admindetails) => {
      console.log(admindetails);
      if (err) {
        callback({
          status: false,
          message: "Some internal error has occurred",
          err: err
        });
      } else {
        if (admindetails == null) {
          callback({
            status: false,
            message: "Some internal error has occurred"
          });
        } else {
          callback({
            success: true,
            message: "Profile data fetched",
            data: admindetails
          });
        }
      }
    });
  },

  updateprofile: (updateprofileData, imagedata, tokenData, callback) => {
    async.waterfall([
      (nextcb) => {
        if (updateprofileData.firstname == undefined || updateprofileData.firstname.trim() == '') {
          callback({
            status: false,
            message: "Please enter first name"
          });
        } else if (updateprofileData.firstname.trim() != '' && !specialchar.test(updateprofileData.firstname)) {
          callback({
            status: false,
            message: "First name can not contain any number or special character"
          });
        } else if (updateprofileData.firstname.trim() != '' && updateprofileData.firstname.trim().length > 36) {
          callback({
            status: false,
            message: "First name can not be longer than 36 characters"
          });
        } else if (updateprofileData.lastname == undefined || updateprofileData.lastname.trim() == '') {
          callback({
            status: false,
            message: "Please enter last name"
          });
        } else if (updateprofileData.lastname.trim() != '' && !specialchar.test(updateprofileData.lastname)) {
          callback({
            status: false,
            message: "Last name can not contain any number or special character"
          });
        } else if (updateprofileData.lastname.trim() != '' && updateprofileData.lastname.trim().length > 36) {
          callback({
            status: false,
            message: "Last name can not be longer than 36 characters"
          });
        } else if (updateprofileData.email == undefined || updateprofileData.email.trim() == '' || !validator.validate(updateprofileData.email)) {
          callback({
            status: false,
            message: "Please enter a valid email"
          });
        } else {
          nextcb(null);
        }
      },

      (nextcb) => {
        if (imagedata != undefined) {
          var file = imagedata.profileimage;

          var ext = file.name.slice(file.name.lastIndexOf('.'));
          var fileName = Date.now() + ext;
          var folderpath = 'assets/profileimage/';

          file.mv(folderpath + fileName, (err) => {
            if (err) {
              console.log(err);
            }
          });

          Admin.update({
            _id: tokenData.id
          }, {
              firstname: updateprofileData.firstname,
              lastname: updateprofileData.lastname,
              email: updateprofileData.email.toLowerCase(),
              profileimage: fileName
            }).exec((err, data) => {
              if (err) {
                nextcb(err);
              } else {
                nextcb(null);
              }
            });
        } else {
          Admin.update({
            _id: tokenData.id
          }, {
              firstname: updateprofileData.firstname,
              lastname: updateprofileData.lastname,
              email: updateprofileData.email.toLowerCase()
            }).exec((err, data) => {
              if (err) {
                nextcb(err);
              } else {
                nextcb(null);
              }
            });
        }
      },
    ], (err) => {
      if (err) {
        callback({
          success: false,
          message: "Some internal error has occurred",
          err: err
        });
      } else {
        callback({
          success: true,
          message: "Profile updated successfully"
        });
      }
    });
  },

  changepassword: (changepasswordData, tokenData, callback) => {
    async.waterfall([
      (nextcb) => {
        if (changepasswordData.currentpassword == undefined || changepasswordData.currentpassword == '') {
          callback({
            status: false,
            message: "Invalid current password"
          });
        } else if (changepasswordData.currentpassword.length < 6) {
          callback({
            status: false,
            message: "Invalid current password"
          });
        } else if (changepasswordData.newpassword == undefined || changepasswordData.newpassword == '') {
          callback({
            status: false,
            message: "Please enter new password"
          });
        } else if (changepasswordData.newpassword != '' && changepasswordData.newpassword.length < 6) {
          callback({
            status: false,
            message: "Password length must be minimum 6 characters"
          });
        } else if (changepasswordData.currentpassword == changepasswordData.newpassword) {
          callback({
            status: false,
            message: "New password must not be same as current password"
          });
        } else if (changepasswordData.newpassword != changepasswordData.confirmnewpassword) {
          callback({
            status: false,
            message: "New password and confirm new password must match"
          });
        } else {
          nextcb(null);
        }
      },

      (nextcb) => {
        Admin.findOne({
          _id: tokenData.id
        }, (err, admindetails) => {
          if (err) {
            nextcb(err);
          } else {
            if (!admindetails.comparePassword(changepasswordData.currentpassword)) {
              callback({
                status: false,
                message: "Invalid current password"
              });
            } else {
              bcrypt.hash(changepasswordData.newpassword, null, null, (err, hashedpwd) => {
                if (err) {
                  nextcb(err);
                } else {
                  Admin.update({
                    _id: tokenData.id
                  }, {
                      password: hashedpwd
                    })
                    .exec((err, data) => {
                      if (err) {
                        nextcb(err);
                      } else {
                        nextcb(null);
                      }
                    });
                }
              });
            }
          }
        })
      },
    ], (err) => {
      if (err) {
        callback({
          success: false,
          message: "Some internal error has occurred",
          err: err
        });
      } else {
        callback({
          success: true,
          message: "Password changed successfully"
        });
      }
    });
  },

  forgotpassword: (forgotpasswordData, callback) => {
    async.waterfall([
      (nextcb) => {
        if (forgotpasswordData.email == undefined || forgotpasswordData.email.trim() == '' || !validator.validate(forgotpasswordData.email)) {
          callback({
            success: false,
            message: "Invalid email"
          });
        } else {
          nextcb(null);
        }
      },
      (nextcb) => {
        Admin.count({
          email: forgotpasswordData.email.toLowerCase()
        }, (err, usercount) => {
          if (err) {
            callback({
              success: false,
              message: "Some internal error has occurred",
              err: err
            });
          } else {
            if (usercount == 0) {
              callback({
                success: false,
                message: "Invalid email"
              });
            } else {
              nextcb(null);
            }
          }
        });
      },
      (nextcb) => {
        var newpassword = randomstring.generate({
          length: 6,
          charset: 'numeric'
        });
        bcrypt.hash(newpassword, null, null, function (err, hashedpwd) {
          if (err) {
            nextcb(err);
          } else {
            Admin.findOneAndUpdate({
              email: forgotpasswordData.email.toLowerCase()
            }, {
                password: hashedpwd
              }, {
                new: true
              })
              .exec(function (err, userdetails) {
                //console.log("userdetails", userdetails);
                if (err) {
                  nextcb(err);
                } else {
                  //start sent mail
                  var mailOptions = {
                   // from: '"CareNow App">', // sender address
                    from: '"Care Now" <avijit.team@gmail.com>',
                    to: forgotpasswordData.email.toLowerCase(), // list of receivers
                    subject: 'CareNow new password', // Subject line
                    html: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body bgcolor="#ededed"><table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ededed" ><tr><td><table width="60%" border="0" cellspacing="0" cellpadding="0" bgcolor="#FFF" align="center" style="border-radius:10px; border:1px solid #ededed; box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.25); margin: auto;"><tr><td valign="top" align="center" style="padding: 15px"><img src="' + siteurl + 'assets/imgs/logo.png" width="100px" height="120px" alt="Carenow logo" title="Carenow logo" border=0;/></td><tr><td valign="top" style="padding: 40px;" height="200">Hello ' + userdetails.firstname + ' ,<br><br> We have received your application for new password. <br><br> Your new password is <strong>' + newpassword + '</strong> <br><br> Please change this password ASAP for security purpose. <br><br> Thank you<br><br>Team Carenow</td></tr><tr><td style="padding: 15px" align="center" bgcolor="#FFF"><p style="font:normal 12px Arial, Helvetica, sans-serif;"></p></td></tr></table></td></tr></table></body></html>'
                  };

                  transporter.sendMail(mailOptions, function (err, info) {
                    if (error) {
                      console.log(err);
                    } else {
                      console.log('Mail sent: ' + info.response);
                    }
                  });
                  //end of sent mail
                  nextcb(null);
                }
              });
          }
        });
      }
    ], (err) => {
      if (err) {
        callback({
          success: false,
          message: "Some internal error has occurred",
          err: err
        });
      } else {
        callback({
          success: true,
          message: "Password changed. Please check your email."
        });
      }
    });
  },
  
  getdashboarddata: (tokenData, callback) => {   
     async.waterfall([
      (nextcb) => {
          User
          .countDocuments({})
          .exec((err, usercount) => {
            if (err) {
              nextcb(err);
            } else {               
              nextcb(null,usercount);
            }
          });
        },
      (usercount,nextcb) => {
          Helper
          .countDocuments({})
          .exec((err, helpercount) => {
            if (err) {
               nextcb(err);
            } else {              
              nextcb(null,usercount,helpercount);
            }
          });
        },
       (usercount,helpercount,nextcb) => {
          Request
          .countDocuments({})
          .exec((err, requestcount) => {
            if (err) {
             nextcb(err);
            } else {
              nextcb(null,usercount,helpercount,requestcount);
            }
          });
        },
        (usercount,helpercount,requestcount,nextcb) => {        
          Booking
          .countDocuments({})
          .exec((err, bookingcount) => {
            if (err) {
             nextcb(err);
            } else {
              nextcb(null,usercount,helpercount,requestcount,bookingcount);
            }
          });
        },

       ], (err,usercount,helpercount,requestcount,bookingcount) => {
        
          let countData = {
            usercount: usercount,
            helpercount: helpercount,
            requestcount: requestcount,
            bookingcount: bookingcount
           }

        if (err) {
          callback({
            success: false,
            message: "Some internal error has occured",
            err: err
          });
        }
        else {
          callback({
            success: true,
            message: "Data fetched Successful",
            data: countData
          });
        }
      });  
   },

  getalluserdetails: (pagenum, callback) => {
    var page = 1;
    var limit = 10;
    var sort_field = 'createdAt';
    var order = '-1';

    page = pagenum;

    User
      .find({})
      .sort([
        [sort_field, order]
      ])
      .paginate(page, limit, (err, userdetails) => {
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
          User
            .count({})
            .exec((err, usercount) => {
              if (err) {
                callback({
                  success: false,
                  message: "Some internal error has occurred",
                  err: err
                });
              } else {
                callback({
                  success: true,
                  message: "All user details fetched",
                  data: userdetails,
                  usercount: usercount
                });
              }
            });
        }
      });
  },


  getallhelpersdetails: (pagenum,adminData, callback) => {
     console.log("adminData",adminData)
    var page = 1;
    var limit = 10;
    var sort_field = 'createdAt';
    var order = '-1';
    var a;

    page = pagenum;


    if(adminData.role == 'sub-admin'){
       console.log("subadmin");
      a =  Helper
            .find({
              admin_id: adminData.admin_id
            })
            .sort([
              [sort_field, order]
            ])
    }else{
      console.log("superadmin");
       a =  Helper
            .find({})
            .sort([
              [sort_field, order]
            ])
    }


    // Helper
    //   .find({})
    //   .sort([
    //     [sort_field, order]
    //   ])
      a.paginate(page, limit, (err, userdetails) => {
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
          Helper
            .count({})
            .exec((err, usercount) => {
              if (err) {
                callback({
                  success: false,
                  message: "Some internal error has occurred",
                  err: err
                });
              } else {
                callback({
                  success: true,
                  message: "All helpers details fetched",
                  data: userdetails,
                  usercount: usercount
                });
              }
            });
        }
      });
  },

  getallrequestdetails: (pagenum,callback) => {

    var page = 1;
    var limit = 10;
    var sort_field = 'createdAt';
    var order = '-1';

    page = pagenum;    

    Request
      .find({})
      .populate('user_id','firstname lastname')
      .sort([
        [sort_field, order]
      ])
      .paginate(page, limit, (err, requestdetails) => {
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
          Request
            .count({})
            .exec((err, requestcount) => {
              if (err) {
                callback({
                  success: false,
                  message: "Some internal error has occurred",
                  err: err
                });
              } else {
                callback({
                  success: true,
                  message: "All request details fetched",
                  data: requestdetails,
                  usercount: requestcount
                });
              }
            });
        }
      });
  },

   getallsubadminlist: (pagenum, callback) => {
    var page = 1;
    var limit = 10;
    var sort_field = 'createdAt';
    var order = '-1';

    page = pagenum;

    Admin
      .find({
        role: 'sub-admin'
      })
      .sort([
        [sort_field, order]
      ])
      .paginate(page, limit, (err, userdetails) => {
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
          User
            .count({})
            .exec((err, usercount) => {
              if (err) {
                callback({
                  success: false,
                  message: "Some internal error has occurred",
                  err: err
                });
              } else {
                callback({
                  success: true,
                  message: "All sub admin details fetched",
                  data: userdetails,
                  usercount: usercount
                });
              }
            });
        }
      });
  },


  // getrequestdetails: (requestData, callback) => {
  //   // var page = 1;
  //   // var limit = 10;
  //   // var sort_field = 'createdAt';
  //   // var order = '-1';

  //   // page = pagenum;

  //   Request
  //     .find({ _id: requestData.request_id}
  //     , (err, requestdetails) => {
  //       console.log("requestdetails",requestdetails);
  //       if (err) {
  //         callback({
  //           success: false,
  //           message: "Some internal error has occurred",
  //           err: err
  //         });
  //       } else {
  //         User
  //           .findOne({})
  //           .exec((err, userdetails) => {
  //             console.log(userdetails);
  //             if (err) {
  //               callback({
  //                 success: false,
  //                 message: "Some internal error has occurred",
  //                 err: err
  //               });
  //             } else {
  //               requestdetails.request_firstname =userdetails.firstname;
  //                requestdetails.request_lastname =userdetails.lastname;

  //                callback({
  //                 success: true,
  //                 message: "Request details fetched",
  //                 data: requestdetails            
  //               });
  //             }
  //           });
  //         // callback({
  //         //   success: true,
  //         //   message: "Request details fetched",
  //         //   data: requestdetails            
  //         // });
  //       }
  //     });
  // },

  getrequestdetails: (requestData, callback) => {
   // console.log("getrequestdetails");
   
    Request
      .find({ _id: requestData.request_id})
      .populate('user_id','firstname lastname')
       .exec((err, requestdetails) => {
      //, (err, requestdetails) => {
        //console.log("requestdetails",requestdetails);
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
          // User
          //   .findOne({})
          //   .exec((err, userdetails) => {
          //     console.log(userdetails);
          //     if (err) {
          //       callback({
          //         success: false,
          //         message: "Some internal error has occurred",
          //         err: err
          //       });
          //     } else {
          //       requestdetails.request_firstname =userdetails.firstname;
          //        requestdetails.request_lastname =userdetails.lastname;

          //        callback({
          //         success: true,
          //         message: "Request details fetched",
          //         data: requestdetails            
          //       });
          //     }
          //   });
          callback({
            success: true,
            message: "Request details fetched",
            data: requestdetails            
          });
        }
      });
  },

  getuserdetails: (userData, callback) => {    
    User
      .find({ _id: userData.user_id}
      , (err, userdetails) => {
        //console.log("requestdetails",requestdetails);
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {         
          callback({
            success: true,
            message: "User details fetched",
            data: userdetails            
          });
        }
     });
  },

  gethelperdetails: (userData, callback) => {
    async.waterfall([
      (nextcb) =>{
         Helper
          .find({ _id: userData.helper_id}
          , (err, helperdetails) => {
           // console.log("helperdetails",helperdetails);
            if(err){
              nextcb(err);
            }else{
              nextcb(null,helperdetails);
            }      
          });
      },
      (helperdetails,nextcb) =>{
          Reviews.find({rating_to: mongoose.Types.ObjectId(userData.helper_id)})
          .populate('rating_from')
          .exec((err,helperReview) =>{
           // console.log("helperReview",helperReview);
             if(err){
                nextcb(err);
             }else{
              nextcb(null,helperdetails,helperReview);
             }    
          })
      },
      ],(err,helperdetails,helperReview) => {
          if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {          
          callback({
            success: true,
            message: "Helper details fetched",
            data: helperdetails, 
            reviews: helperReview         
          });
        }
      })
   
  }, 

  approveCareRequest: (requestData , tokendata, callback) =>{
    async.waterfall([
      (nextcb) => {
        if (requestData.request_id == undefined || requestData.request_id == '') {
          callback({
            status: false,
            message: "Please provide request id"
          });
        } else if (requestData.request_by_user == undefined || requestData.request_by_user == '') {
          callback({
            status: false,
            message: "Please provide request by user id"
          });
        } else if (requestData.request_accepted == undefined || requestData.request_accepted == '') {
          callback({
            status: false,
            message: "Please provide request request accepted or declined"
          });       
        } else {
          nextcb(null);
        }
      },
      (nextcb) => {
       if(requestData.request_accepted == 1){

         Request.update({
            _id: requestData.request_id
          }, {
              status: 1,      //approved                  
            }).exec((err, data) => {
              if (err) {
                nextcb(err);
              } else {
                nextcb(null);
               // nextcb(null, token, userdetails); 
              }
            });
        }else{
           Request.update({
            _id: requestData.request_id
          }, {
              status: 2,   //unapproved                     
            }).exec((err, data) => {
              if (err) {
                nextcb(err);
              } else {
                nextcb(null);
               // nextcb(null, token, userdetails); 
              }
            });
        }      
      },
      (nextcb) => {
         User.findOne({
            _id: requestData.request_by_user
         } 
         // .select({ _id: requestData.request_accepted})
         , (err, userdetails) => {
            if (err) {
              callback({
                success: false,
                message: "Some internal error has occurred",
                err: err
              });
            } else {
              if (userdetails == null) {
                callback({
                  success: false,
                  message: "Some internal error has occurred"
                });
              } else {             
                nextcb(null,userdetails);
              }
            }
         });
      },
       (userdetails,nextcb) => {
          if(requestData.request_accepted == 1){
            //console.log("userdetails",userdetails);
            requestData.admin_id = tokendata.id;
            console.log(requestData);
              NotificationService.ApproveRequestNotification(userdetails,requestData);
          }else{
              NotificationService.DeclineRequestNotification(userdetails,requestData);
          }
           nextcb(null);
       }

    ], (err) => {
      if (err) {
        callback({
          success: false,
          message: "Some internal error has occurred",
          err: err
        });
      } else {
        if(requestData.request_accepted == 1){
          callback({
            success: true,
            message: "Request approved successfully"
          });
        }else if(requestData.request_accepted == 2){
           callback({
            success: true,
            message: "Request unapproved successfully"
          });
        }
      }
    });
  },

  fetchMessagesByAdmin : (data,callback) =>{  //chat b/w helper and customer
     console.log("data",data);
    async.waterfall([
      (nextcb) =>{
           Booking.find({_id: data.booking_id},
           {
              booking_by_user:1, helper_assign:1, _id:0
           }).populate('booking_by_user', 'firstname')
            .populate('helper_assign', 'firstname')
           .exec(function (err,response){
              console.log(response);
              if(response){
                nextcb(null,response[0]);
              }else{
                nextcb(err);
              }
           })
      },
      (res,nextcb) =>{
       Chat.find({
          $or : [ {
            $and : [
               { booking_id: mongoose.Types.ObjectId(data.booking_id) },
               { receiver_id: res.helper_assign._id },
               { sender_id: res.booking_by_user._id }
            ]
          },
           {
             $and : [
               { booking_id: mongoose.Types.ObjectId(data.booking_id) },
               { receiver_id: res.booking_by_user._id },
               { sender_id: res.helper_assign._id }
             ]
           }             
          ]
        }).exec((err, messageData) => {
            if (err) {
               nextcb(err);
            } else {
               nextcb(null,messageData,res);
            }
          });
      }
      ], (err,messageData,res) =>{
          if (err) {
              callback({
                success: false,
                message: "Some internal error has occurred",
                err: err
              });
            } else {
              callback({
                success: true,
                message: "All messages fetched",
                data: messageData,
                receiver:res.helper_assign,
                sender: res.booking_by_user         
              });
            }
      }) 
    },

  saveAdminChatMessage: (Data,callback) =>{
   console.log("saveAdminChatMessage");
   console.log(Data);

   async.waterfall([
    (nextcb) =>{      
       var chat = new Chat(Data);
        chat.save((err) => {
          if (err) {                
            nextcb(err);
          } else {                
            nextcb(null);
           // NotificationService.ChatMessage(chatData,devicetoken);          
          }
        });
    },
    ],(err) =>{
      if (err) {
              console.log("Chat err ",err);   
            } else {
               console.log("Chat inserted");   
            }
    })
  },

  fetchMessagesOfAdminAndHelper : (data,callback) =>{  //chat b/w helper and customer
     console.log("data111345677",data);

    async.waterfall([
      // (nextcb) =>{
      //      Booking.find({_id: data.booking_id},
      //      {
      //         booking_by_user:1, helper_assign:1, _id:0
      //      }).populate('booking_by_user', 'firstname')
      //       .populate('helper_assign', 'firstname')
      //      .exec(function (err,response){
      //         console.log(response);
      //         if(response){
      //           nextcb(null,response[0]);
      //         }else{
      //           nextcb(err);
      //         }
      //      })
      // },
      (nextcb) =>{
       Chat.find({
          $or : [ {
            $and : [
               { booking_id: mongoose.Types.ObjectId(data.booking_id) },
               { receiver_id: data.admin_id },
               { sender_id: data.helper_id}
            ]
          },
           {
             $and : [
               { booking_id: mongoose.Types.ObjectId(data.booking_id) },
               { receiver_id: data.helper_id},
               { sender_id: data.admin_id  }
             ]
           }             
          ]
        }).exec((err, messageData) => {
            if (err) {
               nextcb(err);
            } else {
               nextcb(null,messageData);
            }
          });
      }
      ], (err,messageData) =>{
          if (err) {
              callback({
                success: false,
                message: "Some internal error has occurred",
                err: err
              });
            } else {
              callback({
                success: true,
                message: "All messages fetched",
                data: messageData,
                // receiver:res.helper_assign,
                // sender: res.booking_by_user         
              });
            }
      }) 
    },
  updatecustomerblockstatus: (updateData , tokendata, callback) =>{
   // console.log("updateData",updateData);
     async.waterfall([
    (nextcb) => {
      // if (updateData.block_status == undefined || updateData.block_status == '') {
      //   callback({
      //     status: false,
      //     message: "Please provide block status"
      //   });
      // } else 
      if (updateData.user_id == undefined || updateData.user_id == '') {
        callback({
          status: false,
          message: "Please provide user id"
        });            
      } else {
        nextcb(null);
      }
    },
    (nextcb) =>{
        User.update({
          _id: updateData.user_id
        }, {
            block_status: updateData.block_status,      //approved                  
          }).exec((err, data) => {
            if (err) {
              nextcb(err);
            } else {
              nextcb(null,updateData.block_status);                   
            }
          });
    },
   ], (err,data) => {
      if (err) {
        callback({
          success: false,
          message: "Some internal error has occurred",
          err: err
        });
      } else {
        callback({
          success: true,
          message: "Customer status updated successfully",
          data: data
        });
      }
    });
  }, 

  updatehelperblockstatus: (updateData , tokendata, callback) =>{
    async.waterfall([
    (nextcb) => {      
      if (updateData.user_id == undefined || updateData.user_id == '') {
        callback({
          status: false,
          message: "Please provide user id"
        });        
      } else {
        nextcb(null);
      }
    },
    (nextcb) =>{
        Helper.update({
          _id: updateData.user_id
        }, {
            block_status: updateData.block_status,      //approved                  
          }).exec((err, data) => {
            if (err) {
              nextcb(err);
            } else {
              nextcb(null,updateData.block_status);                   
            }
          });
    },
   ], (err,data) => {
      if (err) {
        callback({
          success: false,
          message: "Some internal error has occurred",
          err: err
        });
      } else {
        callback({
          success: true,
          message: "Helper status updated successfully",
          data: data
        });
      }
    });
  },  

  getsearchuserData: (userdata, callback) => {
    User.find({
      $or: [{
        'firstname': new RegExp(userdata.details, "i")
      }, {
        'lastname': new RegExp(userdata.details, "i")
      }, {
        'email': new RegExp(userdata.details, "i")
      }]
    })
      .exec((err, userdetails) => {
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
          if(userdetails.length == 0){
             callback({
              success: true,
              message: "No such data found",
              data: [],
              usercount: 0
            });
           }else{
            callback({
              success: true,
              message: "Search user details fetched",
              data: userdetails,
              usercount: userdetails.length
            });
          }
        }
      });
  },

  getsearchhelperData: (userdata, callback) => {
    Helper.find({
      $or: [{
        'firstname': new RegExp(userdata.details, "i")
      }, {
        'lastname': new RegExp(userdata.details, "i")
      }, {
        'email': new RegExp(userdata.details, "i")
      }]
    })
      .exec((err, userdetails) => {
        console.log(userdetails);
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
          if(userdetails.length == 0){
             callback({
              success: true,
              message: "No such data found",
              data: [],
              usercount: 0
            });
           }else{
             callback({
              success: true,
              message: "Search helper details fetched",
              data: userdetails,
              usercount: userdetails.length
            });
           }         
        }
      });
  },

  getsearchrequestData: (userdata, callback) => {
    Request.find({
      $or: [{
        'name': new RegExp(userdata.details, "i")
      }, {
        'requestDetails': new RegExp(userdata.details, "i")
      }, {
        'serviceforwhom': new RegExp(userdata.details, "i")
      }]
    })
    .populate('user_id','firstname lastname')
      .exec((err, userdetails) => {
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
          if(userdetails.length == 0){
             callback({
              success: true,
              message: "No such data found",
              data: [],
              usercount: userdetails.length
            });
           }else{
            callback({
              success: true,
              message: "Search request details fetched",
              data: userdetails,
              usercount: userdetails.length
            });
          }
        }
      });
  },

 getsearchbookingData: (userdata, callback) => { //new RegExp(userdata.details, "i")
   //console.log("userdata",userdata.details);
    var findQuery;
    function byteCount(s) {
      return encodeURI(s).split(/%..|./).length - 1;
    }
   var searchbyteCount = byteCount(userdata.details);
   //console.log("a",searchbyteCount);

    if(searchbyteCount == 12 || searchbyteCount == 24){
       findQuery =  {          
                      '_id':mongoose.Types.ObjectId(userdata.details)        
                    }
    } else{
       findQuery =  {      
                       'requiredService': new RegExp(userdata.details, "i")
                    }
    }
    
    Booking.find(findQuery)
     .populate('booking_by_user','firstname lastname')
      .exec((err, userdetails) => {        
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
          if(userdetails.length == 0){
             callback({
              success: true,
              message: "No such data found",
              data: [],
              usercount: userdetails.length
            });
           }else{
            callback({
              success: true,
              message: "Search booking details fetched",
              data: userdetails,
              usercount: userdetails.length
            });
          }
        }
      });
  },

  updatehelper: (userdata, callback) => {
    console.log("userdata",userdata);
    async.waterfall([
      (nextcb) => {
        if (userdata.id == undefined || userdata.id == '') {
          callback({
            status: false,
            message: "Please enter helper id"
          });
        } else if (userdata.firstname == undefined || userdata.firstname.trim() == '') {
          callback({
            status: false,
            message: "Please enter first name"
          });
        } else if (userdata.firstname.trim() != '' && !specialchar.test(userdata.firstname)) {
          callback({
            status: false,
            message: "First name can not contain any number or special character"
          });
        } else if (userdata.firstname.trim() != '' && userdata.firstname.trim().length > 36) {
          callback({
            status: false,
            message: "First name can not be longer than 36 characters"
          });
        } else if (userdata.lastname == undefined || userdata.lastname.trim() == '') {
          callback({
            status: false,
            message: "Please enter last name"
          });
        } else if (userdata.lastname.trim() != '' && !specialchar.test(userdata.lastname)) {
          callback({
            status: false,
            message: "Last name can not contain any number or special character"
          });
        } else if (userdata.lastname.trim() != '' && userdata.lastname.trim().length > 36) {
          callback({
            status: false,
            message: "Last name can not be longer than 36 characters"
          });
        } else if (userdata.email == undefined || userdata.email.trim() == '' || !validator.validate(userdata.email)) {
          callback({
            status: false,
            message: "Please enter a valid email"
          });
        } else {
          nextcb(null);
        }
      },

      (nextcb) => {
        Helper.update({
          _id: userdata.id
        }, {
            firstname: userdata.firstname,
            lastname: userdata.lastname,
            email:userdata.email
          }).exec((err, data) => {
            if (err) {
              nextcb(err);
            } else {
              nextcb(null);
            }
          });
      },
    ], (err) => {
      if (err) {
        callback({
          success: false,
          message: "Some internal error has occurred",
          err: err
        });
      } else {
        callback({
          success: true,
          message: "Helper updated successfully"
        });
      }
    });
  },

  getallbookinglist: (pagenum, callback) => {
    var page = 1;
    var limit = 10;
    var sort_field = 'createdAt';
    var order = '-1';

    page = pagenum;

    Booking
      .find({})   
      .populate('booking_by_user','firstname lastname')
      .sort([
        [sort_field, order]
      ])
      .paginate(page, limit, (err, bookingdetails) => {       
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
          Booking
            .count({})
            .exec((err, bookingcount) => {
              if (err) {
                callback({
                  success: false,
                  message: "Some internal error has occurred",
                  err: err
                });
              } else {
                callback({
                  success: true,
                  message: "All bookings fetched",
                  data: bookingdetails,
                  usercount: bookingcount
                });
              }
            });
        }
      });
  },

  getbookingdetails: (userData,tokendata, callback) => {
    console.log("getbookingdetails",tokendata);
    // var query;
    // if(tokendata.role = 'sub-admin'){
    //     query = 
    // }
    Booking
      .find({ _id: userData.booking_id})
      .populate('booking_by_user','firstname lastname')
      .populate('helper_assign','firstname lastname')    
      .exec(function (err, bookingdetails) {   
      //  console.log("bookingdetails",bookingdetails);
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {          
          callback({
            success: true,
            message: "Booking details fetched",
            data: bookingdetails            
          });
        }
     });
  },

  getbookingdetailsbyrequestId: (userData, callback) => {  //not required any more
    Booking
      .find({request_id: mongoose.Types.ObjectId(userData.request_id)})
      .populate('booking_by_user','firstname lastname')
      .exec(function (err, bookingdetails) {
     // , (err, helperdetails) => {
        //console.log("requestdetails",requestdetails);
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {          
          callback({
            success: true,
            message: "Booking details fetched",
            data: bookingdetails            
          });
        }
     });
  },

  getHelperforbooking: (userData,tokendata, callback) => {  
    console.log("userData",userData,tokendata);
    var query;

     if(tokendata.role == 'sub-admin'){
      query =  { admin_id: tokendata.id } 
     } else{
      query =  {}

     }
    Helper
     // .find({schedule_available_end:{$elemMatch:{$eq:'1561015020000'}}})
      .find({  $and : [  { schedule_available_start: { $elemMatch: { $lte: userData.serviceTime} } },
                         { schedule_available_end: { $elemMatch: { $gte: userData.seviceEndTime} } },
                        // { admin_id: tokendata.id }  //added for sub admin
                        query
               ]
      }, { firstname: 1, lastname: 1 } )
      // .select({firstname,lastname})
      //.populate('booking_by_user','firstname lastname')
      .exec(function (err, helperdetails) {
     // , (err, helperdetails) => {
        //console.log("helperdetails",helperdetails);
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {          
          callback({
            success: true,
            message: "Booking details fetched",
            data: helperdetails            
          });
        }
     });
  },

  assignHelper: (helperData,tokendata,callback) => {
    console.log("helperdata",tokendata);
   async.waterfall([
     (nextcb) => {
       if (helperData.helper_id == undefined || helperData.helper_id == '') {
          callback({
            status: false,
            message: "Please select a helper"
          });
        } else if (helperData.booking_id == undefined || helperData.booking_id == '') {
          callback({
            status: false,
            message: "Please provide booking id"
          });
        } else if (helperData.request_id == undefined || helperData.request_id == '') {
          callback({
            status: false,
            message: "Please provide request id"
          });
        } else {
          nextcb(null);
        }
      },
     (nextcb) => {
        Booking.update({
          _id: helperData.booking_id
        }, {           
            helper_assign: helperData.helper_id,
            booking_status: 1 ,
            assign_by_admin : tokendata.id                  
          }).exec((err) => {
            if (err) {
              nextcb(err);
            } else {
              nextcb(null);
            }
          });
      },
      (nextcb) => {
         Helper.findOne({
            _id: helperData.helper_id
         } 
         // .select({ _id: requestData.request_accepted})
         , (err, helperdetails) => {
            if (err) {             
               nextcb(err);
            } else {
              if (helperdetails == null) {               
                nextcb(err);
              } else { 
                helperData.admin_id = tokendata.id;
                NotificationService.AssignHelperNotification(helperdetails,helperData);
                nextcb(null);
              }
            }
         });
      },      
    ], (err) => {
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
          callback({
            success: true,
            message: "Helper assigned successfully"
          });
        }
      });
  },
  
  getBookingListOfCustomer: (customerData, callback) => {
    //console.log("customerData",customerData);
    var page = 1;
    var limit = 10;
    var sort_field = 'createdAt';
    var order = '-1';

    page = customerData.page;

    Booking
      .find({
        booking_by_user: mongoose.Types.ObjectId(customerData.customer_id)
      })   
      .populate('booking_by_user','firstname lastname')
      .sort([
        [sort_field, order]
      ])
      .paginate(page, limit, (err, bookingdetails) => {       
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
          Booking
            .countDocuments({booking_by_user: mongoose.Types.ObjectId(customerData.customer_id)})
            .exec((err, bookingcount) => {
              if (err) {
                callback({
                  success: false,
                  message: "Some internal error has occurred",
                  err: err
                });
              } else {
                callback({
                  success: true,
                  message: "Customer bookings fetched",
                  data: bookingdetails,
                  usercount: bookingcount
                });
              }
            });
        }
      });
  },
  
  getBookingListOfHelper: (helperData, callback) => {
    var page = 1;
    var limit = 10;
    var sort_field = 'createdAt';
    var order = '-1';

    page = helperData.page;

    Booking
      .find({
        helper_assign: mongoose.Types.ObjectId(helperData.helper_id)
      })   
      .populate('booking_by_user','firstname lastname')
      .sort([
        [sort_field, order]
      ])
      .paginate(page, limit, (err, bookingdetails) => {       
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
          Booking
            .countDocuments({helper_assign: mongoose.Types.ObjectId(helperData.helper_id)})
            .exec((err, bookingcount) => {
              if (err) {
                callback({
                  success: false,
                  message: "Some internal error has occurred",
                  err: err
                });
              } else {
                callback({
                  success: true,
                  message: "Helper bookings fetched",
                  data: bookingdetails,
                  usercount: bookingcount
                });
              }
            });
        }
      });
  },

  sendInvoiceToCustomer: (data,callback) =>{
    console.log(data);
    //start sent mail
      var mailOptions = {
       // from: '"CareNow App">', // sender address
        from: '"Care Now" <avijit.team@gmail.com>',
        to: data.email.toLowerCase(), // list of receivers
        //to: 'uzra.brainium@gmail.com',
        subject: 'CareNow Invoice', // Subject line
       // html: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body bgcolor="#ededed"><table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ededed" ><tr><td><table width="60%" border="0" cellspacing="0" cellpadding="0" bgcolor="#FFF" align="center" style="border-radius:10px; border:1px solid #ededed; box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.25); margin: auto;"><tr><td valign="top" align="center" style="padding: 15px"><img src="' + siteurl + 'assets/imgs/logo.png" width="100px" height="120px" alt="Carenow logo" title="Carenow logo" border=0;/></td><tr><td valign="top" style="padding: 40px;" height="200">Hello ' + userdetails.firstname + ' ,<br><br> We have received your application for new password. <br><br> Your new password is <strong>' + newpassword + '</strong> <br><br> Please change this password ASAP for security purpose. <br><br> Thank you<br><br>Team Carenow</td></tr><tr><td style="padding: 15px" align="center" bgcolor="#FFF"><p style="font:normal 12px Arial, Helvetica, sans-serif;"></p></td></tr></table></td></tr></table></body></html>'
         html: '<b>Hello</b>',
         attachments: [{
        filename: 'image.jpg',
        path: 'assets/visitImages/1563370331069.jpg',       
        //contentType: 'application/pdf'
      }],
      };

      transporter.sendMail(mailOptions, function (err, info) {
        if (error) {
          console.log(err);
        } else {
          console.log('Mail sent: ' + info.response);
        }
      });
      //end of sent mail
  },

  getHelperLastLoc: (data,callback) =>{
    HelperLocation.find({
      helper_id: data.helper_id
    }).exec((err,locData) =>{
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
          callback({
            success: true,
            message: "Location fetched",
            data: locData
          });
        }
    });
  },
  

  getTotalTimeOfHelper: (data,callback) =>{
    Booking.find({$and : [
                  { "helper_assign":mongoose.Types.ObjectId(data.helper_id) },
                  { "serviceDate": data.date }
            ]})
// .find({  $and : [  { schedule_available_start: { $elemMatch: { $lte: userData.serviceTime} } },
//                          { schedule_available_end: { $elemMatch: { $gte: userData.seviceEndTime} } },
//                         // { admin_id: tokendata.id }  //added for sub admin
//                         query
//                ]
//       }, { firstname: 1, lastname: 1 } )
    .exec((err,bookingData) =>{
      console.log("bookingData",bookingData);
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
          callback({
            success: true,
            message: "Location fetched",
            data: bookingData
          });
        }
    });
  },

  checkCustomerEmail: (data,callback) =>{
    console.log("checkCustomerEmail",data);
    User.find({
      email: data.email
    }).exec((err,userData) =>{
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
          if(userData != ""){
             console.log("here");
            callback({
              success: true,
              message: "User data fetched",
              data: userData
            });
          }else{
            callback({
              success: true,
              message: "User data fetched",
              data: []
            });
          }
        }
    });
  },

  addBookingByAdmin:(addRequestData,callback) => { 

    console.log("addBookingByAdmin",addRequestData);
 
      async.waterfall([
          (nextcb) => {
            if (addRequestData.salutation == undefined || addRequestData.salutation.trim() == '') {
              callback({
                success: false,
                message: "Please enter salutation"
              });
            } else if (addRequestData.name.trim() != '' && !specialchar.test(addRequestData.name)) {
              callback({
                success: false,
                message: "Name can not contain any number or special character"
              });
            } else if (addRequestData.name.trim() != '' && addRequestData.name.trim().length > 36) {
              callback({
                success: false,
                message: "Name can not be longer than 36 characters"
              });
            } else if (addRequestData.name == undefined || addRequestData.name.trim() == '') {
              callback({
                success: false,
                message: "Please enter name"
              });
            } else if (addRequestData.age == undefined || addRequestData.age.trim() == '') {
              callback({
                success: false,
                message: "Please enter age"
              });
            } else if (addRequestData.height == undefined || addRequestData.height.trim() == '') {
              callback({
                success: false,
                message: "Please enter height"
              });
            } else if (addRequestData.weight == undefined || addRequestData.weight.trim() == '') {
              callback({
                success: false,
                message: "Please enter weight"
              });
            } else if (addRequestData.serviceforwhom == undefined || addRequestData.serviceforwhom.trim() == '') {
              callback({
                success: false,
                message: "Please select for whom you need service"
              });   
            } else if (addRequestData.requiredService == undefined || addRequestData.requiredService.trim() == '') {
              callback({
                success: false,
                message: "Please select a service"
              });
            } else if (addRequestData.requestDetails == undefined || addRequestData.requestDetails == '') {
              callback({
                success: false,
                message: "Please enter booking details"
              });
            } else if (addRequestData.customer_email == undefined || addRequestData.customer_email == ''){
               callback({
                success: false,
                message: "Please enter customer email"
              });
            } else {              
                nextcb(null);
              }
          },  
          (nextcb) => {
            let onlyRequestData = {
              user_id: addRequestData.customer_id,
              salutation: addRequestData.salutation,
              name: addRequestData.name,
              age:addRequestData.age,
              height: addRequestData.height,
              weight: addRequestData.weight,
              serviceforwhom: addRequestData.serviceforwhom,
              requiredService: addRequestData.requiredService,
              requestDetails:addRequestData.requestDetails,
              status: 1
            }
           var request = new Request(onlyRequestData);
            request.save((err) => {
              if (err) {
                nextcb(err);
              } else {
                 console.log("request added"); 
                nextcb(null, request);           
              }
            });
          },   

        (request,nextcb) => { 
          console.log("request data",request); 

          let onlyBookingData = {
            request_id : request._id,
            booking_by_user: addRequestData.customer_id,
            requiredService: addRequestData.requiredService,
            booking_by_admin: 1
          }

            if(addRequestData.requiredService == "Medication Reminder"){

             console.log( typeof addRequestData.medicationTime); 
             onlyBookingData.medicationTime = addRequestData.medicationTime;
             onlyBookingData.medicationPerDay = addRequestData.medicationPerDay;
              //onlyBookingData.medicationTime = JSON.parse(addRequestData.medicationTime);
               //console.log(onlyBookingData.medicationTime); 
              //  console.log( typeof onlyBookingData.medicationTime); 
                onlyBookingData.medication_status = 0 ; //means ongoing not yet stopped  
            
            } 


            if(addRequestData.requiredService != "Medication Reminder"){
             // console.log("startdateTime", addRequestData.serviceDate.slice(0,10));
                onlyBookingData.serviceDate = addRequestData.serviceDate;
                onlyBookingData.duration = addRequestData.duration;
                onlyBookingData.comment = addRequestData.comment;
                let startdateTime = addRequestData.serviceDate.slice(0,10) +" "+ addRequestData.serviceTime;
                console.log("startdateTime", startdateTime);
                onlyBookingData.serviceTime = new Date(startdateTime).getTime(); 
                console.log("serviceTime ", onlyBookingData.serviceTime);

                //=============================================================  

                let a = new Date(startdateTime);
                let duration = parseInt(addRequestData.duration)*60*60*1000;               
                a.setTime(a.getTime()+ duration);
                // Data.seviceEndTime = a;               
                onlyBookingData.seviceEndTime = a.getTime();
                console.log("seviceEndTime",onlyBookingData.seviceEndTime);
            }          

            var bookassessment = new Booking(onlyBookingData);
            bookassessment.save((err,response) => {
              if (err) {
                console.log("err", err);
                nextcb(err);
              } else { 
               console.log(response);              
                Request.update({
                  _id:request._id,                 
                }, {
                    status: 3,  //means booking done
                    booking_id: response._id
                }).exec((err, result) => {
                  console.log(result);
                  if (err) {
                    nextcb(err);
                  } else {
                    nextcb(null);
                        //start sent mail to admin
                        // var mailOptions = {
                        //   //from: '"Care Now">', // sender address
                        //   from: '"Care Now" <avijit.team@gmail.com>',
                        //   to: 'hielsservices@gmail.com', // list of receivers
                        //  // to: 'uzra.brainium@gmail.com',
                        //   subject: 'Booking Added !!', // Subject line
                        //   html: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body bgcolor="#ededed"><table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ededed" ><tr><td><table width="60%" border="0" cellspacing="0" cellpadding="0" bgcolor="#FFF" align="center" style="border-radius:10px; border:1px solid #ededed; box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.25); margin: auto;"><tr><td valign="top" align="center" style="padding: 15px"><img src="' + siteurl + 'assets/imgs/logo.png" width="100px" height="120px" alt="Carenow logo" title="Care Now logo" border=0;/></td><tr><td valign="top" style="padding: 40px;" height="200">Hello Admin,<br><br>A booking for "'+Data.requiredService+'" with request Id '+Data.request_id+' has been successfully done by a user. Please assign a helper if needed.<br><br> Thank you<br><br>Team Care Now</td></tr><tr><td style="padding: 15px" align="center" bgcolor="#FFF"><p style="font:normal 12px Arial, Helvetica, sans-serif;"></p></td></tr></table></td></tr></table></body></html>'
                        // };

                        // transporter.sendMail(mailOptions, (err, info) => {
                        //   if (error) {
                        //     console.log(err);
                        //   } else {
                        //     console.log('Mail sent: ' + info.response);
                        //   }
                        // });
                        //end of sent mail
                  }
                });                         
              }
            });
          }
      ],
      (err) => {
          if(err){
            callback({success: false,message: "Some internal error has occurred",err: err});
          } else {
              if(addRequestData.requiredService != "Medication Reminder"){
                callback({success: true,message: "Booking done. Mail will be sent to you when admin assigns a helper"});
              }else{
                callback({success: true,message: "Booking done. Notification will be sent to you for medication"});
              }
          }
      });
  },

  //=============================================================================================================

  blockuser: (userdata, callback) => {
    if (userdata._id == undefined || userdata._id == '') {
      callback({
        success: false,
        message: "Invalid user Id"
      });
    } else {
      User.update({
        _id: userdata._id
      }, {
          block: true
        })
        .exec((err, data) => {
          if (err) {
            callback({
              success: false,
              message: "Some internal error has occurred",
              err: err
            });
          } else {
            callback({
              success: true,
              message: "User blocked"
            });
          }
        });
    }
  },

  unblockuser: (userdata, callback) => {
    if (userdata._id == undefined || userdata._id == '') {
      callback({
        success: false,
        message: "Invalid user Id"
      });
    } else {
      User.update({
        _id: userdata._id
      }, {
          block: false
        })
        .exec((err, data) => {
          if (err) {
            callback({
              success: false,
              message: "Some internal error has occurred",
              err: err
            });
          } else {
            callback({
              success: true,
              message: "User unblocked"
            });
          }
        });
    }
  },

  removeuser: (userdata, callback) => {
    if (userdata._id == undefined || userdata._id == '') {
      callback({
        success: false,
        message: "Invalid user Id"
      });
    } else {
      User.remove({
        _id: userdata._id
      })
        .exec((err, data) => {
          if (err) {
            callback({
              success: false,
              message: "Some internal error has occurred",
              err: err
            });
          } else {
            callback({
              success: true,
              message: "User removed successfully"
            });
          }
        });
    }
  },

  getoneuserData: (userid, callback) => {
    User.findOne({
      _id: userid
    })
      .exec((err, userdetails) => {
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
          if (userdetails == null) {
            callback({
              success: false,
              message: "Some internal error has occurred"
            });
          } else {
            callback({
              success: true,
              message: "User data fetched",
              data: userdetails
            });
          }
        }
      });
  },

  updateuser: (userdata, callback) => {
    async.waterfall([
      (nextcb) => {
        if (userdata.firstname == undefined || userdata.firstname.trim() == '') {
          callback({
            status: false,
            message: "Please enter first name"
          });
        } else if (userdata.firstname.trim() != '' && !specialchar.test(userdata.firstname)) {
          callback({
            status: false,
            message: "First name can not contain any number or special character"
          });
        } else if (userdata.firstname.trim() != '' && userdata.firstname.trim().length > 36) {
          callback({
            status: false,
            message: "First name can not be longer than 36 characters"
          });
        } else if (userdata.lastname == undefined || userdata.lastname.trim() == '') {
          callback({
            status: false,
            message: "Please enter last name"
          });
        } else if (userdata.lastname.trim() != '' && !specialchar.test(userdata.lastname)) {
          callback({
            status: false,
            message: "Last name can not contain any number or special character"
          });
        } else if (userdata.lastname.trim() != '' && userdata.lastname.trim().length > 36) {
          callback({
            status: false,
            message: "Last name can not be longer than 36 characters"
          });
        } else if (userdata.email == undefined || userdata.email.trim() == '' || !validator.validate(userdata.email)) {
          callback({
            status: false,
            message: "Please enter a valid email"
          });
        } else {
          nextcb(null);
        }
      },

      (nextcb) => {
        User.update({
          _id: userdata.id
        }, {
            firstname: userdata.firstname,
            lastname: userdata.lastname
          }).exec((err, data) => {
            if (err) {
              nextcb(err);
            } else {
              nextcb(null);
            }
          });
      },
    ], (err) => {
      if (err) {
        callback({
          success: false,
          message: "Some internal error has occurred",
          err: err
        });
      } else {
        callback({
          success: true,
          message: "Profile updated successfully"
        });
      }
    });
  },

  addcategory: (categoryData, callback) => {
    async.waterfall([
      (nextcb) => {
        if (categoryData.category_name == undefined || categoryData.category_name.trim() == '') {
          callback({
            success: false,
            message: "Please enter category name"
          });
        } else if (categoryData.category_icon == undefined || categoryData.category_icon.trim() == '') {
          callback({
            success: false,
            message: "Please select an icon"
          });
        } else {
          nextcb(null);
        }
      },
      (nextcb) => {
        Category.count({
          category_name: categoryData.category_name
        }, (err, categorycount) => {
          if (err) {
            nextcb(err);
          } else {
            if (categorycount > 0) {
              callback({
                status: false,
                message: "Category already exists"
              });
            } else {
              nextcb(null);
            }
          }
        });
      },
      (nextcb) => {
        var category = new Category(categoryData);
        category.save((err) => {
          if (err) {
            nextcb(err);
          } else {
            nextcb(null);
          }
        });
      }
    ], (err) => {
      if (err) {
        callback({
          success: false,
          message: "Some internal error has occurred",
          err: err
        });
      } else {
        callback({
          success: true,
          message: "Category added successfully"
        });
      }
    });

  },

  getcategorydata: (pagenum, callback) => {
    var page = 1;
    var limit = 10;
    var sort_field = 'createdAt';
    var order = '-1';

    page = pagenum;

    Category
      .find({})
      .lean()
      .sort([
        [sort_field, order]
      ])
      .paginate(page, limit, (err, categorydetails) => {
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
        Category
          .count({})
          .exec(function (err, categorycount) {
            if (err) {
              callback({
                status: false,
                message: "Some internal error has occurred",
                err: err
              });
            } else {
              callback({
                success: true,
                message: "Category data fetched",
                data: categorydetails,
                categorycount: categorycount
              });
            }
          });
        }
      });
  },

  getsearchcategorydata: (searchData, callback) => {
    Category.find({
      $or: [{
        'category_name': new RegExp(searchData.details, "i")
      }]
    })
      .lean()
      .exec((err, categorydetails) => {
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
          callback({
            success: true,
            message: "Search category details fetched",
            data: categorydetails
          });
        }
      });
  },

  blockcategory: (categorydata, callback) => {
    Category.update({
      _id: categorydata._id
    }, {
        block: true
      })
      .exec((err, data) => {
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
          callback({
            success: true,
            message: "Category blocked"
          });
        }
      });
  },

  unblockcategory: (categorydata, callback) => {
    Category.update({
      _id: categorydata._id
    }, {
        block: false
      })
      .exec((err, data) => {
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
          callback({
            success: true,
            message: "Category unblocked"
          });
        }
      });
  },

  getonecategorydata: (categoryid, callback) => {
    Category.findOne({
      _id: categoryid
    })
      .exec((err, categorydetails) => {
        if (err) {
          callback({
            status: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
          if (categorydetails == null) {
            callback({
              status: false,
              message: "Some internal error has occurred"
            });
          } else {
            callback({
              success: true,
              message: "Category data fetched",
              data: categorydetails
            });
          }
        }
      });
  },

  updatecategory: (categorydata, callback) => {
    async.waterfall([
      (nextcb) => {
        if (categorydata.category_name == undefined || categorydata.category_name.trim() == '') {
          callback({
            success: false,
            message: "Please enter category name"
          });
        } else if (categorydata.category_icon == undefined || categorydata.category_icon.trim() == '') {
          callback({
            success: false,
            message: "Please select an icon"
          });
        } else {
          nextcb(null);
        }
      },
      (nextcb) => {
        Category.count({
          category_name: categorydata.category_name
        }, (err, categorycount) => {
          if (err) {
            nextcb(err);
          } else {
            if (categorycount > 0) {
              callback({
                status: false,
                message: "Category name already exists"
              });
            } else {
              nextcb(null);
            }
          }
        });
      },
      (nextcb) => {
        Category.update({
          _id: categorydata.category_id
        }, {
            category_name: categorydata.category_name,
            category_icon: categorydata.category_icon
          }).exec((err, data) => {
            if (err) {
              nextcb(err);
            } else {
              nextcb(null);
            }
          });
      }
    ],
      (err) => {
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
          callback({
            success: true,
            message: "Category updated successfully"
          });
        }
      });
  },

  removecategory: (categorydata, callback) => {
    if (categorydata.category_id == undefined || categorydata.category_id == '') {
      callback({
        success: false,
        message: "Invalid category Id"
      });
    } else {
      Category.remove({
        _id: categorydata.category_id
      })
        .exec((err) => {
          if (err) {
            callback({
              success: false,
              message: "Some internal error has occurred",
              err: err
            });
          } else {
            callback({
              success: true,
              message: "Category removed successfully"
            });
          }
        });
    }
  },

  addcoupons: (coupondata, imagedata, callback) => {
    async.waterfall([
      (nextcb) => {
        if (coupondata.category_id == undefined || coupondata.category_id == '') {
          callback({
            success: false,
            message: "Please select a category"
          });
        } else if (coupondata.coupon_name == undefined || coupondata.coupon_name == '') {
          callback({
            success: false,
            message: "Please enter coupon name"
          });
        } else if (coupondata.coupon_description == undefined || coupondata.coupon_description == '') {
          callback({
            success: false,
            message: "Please enter coupon description"
          });
        } else if (coupondata.barcode_id == undefined || coupondata.barcode_id == '') {
          callback({
            success: false,
            message: "Please enter barcode Id"
          });
        } else if (coupondata.original_price == undefined || coupondata.original_price == '') {
          callback({
            success: false,
            message: "Please enter original price"
          });
        } else if (coupondata.discount_percent == undefined || coupondata.discount_percent == '') {
          callback({
            success: false,
            message: "Please enter discount percentage"
          });
        } else if (coupondata.discount_price == undefined || coupondata.discount_price == '') {
          callback({
            success: false,
            message: "Please enter discount price"
          });
        }
        else if (coupondata.cashback_percent == undefined || coupondata.cashback_percent == '') {
          callback({
            success: false,
            message: "Please enter cashback percent"
          });
        }
        else if (coupondata.address == undefined || coupondata.address == '') {
          callback({
            success: false,
            message: "Please enter coupon address"
          });
        } else if (coupondata.address_lat == undefined || coupondata.address_lat == '') {
          callback({
            success: false,
            message: "Invalid Address"
          });
        } else if (coupondata.address_long == undefined || coupondata.address_long == '') {
          callback({
            success: false,
            message: "Invalid Address"
          });
        } else if (coupondata.expire_date == undefined || coupondata.address_long == '') {
          callback({
            success: false,
            message: "Please select an expire date"
          });
        } else {
          nextcb(null);
        }
      },

      (nextcb) => {
        Coupons.count({
          coupon_name: coupondata.coupon_name
        }, (err, couponcount) => {
          if (err) {
            nextcb(err);
          } else {
            if (couponcount > 0) {
              callback({
                status: false,
                message: "Coupon name already exists"
              });
            } else {
              nextcb(null);
            }
          }
        });
      },

      (nextcb) => {
        if (imagedata.coupon_image != undefined || imagedata.coupon_image != null) {
          var file = imagedata.coupon_image;
          var ext = file.name.slice(file.name.lastIndexOf('.'));
          var fileName = Date.now() + ext;
          var folderpath = 'assets/couponimage/';
          file.mv(folderpath + fileName, function (err) {
            if (err) {
              console.log(err);
            }
          });
          coupondata.coupon_image = fileName;
          nextcb(null);
        } else {
          coupondata.coupon_image = 'defaultcoupon.png';
          nextcb(null);
        }
      },

      (nextcb) => {
        if (imagedata.barcode_image != undefined || imagedata.barcode_image != null) {
          var file = imagedata.barcode_image;
          var ext = file.name.slice(file.name.lastIndexOf('.'));
          var fileName = Date.now() + ext;
          var folderpath = 'assets/barcodeimage/';
          file.mv(folderpath + fileName, function (err) {
            if (err) {
              console.log(err);
            }
          });
          coupondata.barcode_image = fileName;
          nextcb(null);
        } else {
          callback({
            status: false,
            message: "Please select barcode image"
          });
        }
      },

      (nextcb) => {
        var coupons = new Coupons(coupondata);
        coupons.save((err) => {
          if (err) {
            nextcb(err);
          } else {
            nextcb(null);
          }
        });
      }
    ], (err) => {
      if (err) {
        callback({
          success: false,
          message: "Some internal error has occurred",
          err: err
        });
      } else {
        callback({
          success: true,
          message: "Coupon added successfully"
        });
      }
    })

  },

  getcouponlist: (pagenum, callback) => {
    var page = 1;
    var limit = 10;
    var sort_field = 'createdAt';
    var order = '-1';

    page = pagenum;

    Coupons
      .find({})
      .lean()
      .sort([
        [sort_field, order]
      ])
      .paginate(page, limit, (err, coupondetails) => {
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
        Coupons
          .count({})
          .exec(function (err, couponcount) {
            if (err) {
              callback({
                status: false,
                message: "Some internal error has occurred",
                err: err
              });
            } else {
              callback({
                success: true,
                message: "Coupon data fetched",
                data: coupondetails,
                couponcount: couponcount
              });
            }
          });
        }
      });
  },

  getsearchcoupondata: (searchData, callback) => {
    Coupons.find({
      $or: [{
        'coupon_name': new RegExp(searchData.details, "i")
      }, {
        'coupon_description': new RegExp(searchData.details, "i")
      }]
    })
      .lean()
      .exec((err, coupondetails) => {
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
          callback({
            success: true,
            message: "Search coupon details fetched",
            data: coupondetails
          });
        }
      });
  },

  blockcoupon: (coupondata, callback) => {
    Coupons.update({
      _id: coupondata._id
    }, {
        block: true
      })
      .exec((err, data) => {
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
          callback({
            success: true,
            message: "Coupon blocked"
          });
        }
      });
  },

  unblockcoupon: (coupondata, callback) => {
    Coupons.update({
      _id: coupondata._id
    }, {
        block: false
      })
      .exec((err, data) => {
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
          callback({
            success: true,
            message: "Coupon unblocked"
          });
        }
      });
  },

  getonecoupondata: (couponid, callback) => {
    Coupons.findOne({
      _id: couponid
    })
      .exec((err, coupondetails) => {
        if (err) {
          callback({
            status: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
          if (coupondetails == null) {
            callback({
              status: false,
              message: "Some internal error has occurred"
            });
          } else {
            callback({
              success: true,
              message: "Coupon data fetched",
              data: coupondetails
            });
          }
        }
      });
  },

  updatecoupon: (coupondata, callback) => {
    async.waterfall([
      (nextcb) => {
        if (coupondata.category_id == undefined || coupondata.category_id == '') {
          callback({
            success: false,
            message: "Please select a category"
          });
        } else if (coupondata.coupon_name == undefined || coupondata.coupon_name == '') {
          callback({
            success: false,
            message: "Please enter coupon name"
          });
        } else if (coupondata.coupon_description == undefined || coupondata.coupon_description == '') {
          callback({
            success: false,
            message: "Please enter coupon description"
          });
        } else if (coupondata.barcode_id == undefined || coupondata.barcode_id == '') {
          callback({
            success: false,
            message: "Please enter barcode Id"
          });
        } else if (coupondata.original_price == undefined || coupondata.original_price == '') {
          callback({
            success: false,
            message: "Please enter original price"
          });
        } else if (coupondata.discount_percent == undefined || coupondata.discount_percent == '') {
          callback({
            success: false,
            message: "Please enter discount percentage"
          });
        } else if (coupondata.discount_price == undefined || coupondata.discount_price == '') {
          callback({
            success: false,
            message: "Please enter discount price"
          });
        }
        else if (coupondata.cashback_percent == undefined || coupondata.cashback_percent == '') {
          callback({
            success: false,
            message: "Please enter cashback percent"
          });
        }
        else if (coupondata.address == undefined || coupondata.address == '') {
          callback({
            success: false,
            message: "Please enter coupon address"
          });
        } else if (coupondata.address_lat == undefined || coupondata.address_lat == '') {
          callback({
            success: false,
            message: "Invalid Address"
          });
        } else if (coupondata.address_long == undefined || coupondata.address_long == '') {
          callback({
            success: false,
            message: "Invalid Address"
          });
        } else if (coupondata.expire_date == undefined || coupondata.address_long == '') {
          callback({
            success: false,
            message: "Please select an expire date"
          });
        } else {
          nextcb(null);
        }
      },
      (nextcb) => {
        Coupons.count({
          coupon_name: coupondata.coupon_name
        }, (err, couponcount) => {
          if (err) {
            nextcb(err);
          } else {
            if (couponcount > 0) {
              callback({
                status: false,
                message: "Coupon name already exists"
              });
            } else {
              nextcb(null);
            }
          }
        });
      },
      (nextcb) => {
        Coupons.update({
          _id: coupondata._id
        }, {
            //coupon_id: coupondata.coupon_id,
            category_id:coupondata.category_id,
            coupon_name: coupondata.coupon_name,
            coupon_description: coupondata.coupon_description,
            original_price: coupondata.original_price,
            discount_percent: coupondata.discount_percent,
            discount_price: coupondata.discount_price,
            cashback_percent: coupondata.cashback_percent,
            address: coupondata.address,
            barcode_id:coupondata.barcode_id,
            address_lat: coupondata.address_lat,
            address_long: coupondata.address_long,
            expire_date: coupondata.expire_date,
          }).exec((err, data) => {
            if (err) {
              nextcb(err);
            } else {
              nextcb(null);
            }
          });
      }
    ],
      (err) => {
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
          callback({
            success: true,
            message: "Coupon updated successfully"
          });
        }
      });
  },

  removecoupon: (coupondata, callback) => {
    if (coupondata.coupon_id == undefined || coupondata.coupon_id == '') {
      callback({
        success: false,
        message: "Invalid coupon Id"
      });
    } else {
      Coupons.remove({
        _id: coupondata.coupon_id
      })
        .exec((err) => {
          if (err) {
            callback({
              success: false,
              message: "Some internal error has occurred",
              err: err
            });
          } else {
            callback({
              success: true,
              message: "Coupon removed successfully"
            });
          }
        });
    }
  },

};
module.exports = adminService;
