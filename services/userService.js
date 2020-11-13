var express = require('express');
var async = require("async");
var validator = require("email-validator");
var randomstring = require("randomstring");
var nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt-nodejs');
var app = express();
var mongoose = require("mongoose");
var asyncLoop = require('node-async-loop');
var path = require('path');
var fs = require('fs');
var forEach = require('async-foreach').forEach;
var CronJob = require('cron').CronJob;

var User = require('../models/user');
var Helper = require('../models/helper');
var Request = require('../models/request');
var Notification = require('../models/notification');
var Booking = require('../models/booking');
var Chat = require('../models/chat');
var Reviews = require('../models/reviews');

var Category = require('../models/category');
var Coupons = require('../models/coupons');

var Advertisement = require('../models/advertisement');

var config = require("../config");
var NotificationService = require('../notificationservice');

var siteurl = config.__site_url;

var specialchar = /^[a-zA-Z\s]*$/;

var transporter = nodemailer.createTransport('smtps://avijit.team@gmail.com:avijit_team@smtp.gmail.com');

// Create token while sign in
function createToken(user) {
  var tokenData = {
    id: user._id,
    email: user.email.toLowerCase()
  };
  var token = jwt.sign(tokenData, config.secretKey, {
    //expiresIn: '48h'
  });
  return token;
}

function decodeBase64Image(dataString) 
{
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  var response = {};

  if (matches.length !== 3) 
  {
    return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');

  return response;
}


//===========================CronJob======================================================================

var job = new CronJob({
   cronTime: '01 * * * * *',  //for testing
    //cronTime: '0 */5 * * * *',   //'min hr dayofmonth month dayofweek cmdToBeExecuted' means every 5mins
    onTick: function() {
    console.log("Cron is running");  
      userService.cronJobFormedication();      
    },
  start: false,
  timeZone: 'GMT'
});
job.start();



var job = new CronJob({
   cronTime: '01 * * * * *',  //for testing
   // cronTime: '*/15 * * * *',   //'min hr dayofmonth month dayofweek cmdToBeExecuted'
    onTick: function() {
    console.log("Cron2 is running");  
      userService.cronJobForAppointment();      
    },
  start: false,
  timeZone: 'GMT'
});
job.start();

//==========================================================================================================

var userService = {

  userregister: (registerData, callback) => {
   // console.log("registerData", registerData);
    async.waterfall([
      (nextcb) => {
        if (registerData.firstname == undefined || registerData.firstname.trim() == '') {
          callback({
            success: false,
            message: "Please enter firstname"
          });
        } else if (registerData.firstname.trim() != '' && !specialchar.test(registerData.firstname)) {
          callback({
            success: false,
            message: "Name can not contain any number or special character"
          });
        } else if (registerData.firstname.trim() != '' && registerData.firstname.trim().length > 36) {
          callback({
            success: false,
            message: "Name can not be longer than 36 characters"
          });
        } else if (registerData.lastname == undefined || registerData.lastname.trim() == '') {
          callback({
            success: false,
            message: "Please enter lastname"
          });
        } else if (registerData.lastname.trim() != '' && !specialchar.test(registerData.lastname)) {
          callback({
            success: false,
            message: "Name can not contain any number or special character"
          });
        } else if (registerData.lastname.trim() != '' && registerData.lastname.trim().length > 36) {
          callback({
            success: false,
            message: "Name can not be longer than 36 characters"
          });
        } else if (registerData.location == undefined || registerData.location.trim() == '') {
          callback({
            success: false,
            message: "Please enter address"
          });
        } else if (registerData.contact_no == undefined || registerData.contact_no.trim() == '') {
          callback({
            success: false,
            message: "Please enter contact number"
          });   
        } else if (registerData.email == undefined || registerData.email.trim() == '' || !validator.validate(registerData.email)) {
          callback({
            success: false,
            message: "Please enter a valid email"
          });
        } else if (registerData.password == undefined || registerData.password == '') {
          callback({
            success: false,
            message: "Please enter a password"
          });
        } else if (registerData.password.length < 6) {
          callback({
            success: false,
            message: "Password length must be minimum 6 characters"
          });
        } else if (registerData.password != registerData.confirm_password) {
          callback({
            success: false,
            message: "Password and confirm password must match"
          });
        } else {
          nextcb(null);
        }
      },

      (nextcb) => {
        User.countDocuments({
          email: registerData.email.toLowerCase()
        }, (err, usercount) => {
          if (err) {
            nextcb(err);
          } else {
            if (usercount > 0) {
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
        var user = new User(registerData);
        user.save((err) => {
          if (err) {
            nextcb(err);
          } else {
            nextcb(null, user);           
          }
        });

        //start sent mail
        var mailOptions = {
          //from: '"Care Now">', // sender address
          from: '"Care Now" <avijit.team@gmail.com>',
          to: registerData.email.toLowerCase(), // list of receivers
          subject: 'Care Now registration success !!', // Subject line
          html: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body bgcolor="#ededed"><table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ededed" ><tr><td><table width="60%" border="0" cellspacing="0" cellpadding="0" bgcolor="#FFF" align="center" style="border-radius:10px; border:1px solid #ededed; box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.25); margin: auto;"><tr><td valign="top" align="center" style="padding: 15px"><img src="' + siteurl + 'assets/imgs/logo.png" width="100px" height="120px" alt="Carenow logo" title="Care Now logo" border=0;/></td><tr><td valign="top" style="padding: 40px;" height="200">Hello ' + registerData.firstname + ' ,<br><br>Welcome to Care Now. <br><br>You have successfully registered to this App.<br><br>Your email id is <strong>' + registerData.email + ' </strong> and password is <strong>' + registerData.password + ' </strong><br><br> Thank you<br><br>Team Care Now</td></tr><tr><td style="padding: 15px" align="center" bgcolor="#FFF"><p style="font:normal 12px Arial, Helvetica, sans-serif;"></p></td></tr></table></td></tr></table></body></html>'
        };

        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.log(err);
          } else {
            console.log('Mail sent: ' + info.response);
          }
        });
        //end of sent mail
       
      }
    ], (err, userdata) => {
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
          message: "Registration Successful.",
          data: userdata
        });
      }
    });
  },

  resendemailOTP: (resendOTPData, callback) => {
    async.waterfall([
      (nextcb) => {
        if (resendOTPData.user_id == undefined || resendOTPData.user_id.trim() == '') {
          callback({
            success: false,
            message: "Some internal error has occured"
          });
        } else {
          nextcb(null);
        }
      },

      (nextcb) => {
        User.findOne({
          _id: resendOTPData.user_id
        }, (err, userdetails) => {
          if (err) {
            nextcb(err);
          } else {
            if (userdetails == null) {
              callback({
                success: false,
                message: "Some internal error has occured"
              });
            } else {

              //start sent mail
              var mailOptions = {
               // from: '"Carenow">', // sender address
                from: '"Care Now" <avijit.team@gmail.com>',
                to: userdetails.email, // list of receivers
                subject: 'Carenow email varification', // Subject line
                html: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body bgcolor="#ededed"><table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ededed" ><tr><td><table width="60%" border="0" cellspacing="0" cellpadding="0" bgcolor="#FFF" align="center" style="border-radius:10px; border:1px solid #ededed; box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.25); margin: auto;"><tr><td valign="top" align="center" style="padding: 15px"><img src="' + siteurl + 'assets/imgs/logo.png" width="100px" height="120px" alt="Carenow logo" title="Carenow logo" border=0;/></td><tr><td valign="top" style="padding: 40px;" height="200">Hello ' + userdetails.firstname + ' ,<br><br>Welcome to Carenow. <br><br> Your email verification OTP is <strong>' + userdetails.emailOTP + '</strong> <br><br> Thank you<br><br>Team Carenow</td></tr><tr><td style="padding: 15px" align="center" bgcolor="#FFF"><p style="font:normal 12px Arial, Helvetica, sans-serif;"></p></td></tr></table></td></tr></table></body></html>'
              };

              transporter.sendMail(mailOptions, (err, info) => {
                if (error) {
                  console.log(err);
                } else {
                  console.log('Mail sent: ' + info.response);
                }
              });
              //end of sent mail
              nextcb(null);
            }
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
          message: "Email verification OTP has been resent to your email"
        });
      }
    });
  },

  verifyemail: (verifyemailData, callback) => {
    async.waterfall([
      (nextcb) => {
        if (verifyemailData.emailOTP == undefined || verifyemailData.emailOTP.trim() == '') {
          callback({
            success: false,
            message: "Invalid email OTP"
          });
        } else if (verifyemailData.user_id == undefined || verifyemailData.user_id.trim() == '') {
          callback({
            success: false,
            message: "Some internal error has occured"
          });
        } else {
          nextcb(null);
        }
      },

      (nextcb) => {
        User.findOne({
          _id: verifyemailData.user_id
        }, (err, userdetails) => {
          if (err) {
            nextcb(err);
          } else {
            if (userdetails == null) {
              callback({
                success: false,
                message: "Some internal error has occured"
              });
            } else {
              if (userdetails.emailOTP != verifyemailData.emailOTP) {
                callback({
                  success: false,
                  message: "Invalid email OTP"
                });
              } else {
                nextcb(null);
              }
            }
          }
        });
      },
      (nextcb) => {
        User.update({
          _id: verifyemailData.user_id
        }, {
            email_verified: true
          }).exec((err, result) => {
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
          message: "Email verified successfully"
        });
      }
    });
  },

  fblogin: (loginData, callback) => {
    async.waterfall([
      (nextcb) => {
       if (loginData.id == undefined || loginData.id == '') {
          callback({
            success: false,
            message: "Invalid FB Id"
          });
        } else {
          nextcb(null);
        }
      },
      function (nextcb) {
        User.findOne({
          fbid: loginData.id,
          block: false,
          login_type:'fb'
        }, (err, userdetails) => {
          if (err) {
            nextcb(err);
          } else {
            if (userdetails == null) {
                var emailOTP = randomstring.generate({
                  length: 8,
                  charset: 'numeric'
                });

                var generatedpassword = randomstring.generate({
                  length: 6,
                  charset: 'numeric'
                });
        
               // var usernameArr = loginData.name.split(" ");

                loginData.firstname = loginData.first_name;
                loginData.lastname  = loginData.last_name;
                loginData.emailOTP = emailOTP;
                loginData.password = generatedpassword;
                loginData.fbid = loginData.id;
                loginData.login_type = 'fb';

                //console.log(loginData);
        
                var user = new User(loginData);
                user.save((err) => {
                  console.log(user);
                  if (err) {
                    nextcb(err);
                  } else {
                    console.log(user);
                    var token = createToken(user);
                    nextcb(null, token, user);
                  }
                });
              } else {
                var token = createToken(userdetails);
                nextcb(null, token, userdetails);
            }
          }
        });
      }
    ],
      function (err, data, userdetails) {
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
            user_id: userdetails._id
          });
        }
      });
  },

  login: (loginData, callback) => {
    console.log(loginData);
    async.waterfall([
      (nextcb) => {
        if (loginData.email == undefined || loginData.email.trim() == '' || !validator.validate(loginData.email)) {
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

      function (nextcb) {
        User.findOne({
          email: loginData.email.toLowerCase()         
        }, (err, userdetails) => {
          console.log(userdetails);
          if (err) {
            nextcb(err);
          } else {
            if (userdetails == null) {
              callback({
                success: false,
                message: "Invalid email or password"
              });
            } else {
              console.log(userdetails.comparePassword(loginData.password));
              if (!userdetails.comparePassword(loginData.password)) {
                callback({
                  success: false,
                  message: "Invalid email or password"
                });
              } else {                
                  var token = createToken(userdetails);
                  // nextcb(null, token, userdetails); 
                  ////////////==========================
                     User.update({
                      _id: userdetails._id
                    }, {
                        devicetoken: loginData.devicetoken,
                        devicetype: loginData.devicetype, 
                      }).exec((err, data) => {
                        if (err) {
                          nextcb(err);
                        } else {
                          //nextcb(null);
                          nextcb(null, token, userdetails); 
                        }
                      });
                 /////////////////////////////////////                
              }
            }
          }
        });
      }
    ],
      function (err, data, userdetails) {
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
            user_id: userdetails._id,
            profileImage:userdetails.profile_img,
            
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
        User.count({
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
            User.findOneAndUpdate({
              email: forgotpasswordData.email.toLowerCase()
            }, {
                password: hashedpwd
              }, {
                new: true
              })
              .exec(function (err, userdetails) {
                console.log("userdetails", userdetails);
                if (err) {
                  nextcb(err);
                } else {
                  //start sent mail
                  var mailOptions = {
                  ///  from: '"CareNow App">', // sender address
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

  getprofileData: (tokenData, callback) => {
    User.findOne({
      _id: tokenData.id
    }, (err, userdetails) => {
      if (err) {
        callback({
          status: false,
          message: "Some internal error has occurred",
          err: err
        });
      } else {
        if (userdetails == null) {
          callback({
            status: false,
            message: "No profile details found"
          });
        } else {
          callback({
            success: true,
            message: "Profile data fetched",
            data: userdetails
          });
        }
      }
    });
  },

  updateProfile: (updateprofileData, tokenData, callback) => {
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
        } else if (updateprofileData.location == undefined || updateprofileData.location.trim() == '') {
          callback({
            success: false,
            message: "Please enter address"
          });
        } else if (updateprofileData.contact_no == undefined || updateprofileData.contact_no.trim() == '') {
          callback({
            success: false,
            message: "Please enter contact number"
          });   
        } else {
          nextcb(null);
        }
      },

      (nextcb) => {
        User.update({
          _id: tokenData.id
        }, {
            firstname: updateprofileData.firstname,
            lastname: updateprofileData.lastname,
            email: updateprofileData.email.toLowerCase(),
            location: updateprofileData.location,
            contact_no: updateprofileData.contact_no
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

  changePassword: (changepasswordData, tokenData, callback) => {
    console.log("tokendata",tokenData);
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
        User.findOne({
          _id: tokenData.id
        }, (err, userdetails) => {
          if (err) {
            nextcb(err);
          } else {
            if (!userdetails.comparePassword(changepasswordData.currentpassword)) {
              callback({
                status: false,
                message: "Invalid current password"
              });
            } else {
              bcrypt.hash(changepasswordData.newpassword, null, null, (err, hashedpwd) => {
                if (err) {
                  nextcb(err);
                } else {
                  User.update({
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


  updateProfileImage: (profileimage,tokenData, callback) => { 
    console.log("profileimage",profileimage);
     console.log("tokenData",tokenData);

    async.waterfall([
      // (nextcb) => {
      //   if (tokenData.id == undefined || tokenData.id== '') {
      //       callback({success: false,message: "Please provide user_id"});        
      //   } else {
      //     nextcb(null);
      //   }
      // },

      (nextcb) => {
         if (profileimage == undefined || profileimage == '') {          
            profileimage.profile_img = '',
            nextcb(null);
          } else {
            let attachImage = profileimage.profile_img;
            var ext = path.extname(profileimage.profile_img.name);            
        
            if(ext.indexOf("?") >= 0){             
              let extArr = ext.split("?");
              ext = extArr[0];            
            }

          console.log("ext",ext); 
          fileNameewithoutext = Date.now();
          fileName = fileNameewithoutext + ext;
          //var allowedExt = ['.jpeg', '.png', '.JPG', '.jpg', '.JPEG', '.PNG','.PDF','.pdf',''];
          var allowedExt = ['.jpeg', '.png', '.JPG', '.jpg', '.JPEG', '.PNG',''];
          if (allowedExt.indexOf(ext) > -1) {
            attachImage.mv('assets/profileImage/' + fileName, (err) => {
              if (err) {
                  callback({ success: false, message: "Error occurred on uploading profile image", err: err });
                } else {
                  profileimage.profile_img = fileName;                   
                  nextcb(null);
                }
            });
          } else {
              callback({ success: false, message: "Only extension with 'jpeg/png' is allowed" });
          }
        }
      },

      (nextcb) =>{
        User.findOne({ _id: tokenData.id})
        .exec((err, data) => {
           console.log("data = ",data);
          if (err) {
            nextcb(err);
          } else {
            if(data.profile_img != null || data.profile_img != ''){
              fs.unlink('assets/profileImage/' + data.profile_img, function(err) {
                 if(!err){
                  console.log("File Deleted Successfully");
                 }else{
                    console.log("error",err);
                 }
              })
              nextcb(null);
            }else{
              nextcb(null);
            }
          }
        });
      },

      (nextcb) => {       
        
        User.updateOne({
          _id: tokenData.id
        }, {
            profile_img: profileimage.profile_img
          })
          .exec((err, data) => {
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
          message: "Profile image updated successfully",
          data: profileimage.profile_img,
        });
      }
    });
  },


  addRequest: (addRequestData,tokenData, callback) => {
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
            message: "Please enter request details"
          });
        // } else if (addRequestData.hearingProblem == undefined || addRequestData.hearingProblem.trim() == '') {
        //   callback({
        //     success: false,
        //     message: "Please select hearing issue"
        //   });
        // }
        // else if (addRequestData.sightProblem == undefined || addRequestData.sightProblem.trim() == '') {
        //   callback({
        //     success: false,
        //     message: "Please enter sight issue"
        //   });        
        } else {
          nextcb(null);
        }
      },

      (nextcb) => {
        User.findOne({
          _id: tokenData.id
        }, (err, userdata) => {
          if (err) {
            nextcb(err);
          } else {
            if (userdata != null) { 
               nextcb(null,userdata);
            } else {
              // nextcb(null);
               callback({
                success: false,
                message: "Some internal error has occured",
                err: err
             });
            }
          }
        });
      },

      (userdata,nextcb) => {
        console.log("userdata = ",userdata);
        addRequestData.user_id = tokenData.id;
        console.log("userdata",userdata);
        var request = new Request(addRequestData);
        request.save((err) => {
          if (err) {
            nextcb(err);
          } else {
            nextcb(null, request);           
          }
        });

        //start sent mail to customer
        var mailOptions = {
          //from: '"Care Now">', // sender address
          from: '"Care Now" <avijit.team@gmail.com>',
          to: userdata.email.toLowerCase(), // list of receivers
          subject: 'Care Now Add Request !!', // Subject line
          html: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body bgcolor="#ededed"><table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ededed" ><tr><td><table width="60%" border="0" cellspacing="0" cellpadding="0" bgcolor="#FFF" align="center" style="border-radius:10px; border:1px solid #ededed; box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.25); margin: auto;"><tr><td valign="top" align="center" style="padding: 15px"><img src="' + siteurl + 'assets/imgs/logo.png" width="100px" height="120px" alt="Carenow logo" title="Care Now logo" border=0;/></td><tr><td valign="top" style="padding: 40px;" height="200">Hello ' + userdata.firstname + ' ,<br><br>Welcome to Care Now. <br><br>Your request for "'+addRequestData.requiredService+'" has been successfully send to the admin. This may take maximum 24 hours to get this approved by the App Admin.<br><br> Thank you<br><br>Team Care Now</td></tr><tr><td style="padding: 15px" align="center" bgcolor="#FFF"><p style="font:normal 12px Arial, Helvetica, sans-serif;"></p></td></tr></table></td></tr></table></body></html>'
        };

        transporter.sendMail(mailOptions, (err, info) => {
          if (error) {
            console.log(err);
          } else {
            console.log('Mail sent: ' + info.response);
          }
        });
        //end of sent mail

      //start sent mail to admin
        var mailOptions = {
          //from: '"Care Now">', // sender address
          from: '"Care Now" <avijit.team@gmail.com>',
          to: 'hielsservices@gmail.com', // list of receivers
         // to: 'uzra.brainium@gmail.com',
          subject: 'Care Now Request Added !!', // Subject line
          html: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body bgcolor="#ededed"><table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ededed" ><tr><td><table width="60%" border="0" cellspacing="0" cellpadding="0" bgcolor="#FFF" align="center" style="border-radius:10px; border:1px solid #ededed; box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.25); margin: auto;"><tr><td valign="top" align="center" style="padding: 15px"><img src="' + siteurl + 'assets/imgs/logo.png" width="100px" height="120px" alt="Carenow logo" title="Care Now logo" border=0;/></td><tr><td valign="top" style="padding: 40px;" height="200">Hello Admin,<br><br>A request for "'+addRequestData.requiredService+'" has been successfully added by a user. Please approve it within 24 hours.<br><br> Thank you<br><br>Team Care Now</td></tr><tr><td style="padding: 15px" align="center" bgcolor="#FFF"><p style="font:normal 12px Arial, Helvetica, sans-serif;"></p></td></tr></table></td></tr></table></body></html>'
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
    ], (err, requestdata) => {
      console.log("err = ",err);
        console.log("requestdata = ",requestdata);

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
          message: "Request send successful.Please check your mail",
          //data: userdata
        });
      }
    });
  }, 

  
  savenotification: (notifyData,callback) => { 
   // console.log("savenotification",notifyData);
 
      async.waterfall([
          (nextcb) => {
            if(notifyData.action == undefined || notifyData.action == '') {
                callback({success: false,message: "Action required."});
            }else if(notifyData.receiver_id == undefined || notifyData.receiver_id == '') {
                callback({success: false,message: "Receiver Id required."});
            }else if(notifyData.sender_id == undefined || notifyData.sender_id == '') {
                callback({success: false,message: "Sender Id required."});
            }else if(notifyData.title == undefined || notifyData.title == '') {
                callback({success: false,message: "Notification title required."});
            }else if(notifyData.message == undefined || notifyData.message == '') {
                callback({success: false,message: "Notification message required."});
            }else if(notifyData.receiver_type == undefined || notifyData.receiver_type == '') {
                callback({success: false,message: "Receiver type required."});
            }else if(notifyData.sender_type == undefined || notifyData.sender_type == '') {
                callback({success: false,message: "Sender type required."});
            }else if(notifyData.request_id == undefined || notifyData.request_id == '') {
                callback({success: false,message: "Request Id required."});
            }else {              
                nextcb(null);
            }
          },          
          (nextcb) => {
            var notification = new Notification(notifyData);
            notification.save((err) => {
              if (err) {
                  console.log("err", err);
                nextcb(err);
              } else {
                console.log("no err");
                nextcb(null, notification);           
              }
            });
          }
      ],
      (err) => {
          if(err){
            callback({success: false,message: "Some internal error has occurred",err: err});
          } else {
            callback({success: true,message: "Notification inserted"});
          }
      });
  },

  // getallnotification: (pagenum, callback) => {
  //   var page = 1;
  //   var limit = 10;
  //   var sort_field = 'createdAt';
  //   var order = '-1';

  //   page = pagenum;

  //   Notification
  //     .find({})
  //     .sort([
  //       [sort_field, order]
  //     ])
  //     .paginate(page, limit, (err, notidetails) => {
  //       if (err) {
  //         callback({
  //           success: false,
  //           message: "Some internal error has occurred",
  //           err: err
  //         });
  //       } else {
  //         Notification
  //           .count({})
  //           .exec((err, noticount) => {
  //             if (err) {
  //               callback({
  //                 success: false,
  //                 message: "Some internal error has occurred",
  //                 err: err
  //               });
  //             } else {
  //               callback({
  //                 success: true,
  //                 message: "All notification details fetched",
  //                 data: notidetails,
  //                 usercount: noticount
  //               });
  //             }
  //           });
  //       }
  //     });
  // },

  getallnotification: (tokenData, callback) => {
    console.log("getallnotification",tokenData);
  
    var sort_field = 'createdAt';
    var order = '-1';

    Notification
      .find( { $and: [
            {receiver_id: tokenData.id},
            {receiver_type: 'customer'},
            {action: { $ne:'MedicationReminder'}},
            {action: { $ne:'AppointmentReminder'}}
        ]})
      .sort([
        [sort_field, order]
      ])
        .exec(function (err, notidetails) {
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
          Notification
            .count({})
            .exec((err, noticount) => {
              if (err) {
                callback({
                  success: false,
                  message: "Some internal error has occurred",
                  err: err
                });
              } else {
                callback({
                  success: true,
                  message: "All notification details fetched",
                  data: notidetails,
                  usercount: noticount
                });
              }
            });
        }
      });
  },

  getMedinotification: (tokenData, callback) => {
    console.log("getMedinotification",tokenData);
  
    var sort_field = 'createdAt';
    var order = '-1';

    Notification
      .find( { $and: [
            {receiver_id: tokenData.id},
            {receiver_type: 'customer'},
            {action: 'MedicationReminder'}
        ]})
      .sort([
        [sort_field, order]
      ])
        .exec(function (err, notidetails) {
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
          Notification
            .count({})
            .exec((err, noticount) => {
              if (err) {
                callback({
                  success: false,
                  message: "Some internal error has occurred",
                  err: err
                });
              } else {
                callback({
                  success: true,
                  message: "All notification details fetched",
                  data: notidetails,
                  usercount: noticount
                });
              }
            });
        }
      });
  },

  getAppointnotification: (tokenData, callback) => {
    console.log("getAppointnotification",tokenData);
  
    var sort_field = 'createdAt';
    var order = '-1';

    Notification
      .find( { $and: [
            {receiver_id: tokenData.id},
            {receiver_type: 'customer'},
            {action: 'AppointmentReminder'}
        ]})
      .sort([
        [sort_field, order]
      ])
        .exec(function (err, notidetails) {
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
          Notification
            .count({})
            .exec((err, noticount) => {
              if (err) {
                callback({
                  success: false,
                  message: "Some internal error has occurred",
                  err: err
                });
              } else {
                callback({
                  success: true,
                  message: "All notification details fetched",
                  data: notidetails,
                  usercount: noticount
                });
              }
            });
        }
      });
  },



 getuserrequestlist: (pagenum, tokendata, callback) => {
  //console.log(tokendata);
    var page = 1;
    var limit = 10;
    var sort_field = 'createdAt';
    var order = '-1';

    page = pagenum;

    Request
      .find({user_id: mongoose.Types.ObjectId(tokendata.id)})
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
            .count({user_id: mongoose.Types.ObjectId(tokendata.id)})
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

 bookAssessment:(Data,callback) => { 

    console.log("bookAssessment",Data);
 
      async.waterfall([
          (nextcb) => {
            if(Data.requiredService == undefined || Data.requiredService == '') {
                callback({success: false,message: "Required Service name required."});
            }else if(Data.request_id == undefined || Data.request_id == '') {
                callback({success: false,message: "Request Id required."});
            }else if(Data.booking_by_user == undefined || Data.booking_by_user == '') {
                callback({success: false,message: "Requested by user's id required."});            
            }else {              
                nextcb(null);
            }
          },                
          (nextcb) => {  

            if(Data.requiredService == "Medication Reminder"){

             console.log( typeof Data.medicationTime); 
             
              Data.medicationTime = JSON.parse(Data.medicationTime);
               console.log(Data.medicationTime); 
                console.log( typeof Data.medicationTime); 
                Data.medication_status = 0 ; //means ongoing   
            
            } 


            if(Data.requiredService != "Medication Reminder"){
                let startdateTime = Data.serviceDate +" "+ Data.serviceTime;
                console.log("startdateTime", startdateTime);
                Data.serviceTime = new Date(startdateTime).getTime(); 
                console.log("serviceTime ", Data.serviceTime);

                //=============================================================  

                let a = new Date(startdateTime);
                let duration = parseInt(Data.duration)*60*60*1000;               
                a.setTime(a.getTime()+ duration);
                // Data.seviceEndTime = a;               
                Data.seviceEndTime = a.getTime();
                console.log("seviceEndTime",Data.seviceEndTime);
            }          

            var bookassessment = new Booking(Data);
            bookassessment.save((err,response) => {
              if (err) {
                console.log("err", err);
                nextcb(err);
              } else { 
               console.log(response);              
                Request.update({
                  _id: Data.request_id                 
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
                        var mailOptions = {
                          //from: '"Care Now">', // sender address
                          from: '"Care Now" <avijit.team@gmail.com>',
                          to: 'hielsservices@gmail.com', // list of receivers
                         // to: 'uzra.brainium@gmail.com',
                          subject: 'Booking Added !!', // Subject line
                          html: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body bgcolor="#ededed"><table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ededed" ><tr><td><table width="60%" border="0" cellspacing="0" cellpadding="0" bgcolor="#FFF" align="center" style="border-radius:10px; border:1px solid #ededed; box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.25); margin: auto;"><tr><td valign="top" align="center" style="padding: 15px"><img src="' + siteurl + 'assets/imgs/logo.png" width="100px" height="120px" alt="Carenow logo" title="Care Now logo" border=0;/></td><tr><td valign="top" style="padding: 40px;" height="200">Hello Admin,<br><br>A booking for "'+Data.requiredService+'" with request Id '+Data.request_id+' has been successfully done by a user. Please assign a helper if needed.<br><br> Thank you<br><br>Team Care Now</td></tr><tr><td style="padding: 15px" align="center" bgcolor="#FFF"><p style="font:normal 12px Arial, Helvetica, sans-serif;"></p></td></tr></table></td></tr></table></body></html>'
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
                });                         
              }
            });
          }
      ],
      (err) => {
          if(err){
            callback({success: false,message: "Some internal error has occurred",err: err});
          } else {
              if(Data.requiredService != "Medication Reminder"){
                callback({success: true,message: "Booking done. Mail will be sent to you when admin assigns a helper"});
              }else{
                callback({success: true,message: "Booking done. Notification will be sent to you for medication"});
              }
          }
      });
  },

 getuserbookinglist: (pagenum, tokendata,callback) => {
  //console.log("getuserbookinglist",tokendata);
    var page = 1;
    var limit = 10;
    var sort_field = 'createdAt';
    var order = '-1';

    page = pagenum;

    Booking
     // .find({booking_by_user: mongoose.Types.ObjectId(tokendata.id)}) 
    .find({$and : [
                { booking_by_user: mongoose.Types.ObjectId(tokendata.id) },
                { booking_status: { $not: { $eq: 5 } } }
            ]}) 
      .populate('helper_assign')
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
          .count({$and : [
                { booking_by_user: mongoose.Types.ObjectId(tokendata.id) },
                { booking_status: { $not: { $eq: 5 } } }
            ]})
          //.count({booking_by_user: "5cf51396eb803613086d5e74"})
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
                  message: "All booking details fetched",
                  data: bookingdetails,
                  usercount: bookingcount
                });
              }
            });
        }
      });
  },

  getHelperDetails: (userData, callback) => {
    Helper
      .find({ _id: userData.helper_id}
      , (err, helperdetails) => {
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
            message: "Helper details fetched",
            data: helperdetails            
          });
        }
     });
  },

  getbookingdetails: (userData, callback) => {
    Booking
      .find({ _id: userData.booking_id})
      .populate('helper_assign','firstname lastname profile_img rate_points')
      // , (err, bookingdetails) => {
      .exec(function (err, bookingdetails) {
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
  getuserpastbookinglist: (pagenum, tokendata,callback) => {
  //console.log("getuserbookinglist",tokendata);
    var page = 1;
    var limit = 10;
    var sort_field = 'createdAt';
    var order = '-1';

    page = pagenum;

    Booking
     // .find({booking_by_user: tokendata.id}) 
      .find({
          $and : [
            { booking_by_user: mongoose.Types.ObjectId(tokendata.id) },
            { booking_status: 5 }
        ]
      })    
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
         // .count({booking_by_user: tokendata.id})
         .count({
              $and : [
                { booking_by_user: mongoose.Types.ObjectId(tokendata.id) },
                { booking_status: 3 }
            ]
          })
         
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
                  message: "All booking details fetched",
                  data: bookingdetails,
                  usercount: bookingcount
                });
              }
            });
        }
      });
  },

  saveChatMessage: (chatData,callback) => { 
    console.log("saveChatMessage",chatData);
 
      async.waterfall([
          // (nextcb) => {
          //   if(chatData.message == undefined || chatData.message == '') {
          //       callback({success: false,message: "Message required."});
          //   }else if(chatData.receiver_id == undefined || chatData.receiver_id == '') {
          //       callback({success: false,message: "Receiver Id required."});
          //   }else if(chatData.sender_id == undefined || chatData.sender_id == '') {
          //       callback({success: false,message: "Sender Id required."});          //  
          //   }else if(chatData.booking_id == undefined || chatData.booking_id == '') {
          //       callback({success: false,message: "Booking Id required."});
          //   }else {              
          //       nextcb(null);
          //   }
          // }, 
          (nextcb) =>{
              if(chatData.type == "image"){
                var base64Data = chatData.message;
                // Regular expression for image type:
                // This regular image extracts the "jpeg" from "image/jpeg"
                var imageTypeRegularExpression      = /\/(.*?)$/;
                var imageBuffer                      = decodeBase64Image(base64Data);
                console.log("imageBuffer = ",imageBuffer);
                var userUploadedFeedMessagesLocation = 'assets/chatImages/';
                var uniqueRandomImageName            = 'chat-' + Date.now();
                var imageTypeDetected                = imageBuffer.type.match(imageTypeRegularExpression); 
                console.log("imageTypeDetected: ",imageTypeDetected); 
                var userUploadedImagePath= userUploadedFeedMessagesLocation + uniqueRandomImageName + '.' + imageTypeDetected[1];
                var imageName =  uniqueRandomImageName + '.' + imageTypeDetected[1];
                chatData.message = imageName;
                   // Save decoded binary image to disk
                  try{
                    fs.writeFile(userUploadedImagePath, imageBuffer.data,function(){
                    console.log('Image saved on path:', userUploadedImagePath);
                    nextcb(null);
                    });
                  }catch(error){
                      console.log('ERROR:', error);
                      nextcb(err);
                  }
              } else{
                nextcb(null);
              }
           }, 
          (nextcb) =>{
           User.findOne({ _id:  mongoose.Types.ObjectId(chatData.receiver_id)})
          .select({ "devicetoken": 1})
           .exec((err,data) =>{
            
            if(err){
              console.log(err);
            }else{
               if(data != null){
                // console.log(data.devicetoken);
                 // devicetoken = data.devicetoken;
                 // chatData.receiver_type = "User";
                    Helper.findOne({ _id: mongoose.Types.ObjectId(chatData.sender_id)})
                     .select({ "firstname": 1, "profile_img": 1,"_id": 0})
                     .exec((err,helperdata)=>{
                      if(err){
                      console.log(err);
                      }else{
                       // console.log(data.devicetoken);
                        devicetoken = data.devicetoken;
                        chatData.receiver_type = "User";
                        chatData.sender_name = helperdata.firstname;
                        chatData.sender_image = helperdata.profile_img;
                        nextcb(null,devicetoken);
                      }
                    })
                
               }else{
                Helper.findOne({ _id: mongoose.Types.ObjectId(chatData.receiver_id)})
               .select({ "devicetoken": 1})
               .exec((err,data)=>{
                if(err){
                console.log(err);
                }else{
                 // console.log(data.devicetoken);
                  // devicetoken = data.devicetoken;
                  // chatData.receiver_type = "Helper";
                    User.findOne({ _id: mongoose.Types.ObjectId(chatData.sender_id)})
                   .select({ "firstname": 1, "profile_img": 1,"_id": 0})
                   .exec((err,userdata)=>{
                    if(err){
                    console.log(err);
                    }else{
                     // console.log(data.devicetoken);
                      devicetoken = data.devicetoken;
                      chatData.receiver_type = "Helper";
                      chatData.sender_name = userdata.firstname;
                      chatData.sender_image = userdata.profile_img;
                      nextcb(null,devicetoken);
                    }
                  })                 
                }
              })
             }
            }
           })
          },       
          (devicetoken,nextcb) => {
            var chat = new Chat(chatData);
            chat.save((err) => {
              if (err) {                
                nextcb(err);
              } else {                
                nextcb(null);
                NotificationService.ChatMessage(chatData,devicetoken);          
              }
            });
          }
      ],
      (err) => {
          if(err){
            console.log("chat err ",err);
            // callback({success: false,message: "Some internal error has occurred",err: err});
          } else {
            console.log("Chat inserted");    
            if(chatData.type == "image"){
              callback({
                message : chatData.message
              })
              // return (chatData.message);
            }        
            //callback({success: true,message: "Chat inserted"});
          }
      });
  },

  saveChatImage : (file,callback) =>{
    console.log("saveChatImages",file);
    async.waterfall([
       (nextcb) =>{
       var base64Data = file.message;
         var imageBuffer                      = decodeBase64Image(base64Data);
         var userUploadedImageLoc = 'assets/chatimages/';
         var uniqueRandomImageName            = 'chat-' + Date.now();
           var imageTypeDetected                = imageBuffer.type.match(imageTypeRegularExpression); 
           console.log("imageTypeDetected: ",imageTypeDetected); 
            var userUploadedImagePath= userUploadedFeedMessagesLocation + uniqueRandomImageName + '.' + imageTypeDetected[1];
            var imageName =  uniqueRandomImageName + '.' + imageTypeDetected[1];
            file.message = imageName;
             // Save decoded binary image to disk
              try{
                fs.writeFile(userUploadedImagePath, imageBuffer.data,function(){
                console.log('Image saved on path:', userUploadedImagePath);
                });
              }catch(error){
                  console.log('ERROR:', error);
              }
       },
       (nextcb) =>{
       // save image in 
          var chat = new Chat(file);
            chat.save((err) => {
              if (err) {                
                nextcb(err);
              } else {                
                nextcb(null);
                NotificationService.ChatMessage(chatData,devicetoken);          
              }
            });

       }
      ],(err) =>{


      });
    //           var base64Data = item;
    //           var imageBuffer                      = decodeBase64Image(base64Data);
    //           //var userUploadedFeedMessagesLocation = '../img/upload/feed/';
    //           var userUploadedFeedMessagesLocation = 'public/logo/';
    //           //var uniqueRandomImageName            = 'image-' + uniqueSHA1String;
    //           var uniqueRandomImageName            = 'job-' + Date.now();
    //           // This variable is actually an array which has 5 values,
    //           // The [1] value is the real image extension
    //           var imageTypeDetected                = imageBuffer.type.match(imageTypeRegularExpression);    
    //         var userUploadedImagePath= userUploadedFeedMessagesLocation + uniqueRandomImageName + '.' + imageTypeDetected[1];
    //         //storing image name in array
    //         photoname[index1] = uniqueRandomImageName + '.' + imageTypeDetected[1];
    //           // Save decoded binary image to disk
    //           try{
    //             fs.writeFile(userUploadedImagePath, imageBuffer.data,function(){
    //             console.log('Image saved on path:', userUploadedImagePath);
    //             });
    //           }catch(error){
    //               console.log('ERROR:', error);
    //           }
  },

  fetchMessages : (data,callback) =>{
    console.log("data",data);
    Chat    
   .find({
      $or : [ {
        $and : [
           { booking_id: mongoose.Types.ObjectId(data.booking_id) },
           { receiver_id: data.to },
           { sender_id: data.from }
        ]
      },
       {
         $and : [
           { booking_id: mongoose.Types.ObjectId(data.booking_id) },
           { receiver_id: data.from },
           { sender_id: data.to }
         ]
       }             
      ]
    })
   
      .exec((err, messageData) => {
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {
          callback({
            success: true,
            message: "All booking details fetched",
            data: messageData            
          });
        }
      });
    },

  saveReview:(Data,callback) =>{
 // console.log("saveReview",Data);
   async.waterfall([
    (nextcb) => {
      if(Data.rate_points == undefined || Data.points == '') {
          callback({success: false,message: "Please rate the helper."});
      } else if(Data.rating_to == undefined || Data.rating_to == '') {
          callback({success: false,message: "Rating to whom required."});
      } else if(Data.booking_id == undefined || Data.booking_id == '') {
          callback({success: false,message: "Booking id required."}); 
      } else if(Data.rate_note == undefined || Data.rate_note == '') {
          callback({success: false,message: "Please provide description."});
      } else if(Data.rating_from == undefined || Data.rating_from == '') {
          callback({success: false,message: "Rating from whom required."});
      } else {
        nextcb(null);
      }
    },
      (nextcb)=>{
        Booking.updateOne({
          _id: Data.booking_id
        },{
          rate_by_customer: true
        }).exec((err) =>{
           if (err) {
            nextcb(err);
          } else {
            nextcb(null);
          }
        });          
      },      
       (nextcb)=>{          
           var review = new Reviews(Data);
          review.save((err) => {
            if (err) {                
              nextcb(err);
            } else {                
              nextcb(null);                      
            }
          });          
        },
          (nextcb)=>{         
            Reviews.aggregate([
                { 
                    $match : {rating_to : mongoose.Types.ObjectId(Data.rating_to)}
                },
                { 
                    $group : { 
                         _id : "$rating_to", 
                         avgRating: { $avg: "$rate_points" }
                    }
                }
           ]).exec((err,result) =>{
              console.log(result);               
              if (err) {                
                nextcb(err);
              } else {                
                nextcb(null,result);                      
              }
            });
          },
          (result,nextcb) =>{
             Helper.update(
              { _id: Data.rating_to },
               {
                rate_points: result[0].avgRating.toFixed(1)
               }
             ).exec((err)=>{
                if (err) {                
                  nextcb(err);
                } else {                
                  nextcb(null);                      
                }
             })
          },
    ],
    (err) => {
        if (err) { 
          callback({success: false,message: "Some internal error has occurred",err: err});
        } else {
          callback({success: true,message: "Review saved successfully"});
        }
    });  
  },

  cronJobFormedication: () =>{
    
     var currentTime = new Date().toTimeString();
     console.log(currentTime);    
     var dt = new Date();
         dt.setMinutes( dt.getMinutes() + 5 );
     currentTimePlusFive = new Date(dt).toTimeString();
     console.log(currentTimePlusFive);

      Booking.find({
          $and : [           
                  { requiredService: { $eq: "Medication Reminder" } },                
                  // { medication_status: { $exists: false } },  // was not working with elemMatch
                 // { medication_status: { $eq: 0 } },  no need of extra field
                  { booking_status: { $eq: 0 } },
                  { medicationTime: { $elemMatch: {$gte: currentTime,$lte: currentTimePlusFive }}},                   
                 ]
          },{medicationTime:{$elemMatch: {$gte: currentTime,$lte: currentTimePlusFive}}, request_id:1})
          .populate("booking_by_user")
          .exec((err,response) =>{
            // console.log("response",response);
             if(err){
               console.log("err",err);
             }else{
                if(response.length != 0){
                  forEach(response, function(value, index, arr) {  
                   // console.log("value",value.medicationTime[0]);
                     NotificationService.MedicationReminder(value); 
                       // callback({
                       //    data: response             
                       //  })           
                  });
                                   
                } 
             }
          })
  },

  cronJobForAppointment: () =>{
    
     var currentTime = new Date().toISOString();
     console.log(currentTime);    
     var dt = new Date();
         dt.setMinutes( dt.getMinutes() + 30 );
     currentTimePlusFive = new Date(dt).toISOString();
     console.log(currentTimePlusFive);

      Booking.find({
          $and : [           
                    { requiredService: { $eq: "Appointment Reminder" } },  
                    { booking_status: { $eq: 0 } },  //means not yet notification sent.just booked.
                   {
                    $and: [
                            { serviceTime: {$gte: currentTime}},
                            { serviceTime: {$lte: currentTimePlusFive}},
                    ]
                   }                 
                 ]
          },{serviceTime:1, request_id:1})
          .populate("booking_by_user")
          .exec((err,response) =>{
             console.log("response",response);
             if(err){
               console.log("err",err);
             }else{
               if(response.length != 0){
                  forEach(response, function(value, index, arr) {  
                   // console.log("value",value.medicationTime[0]);
                   Booking.updateOne({
                    _id: value._id
                   },{
                    booking_status:5 //finished
                   }).exec((err) =>{
                      if(err){
                        console.log(err);
                      }else{
                        console.log("Appointment updated");
                      }
                   })
                     NotificationService.AppointmentReminder(value);                               
                  });
                                   
                } 
             }
          })
  },

  stopMedicationReminder:(bookingData,callback) =>{
    console.log(bookingData);
    Booking.updateOne({
      _id: bookingData.booking_id
    },{
        booking_status: 5
    }).exec((err) =>{
        if(err){
           callback({
            status: false,
            message: "Some internal error has occurred",
            err: err
          });
        }else{          
          callback({
            success: true,
            message: "Medication Reminder stop"            
          });
        }
     })
  },

  getPersonDetails: (userData,tokendata, callback) => {
    console.log("userData",userData);
    Request
      //.find({ $and :[{name: userData.name},{salutation: '/^'+userData.salutation+'$/i'}]} 
    .find({name: userData.name}
      , (err, requestdetails) => {
        console.log("requestdetails",requestdetails);
        if (err) {
          callback({
            success: false,
            message: "Some internal error has occurred",
            err: err
          });
        } else {          
          callback({
            success: true,
            message: "Person details fetched",
            data: requestdetails            
          });
        }
     });
  },

  showAdvertisement:(tokenData,callback) =>{   

      var query = Advertisement.find({}).select('ad_image');
        query.exec(function (err, adImages) {
        if (err){
          callback({
            status: false,
            message: "Some internal error has occurred",
            err: err
          });
        }else{
          callback({
            success: true,
            message: "Advertisement data fetched",
            data: adImages
          });
        }        
    });
  },

  getcategorydata: (callback) => {
    Category.find({ block: false }, (err, categorydetails) => {
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
          data: categorydetails
        });
      }
    });
  },

  getallcouponlist: (callback) => {
    var sort_field = 'createdAt';
    var order = '-1';
    console.log('coupon list hittt');
    Coupons
      .find({})
      .lean()
      .sort([
        [sort_field, order]
      ])
      .exec((err, coupondetails) => {
       console.log(coupondetails);
        asyncLoop(coupondetails, function (itm, next) {
          if (itm != '' || itm != undefined) {
                  Reviews.aggregate()
                  .match({coupon_id: mongoose.Types.ObjectId(itm._id)})
                  .group({_id: null,"average": { $avg: "$rating" }})
                  .exec((err, avgrate) => {
                    if (err) {
                      callback({
                        success: false,
                        message: "Some internal error has occurred",
                        err: err
                      });
                    } else {
                      
                      if(avgrate==""){
                        //console.log('hiii');
                        itm['avgvalue'] = 0;
                      }
                      else{
                        //console.log('hello');
                        itm['avgvalue'] = avgrate[0].average;
                       
                      }
                      
                      console.log(JSON.stringify(avgrate));
                     // nextcb(null, coupondetails, reviewdetails, avgrate);
                    }
                    next();
                  });

          } else {
              callback({ success: true, err: err,  message: 'item is not available' })
          }
      }, function () {
        callback({
          success: true,
          message: "Coupon data fetched",
          data: coupondetails,
        });
      });


        // if (err) {
        //   callback({
        //     success: false,
        //     message: "Some internal error has occurred",
        //     err: err
        //   });
        // } else {
        //   callback({
        //     success: true,
        //     message: "Coupon data fetched",
        //     data: coupondetails,
        //   });
        // }
      });
  },

  getfiltercouponlist: (coupondata, callback) => {
      async.waterfall([
        (nextcb) => {
          //console.log(coupondata.coupon_id);
          Coupons.findOne({ _id: coupondata.coupon_id })
          .lean()
          .exec((err, coupondetails) => {
            if (err) {
              callback({
                success: false,
                message: "Some internal error has occurred",
                err: err
              });
            } else {
              nextcb(null, coupondetails);
            }
          });
        },
        (coupondetails,nextcb) => {
          //registerData.emailOTP = emailOTP;
          Reviews.find({coupon_id: coupondata.coupon_id})
          .populate('user_id','firstname lastname')
          .lean()
          .exec((err, reviewdetails) => {
            if (err) {
              callback({
                success: false,
                message: "Some internal error has occurred",
                err: err
              });
            } else {
             // console.log(reviewdetails);
              nextcb(null, coupondetails, reviewdetails);
            }
          });
        },
        (coupondetails,reviewdetails,nextcb) => {
          Reviews.aggregate()
          .match({coupon_id: mongoose.Types.ObjectId(coupondata.coupon_id)})
          .group({_id: null,"average": { $avg: "$rating" }})
          .exec((err, avgrate) => {
            if (err) {
              callback({
                success: false,
                message: "Some internal error has occurred",
                err: err
              });
            } else {
              //console.log(JSON.stringify(avgrate));
              nextcb(null, coupondetails, reviewdetails, avgrate);
            }
          });

        },
      ], (nextcb, coupondetails, reviewdetails, avgrate) => {
          callback({
               success: true,
               message: "Filter coupon details fetched",
               data: coupondetails,
               reviewdata:reviewdetails,
               avg:avgrate
          });
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

  savereviewdata: (reviewdata, callback)=>{
    console.log(reviewdata);
    async.waterfall([
      (nextcb) => {
        if (reviewdata.review_title == undefined || reviewdata.review_title.trim() == '') {
          callback({
            status: false,
            message: "Please enter title!"
          });
        } else if (reviewdata.review_description.trim() == undefined || reviewdata.review_description.trim() == '') {
          callback({
            status: false,
            message: "Please enter Description!"
          });
        } else if (reviewdata.rating == 0) {
          callback({
            status: false,
            message: "Please select rating!"
          });
        } else {
          nextcb(null);
        }
      },
      (nextcb) => {
        //registerData.emailOTP = emailOTP;
  //console.log(reviewdata);
        var review = new Reviews(reviewdata);
        review.save((err) => {
          if (err) {
            nextcb(err);
          } else {
            nextcb(null, review);
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
          message: "Review has submitted successfuly!"
        });
      }
    });
  },

  // get all review data of the coupon

  getAllReviewListByCoupon: (reviewdata, callback) => {
    Reviews.find({coupon_id: reviewdata.coupon_id })
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
            message: "Filter coupon details fetched",
            data: coupondetails
          });
        }
      });
  },

  // get all coupon list by category id

  getallcouponlistByCatId: (coupondata, callback) => {
    var sort_field = 'createdAt';
    var order = '-1';
    console.log('coupon list hittt');
    Coupons
      .find({category_id: mongoose.Types.ObjectId(coupondata.catid)})
      .lean()
      .sort([
        [sort_field, order]
      ])
      .exec((err, coupondetails) => {
       console.log(coupondetails);
       if(coupondetails.length>0){
        asyncLoop(coupondetails, function (itm, next) {
          if (itm != '' || itm != undefined) {
                  Reviews.aggregate()
                  .match({coupon_id: mongoose.Types.ObjectId(itm._id)})
                  .group({_id: null,"average": { $avg: "$rating" }})
                  .exec((err, avgrate) => {
                    if (err) {
                      callback({
                        success: false,
                        message: "Some internal error has occurred",
                        err: err
                      });
                    } else {
                      
                      if(avgrate==""){
                        //console.log('hiii');
                        itm['avgvalue'] = 0;
                      }
                      else{
                        //console.log('hello');
                        itm['avgvalue'] = avgrate[0].average;
                       
                      }
                      
                      console.log(JSON.stringify(avgrate));
                     // nextcb(null, coupondetails, reviewdetails, avgrate);
                    }
                    next();
                  });

          } else {
              callback({ success: true, err: err,  message: 'item is not available' })
          }
      }, function () {
        callback({
          success: true,
          message: "Coupon data fetched",
          data: coupondetails,
        });
      });


        // if (err) {
        //   callback({
        //     success: false,
        //     message: "Some internal error has occurred",
        //     err: err
        //   });
        // } else {
        //   callback({
        //     success: true,
        //     message: "Coupon data fetched",
        //     data: coupondetails,
        //   });
        // }
         }
         else{
          callback({
            success: true,
            message: "No coupon data found!",
            data: [],
          });
         }
      });
  },

};
module.exports = userService;
