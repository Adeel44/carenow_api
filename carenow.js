let express = require('express');
let fileUpload = require('express-fileupload');
let mongoose = require('mongoose');
let bodyparser = require('body-parser');
let path = require('path');
let methodOverride = require('method-override');
let _ = require('lodash');

let config = require("./config");

//========================Create the application======================
let app = express();

// app.use (function (req, res, next) {
//         if (req.secure) {
//             console.log("secure");
//                 // request was via https, so do no special handling
//                 next();
//         } else {
//              console.log("not secure");
//                 // request was via http, so redirect to https
//                 res.redirect('https://' + req.headers.host + req.url);
//         }
// });

//==========Add module to receive file from angular to node===========
app.use(fileUpload());

app.use('/assets', express.static(path.join(__dirname, 'assets')));

//==============Add middleware necessary for REST API's===============

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(methodOverride('X-HTTP-Method-Override'));

//===========================CORS support==============================
app.use((req, res, next) => {
    req.setEncoding('utf8');
    // Website you wish to allow to connect
    res.setHeader("Access-Control-Allow-Origin", "*");
    //res.setHeader("Access-Control-Allow-Origin", "http://localhost:4200/#/");

    // Request methods you wish to allow
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");

    // Request headers you wish to allow
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    if ('OPTIONS' == req.method) {
        res.sendStatus(200);
    } else {
        next();
    }
});

//=========================Load the routes===============================

let userRoutes = require('./routes/userRoutes.js')(app, express);
app.use('/user', userRoutes);

let adminRoutes = require('./routes/adminRoutes.js')(app, express);
app.use('/admin', adminRoutes);

let helperRoutes = require('./routes/helperRoutes.js')(app, express);
app.use('/helper', helperRoutes);

let userRoute = require('./routes/user');
app.use('/api/users', userRoute);

//===========================Connect to MongoDB==========================

mongoose.connect(config.database,
    // {
        // auth: {
        //     user: config.username,
        //     password: config.password,
        // }
    // },
    (err) => {
        if (err) {
            console.log("MongoDB Error", err);
        } else {
            console.log("Connected to the Mongo database");
        }
    });


    
//===========================Socket====================================  by uzra
    // var UserService = require('./services/userservice.js');
    var userService = require('./services/userService.js');
    var adminService = require('./services/adminService.js');

    var http = require('http').Server(app);
    var io = require('socket.io')(http);


    io.on('connection', (socket) => {

        console.log("socket connection");

        // var socketList = io.sockets.server.eio.clients;
        // console.log("ss",socketList.Socket.id);    
        //console.log('socket=',socket);

        socket.on('disconnect', function () {
            io.emit('users-changed', { to:socket.to, from: socket.from,user: socket.booking_id, event: 'left' });
        });

        socket.on('set-nickname', (req) => {  
        console.log('set-nickname=',req);
            socket.booking_id = req.booking_id;
            socket.to = req.to;
            socket.from = req.from;
            io.emit('users-changed', { user: req.booking_id, event: 'joined',to:req.to,from:req.from });
        });
        

        socket.on('add-message', (message) => {
            // console.log("add-message",message);
            //  console.log("add-socket.booking_id",socket.booking_id);
            //   console.log("add-message",socket.to);
            //    console.log("add-message",socket.from);
          
           let messageBody = {
             type: "text",
             message: message.text,
             booking_id:socket.booking_id,
             receiver_id:socket.to, 
             sender_id: socket.from,
             createdAt: new Date() 
           };
           let messageToSave = {
                type: "text",
                message: message.text,
                booking_id:socket.booking_id, //this is booking_id
                receiver_id:socket.to, 
                sender_id: socket.from,
           };
           io.emit('message', messageBody);
           userService.saveChatMessage(messageToSave);
        
        });

        socket.on('add-image', (message) => {
            //console.log("add-image",message.image);
             // console.log("add-socket.booking_id",socket.booking_id);
             //  console.log("add-image",socket.to);
             //   console.log("add-image",socket.from);   
         let messageToSave = {
            type: "image",
            message: message.image,
            booking_id:socket.booking_id, //this is booking_id
            receiver_id:socket.to, 
            sender_id: socket.from,
           }; 
          // message.image = userService.saveChatMessage(messageToSave);
          userService.saveChatMessage(messageToSave,function(data){
            console.log("data",data);
            message.image = data.message;
            console.log("message",message.image); 
            if(data.message == message.image) {      
          
         console.log("message2",message.image); 
          
               let messageBody = {
                 type: "image",
                 message: message.image,
                 booking_id:socket.booking_id,
                 receiver_id:socket.to, 
                 sender_id: socket.from,
                 createdAt: new Date() 
               };
               console.log("messageBody = ",messageBody);
              
               io.emit('message', messageBody);
               }
             });        
        });
 // =============================Admin Socket==========================================================
       
        socket.on('set-nickname', (req) => {  
        console.log('set-nickname=',req);
            //socket.booking_id = req.booking_id;
           // socket.to = req.to;
            socket.from = req.from;
            io.emit('users-changed', { event: 'joined',from:req.from });
        });

        socket.on('sendlocation', (req) => {  
        console.log('location=',req);
            // socket.booking_id = req.booking_id;
            // socket.to = req.to;
            // socket.from = req.from;
             io.emit('getlocation', { helper_id: req.helper_id,lat: req.lat,lng:req.lng });
        });

        socket.on('set-chat', (req) => {  
        console.log('set-chat=',req);
            socket.booking_id = req.booking_id;
            socket.to = req.to;
            socket.from = req.from;
            io.emit('users-changed', { user: req.booking_id, event: 'joined',to:req.to,from:req.from });
           // io.emit('users-changed', { event: 'joined',from:req.from });
        });

        socket.on('admin-add-message', (message) => {
            console.log("add-message",message);
            console.log("add-socket.booking_id",socket.booking_id);
            console.log("add-message",socket.to);
            console.log("add-message",socket.from);
          
           let messageBody = {
             type: "text",
             message: message.text,
             booking_id:socket.booking_id,
             receiver_id:socket.to, 
             sender_id: socket.from,
             createdAt: new Date() 
           };
           let messageToSave = {
                type: "text",
                message: message.text,
                booking_id:socket.booking_id, //this is booking_id
                receiver_id:socket.to, 
                sender_id: socket.from,
           };
           io.emit('admin-message', messageBody);
           adminService.saveAdminChatMessage(messageToSave);
        
        });

        
    });  // socket connect

    var port = process.env.PORT || 2206;
    http.listen(port, function(){
        console.log('socket listening in http://localhost:' + port);
     });

//===========================Connect to port=============================

app.set('port', config.port);

app.listen(app.get('port'), (err) => {
    if (err) {
        throw err;
    }
    else {
        console.log("Server is running at " + config.__site_url);
    }
});
