
var config = require("./config");
var request = require('request');

var NotificationService = {

	ApproveRequestNotification: function (userdetails,requestData){
		console.log("userdetails",userdetails);
		 console.log("requestData",requestData);
	 //    console.log("jobdetails",jobdetails);

		var pushConfig = config.FCM;   
		console.log("FCM",pushConfig);

		//var device_token = result.device_token;
		var device_token = userdetails.devicetoken;
		console.log("device_token",device_token);

		if(device_token != null){   

		request.post({
		uri: pushConfig.requestUrl,
		headers: {
		"Authorization": "key=" + pushConfig.apiKey,
		"Content-Type": "application/json"
		},
		body: {        //data which will be seen in notification
		"notification":{

		"title": 'Care Request Approved',					
		"message": 'Congratulations! Your request have been approved by admin.',
		"sound": "brass",
		"icon": "fcm_push_icon",
		"color": "#91be00",
		"click_action":"FCM_PLUGIN_ACTIVITY"
		},

		"data":{   //data which you want to save in pushnotification

		//"page_name":"ChatPage",
		"title": 'Care Request Approved',	
		"message": 'Congratulations! Your request have been approved by admin.',
		"action": 'RequestApprove',
	    "receiver_id":userdetails._id,
		"sender_id":requestData.admin_id,	
		"request_id":requestData.request_id,
		"sender_type":"admin",
		"receiver_type": "customer",
		// "alert_title":'Chat request from '+result2.username.toLowerCase(),
		// "alert_content": result2.username+' wants to chat with you.',
		// "receiver_id":sender_id,
		// "noti_id":sl._id
		},
		"to": device_token,
		"priority":"high",
		},

		json: true
		}, function (err, response, body) {            
				if (err) {
				console.log(err);
				} else {
				console.log(body);
				}
			});
		}
    },

    DeclineRequestNotification: function (userdetails,requestData){
		console.log("userdetails",userdetails);
		 console.log("requestData",requestData);
	 //    console.log("jobdetails",jobdetails);

		var pushConfig = config.FCM;   
		console.log("FCM",pushConfig);

		//var device_token = result.device_token;
		var device_token = userdetails.devicetoken;
		console.log("device_token",device_token);

		if(device_token != null){   

		request.post({
		uri: pushConfig.requestUrl,
		headers: {
		"Authorization": "key=" + pushConfig.apiKey,
		"Content-Type": "application/json"
		},
		body: {        //data which will be seen in notification
		"notification":{

		"title": 'Care Request Not Approved',					
		"message": 'Sorry! Your request have not been approved by admin.',
		"sound": "brass",
		"icon": "fcm_push_icon",
		"color": "#91be00",
		"click_action":"FCM_PLUGIN_ACTIVITY"
		},

		"data":{   //data which you want to save in pushnotification

		//"page_name":"ChatPage",
		"title": 'Care Request Not Approved',	
		"message": 'Sorry! Your request have not been approved by admin.',
		"action": 'RequestUnapprove',
	    "receiver_id":userdetails._id,
		"sender_id":requestData.admin_id,	
		"request_id":requestData.request_id,
		"sender_type":"admin",
		"receiver_type": "customer",
		// "alert_title":'Chat request from '+result2.username.toLowerCase(),
		// "alert_content": result2.username+' wants to chat with you.',
		// "receiver_id":sender_id,
		// "noti_id":sl._id
		},
		"to": device_token,
		"priority":"high",
		},

		json: true
		}, function (err, response, body) {            
				if (err) {
				console.log(err);
				} else {
				console.log(body);
				}
			});
		}
    },

    AssignHelperNotification: function (helperdetails,helperData){
		console.log("helperdetails",helperdetails);
		 console.log("requestData",helperData);
	 //    console.log("jobdetails",jobdetails);

		var pushConfig = config.FCM_helper;   
		console.log("FCM",pushConfig);

		//var device_token = result.device_token;
		var device_token = helperdetails.devicetoken;
		console.log("device_token",device_token);

		if(device_token != null){   

		request.post({
		uri: pushConfig.requestUrl,
		headers: {
		"Authorization": "key=" + pushConfig.apiKey,
		"Content-Type": "application/json"
		},
		body: {        //data which will be seen in notification
		"notification":{

		"title": 'Care Request Assigned',					
		"message": 'You have been assigned for a booking. Please check your mail.',
		"sound": "brass",
		"icon": "fcm_push_icon",
		"color": "#91be00",
		"click_action":"FCM_PLUGIN_ACTIVITY"
		},

		"data":{   //data which you want to save in pushnotification

		//"page_name":"ChatPage",
		"title": 'Care Request Assigned',	
		"message": 'You have been assigned for a booking. Please check your mail.',
		"action": 'HelperAssignByAdmin',
	    "receiver_id":helperdetails._id,
		"sender_id":helperData.admin_id,	
		"request_id":helperData.request_id,
		"sender_type":"admin",
		"receiver_type": "helper",
		"booking_id": helperData.booking_id
		// "alert_title":'Chat request from '+result2.username.toLowerCase(),
		// "alert_content": result2.username+' wants to chat with you.',
		// "receiver_id":sender_id,
		// "noti_id":sl._id
		},
		"to": device_token,
		"priority":"high",
		},

		json: true
		}, function (err, response, body) {            
				if (err) {
				console.log(err);
				} else {
				console.log(body);
				}
			});
		}
    },

    AcceptBookingByHelper: function (helperdetails,bookingData){
		// console.log("userdetails",userdetails);
		//  console.log("requestData",requestData);
	 //    console.log("jobdetails",jobdetails);

		var pushConfig = config.FCM;   
		console.log("FCM",pushConfig);

		//var device_token = result.device_token;
		var device_token = bookingData.booking_by_user.devicetoken;
		console.log("device_token",device_token);

		if(device_token != null){   

		request.post({
		uri: pushConfig.requestUrl,
		headers: {
		"Authorization": "key=" + pushConfig.apiKey,
		"Content-Type": "application/json"
		},
		body: {        //data which will be seen in notification
		"notification":{

		"title": 'Helper Assigned',					
		"message": 'A helper has been assigned for your booking by admin.',
		"sound": "brass",
		"icon": "fcm_push_icon",
		"color": "#91be00",
		"click_action":"FCM_PLUGIN_ACTIVITY"
		},

		"data":{   //data which you want to save in pushnotification

		//"page_name":"ChatPage",
		"title": 'Helper Assigned',	
		"message": 'A helper has been assigned for your booking by admin.',
		"action": 'HelperAcceptation',
	    "receiver_id":bookingData.booking_by_user,
		"sender_id":helperdetails.id,	
		"request_id":bookingData.request_id,
		"sender_type":"helper",
		"receiver_type": "customer",
		"booking_id": bookingData._id
		// "alert_title":'Chat request from '+result2.username.toLowerCase(),
		// "alert_content": result2.username+' wants to chat with you.',
		// "receiver_id":sender_id,
		// "noti_id":sl._id
		},
		"to": device_token,
		"priority":"high",
		},

		json: true
		}, function (err, response, body) {            
				if (err) {
				console.log(err);
				} else {
				console.log(body);
				}
			});
		}
    },
    
    ChatMessage: function (chatData,devicetoken){
		 console.log("chatData",chatData);
		//  console.log("requestData",requestData);
	 //    console.log("jobdetails",jobdetails);
		if(chatData.receiver_type == "User"){
			var pushConfig = config.FCM;   
			console.log("FCM",pushConfig);
		}else if(chatData.receiver_type == "Helper"){
            var pushConfig = config.FCM_helper;   
		    console.log("FCM",pushConfig);
		}

		//var device_token = result.device_token;		
		var device_token = devicetoken;
		console.log("device_token",device_token);
		

		if(device_token != null){   

		request.post({
		uri: pushConfig.requestUrl,
		headers: {
		"Authorization": "key=" + pushConfig.apiKey,
		"Content-Type": "application/json"
		},
		body: {        //data which will be seen in notification
		"notification":{

		"title": 'Message from ' + chatData.sender_name,					
		//"message": chatData.message,		
		"sound": "brass",
		"icon": "fcm_push_icon",
		"color": "#91be00",
		"click_action":"FCM_PLUGIN_ACTIVITY"
		},

		"data":{   //data which you want to save in pushnotification
		"title": 'Chat Message',	
		//"message": chatData.message,
		"action": 'Chat',
		"sender_name": chatData.sender_name,      //chatting with 
		"sender_image":  chatData.sender_image,    
		"to": chatData.sender_id,
		"booking_id":  chatData.booking_id,
	 //    "sender_name":chatData.booking_by_user,
		// "sender_id":helperdetails.id,	
		// "request_id":bookingData.request_id,
		// "sender_type":"helper",
		// "receiver_type": "customer",
		// "booking_id": bookingData._id		
		},

		"to": device_token,
		"priority":"high",
		},

		json: true
		}, function (err, response, body) {            
				if (err) {
				console.log(err);
				} else {
				console.log(body);
				}
			});
		}
    },


	MedicationReminder: function (medicationDetails){
		console.log("medicationDetails",medicationDetails.medicationTime[0]);	

		var pushConfig = config.FCM;   
		console.log("FCM",pushConfig);
		
		var device_token = medicationDetails.booking_by_user.devicetoken;
		console.log("device_token",device_token);

		if(device_token != null){   

		request.post({
		uri: pushConfig.requestUrl,
		headers: {
		"Authorization": "key=" + pushConfig.apiKey,
		"Content-Type": "application/json"
		},
		body: {        //data which will be seen in notification
		"notification":{

		"title": 'Medication Reminder',					
		"message": 'Please have your medicine at ' +"medicationDetails.medicationTime[0]"+ '.',
		"sound": "brass",
		"icon": "fcm_push_icon",
		"color": "#91be00",
		"click_action":"FCM_PLUGIN_ACTIVITY"
		},

		"data":{   //data which you want to save in pushnotification

		//"page_name":"ChatPage",
		"title": 'Medication Reminder',	
		"message": 'Please have your medicine at ' +medicationDetails.medicationTime[0]+ '.',
		"action": 'MedicationReminder',
	    "receiver_id":medicationDetails.booking_by_user._id,
		"sender_id":"FromApp",	
		"request_id":medicationDetails.request_id,
		"sender_type":"admin",
		"receiver_type": "customer",
		// "alert_title":'Chat request from '+result2.username.toLowerCase(),
		// "alert_content": result2.username+' wants to chat with you.',
		// "receiver_id":sender_id,
		// "noti_id":sl._id
		},
		"to": device_token,
		"priority":"high",
		},

		json: true
		}, function (err, response, body) {            
				if (err) {
				console.log(err);
				} else {
				console.log(body);
				}
			});
		}
    },


	AppointmentReminder: function (medicationDetails){
		//console.log("medicationDetails",medicationDetails.serviceTime);	

		var pushConfig = config.FCM;   
		console.log("FCM",pushConfig);
		
		var device_token = medicationDetails.booking_by_user.devicetoken;
		console.log("device_token",device_token);

		var date = new Date(medicationDetails.serviceTime).toDateString();
		console.log("date",date);
		var timeHr = new Date(medicationDetails.serviceTime).getHours();
	    var timeMins = new Date(medicationDetails.serviceTime).getMinutes();
	    var time = timeHr +":"+ timeMins;
		console.log("time",time);

		if(device_token != null){   

		request.post({
		uri: pushConfig.requestUrl,
		headers: {
		"Authorization": "key=" + pushConfig.apiKey,
		"Content-Type": "application/json"
		},
		body: {        //data which will be seen in notification
		"notification":{

		"title": 'Appointment Reminder',					
		"message": 'You have an appointment on ' +date+ ' at ' +time+ '.',
		"sound": "brass",
		"icon": "fcm_push_icon",
		"color": "#91be00",
		"click_action":"FCM_PLUGIN_ACTIVITY"
		},

		"data":{   //data which you want to save in pushnotification

		//"page_name":"ChatPage",
		"title": 'Appointment Reminder',	
		"message": 'You have an appointment on ' +date+ ' at ' +time+ '.',
		"action": 'AppointmentReminder',
	    "receiver_id":medicationDetails.booking_by_user._id,
		"sender_id":"FromApp",	
		"request_id":medicationDetails.request_id,
		"sender_type":"admin",
		"receiver_type": "customer",		
		},
		"to": device_token,
		"priority":"high",
		},

		json: true
		}, function (err, response, body) {            
				if (err) {
				console.log(err);
				} else {
				console.log(body);
				}
			});
		}
    },


 //==========================================================================================================


    DeclineJobNotification: function (jobmateData,bossmateData,jobdetails){
		// console.log("jobmateData",jobmateData.id);
		// console.log("bossmateData",bossmateData.id);
		// console.log("jobdetails",jobdetails);
	
		var pushConfig = config.FCM;   
		console.log("FCM",pushConfig);

		//var device_token = result.device_token;
		var device_token = jobmateData.auth_token;

		if(device_token != null){   

		request.post({
		uri: pushConfig.requestUrl,
		headers: {
		"Authorization": "key=" + pushConfig.apiKey,
		"Content-Type": "application/json"
		},
		body: {
		"notification":{

		"title": 'Application Declined',					
		"message": 'Sorry! You have not been selected for "'+jobdetails.title+'".Detailed mailed at '+jobmateData.email,
		"sound": "brass",
		"icon": "fcm_push_icon",
		"color": "#91be00",
		"click_action":"FCM_PLUGIN_ACTIVITY"
		},

		"data":{

		//"page_name":"ChatPage",
		"title": 'Application Declined',	
		"message": 'Sorry! You have not been selected for "'+jobdetails.title+'".Detailed mailed at '+jobmateData.email,
        "action": 'JobDecline',
	    "receiver_id":jobmateData.id,
		"sender_id":bossmateData.id,
		"job_id":jobdetails.id,
		// "alert_title":'Chat request from '+result2.username.toLowerCase(),
		// "alert_content": result2.username+' wants to chat with you.',		
		// "noti_id":sl._id
		},
		"to": device_token,
		"priority":"high",
		},

		json: true
		}, function (err, response, body) {            
				if (err) {
				console.log(err);
				} else {
				console.log(body);
				}
			});
		}
    },

FinalApproveJobNotification: function (jobmateData,bossmateData,jobdetails){
		console.log(" FinalApproveJobNotificationjobmateData",jobmateData.id);
		console.log("bossmateData",bossmateData.id);
	    console.log("jobdetails",jobdetails);

		var pushConfig = config.FCM;   
		console.log("FCM",pushConfig);

		//var device_token = result.device_token;
		var device_token = jobmateData.auth_token;

		if(device_token != null){   

		request.post({
		uri: pushConfig.requestUrl,
		headers: {
		"Authorization": "key=" + pushConfig.apiKey,
		"Content-Type": "application/json"
		},
		body: {        //data which will be seen in notification
		"notification":{

		"title": 'Application Selected',					
		"message": 'Congratulations! You have been selected for "'+jobdetails.title+'".Detailed mailed at '+jobmateData.email,
		"sound": "brass",
		"icon": "fcm_push_icon",
		"color": "#91be00",
		"click_action":"FCM_PLUGIN_ACTIVITY"
		},

		"data":{   //data which you want to save in pushnotification

		//"page_name":"ChatPage",
		"title": 'Application Selected',	
		"message": 'Congratulations! You have been selected for "'+jobdetails.title+'".Detailed mailed at '+jobmateData.email,
		"action": 'JobSelection',
	    "receiver_id":jobmateData.id,
		"sender_id":bossmateData.id,	
		"job_id":jobdetails.id,
		// "alert_title":'Chat request from '+result2.username.toLowerCase(),
		// "alert_content": result2.username+' wants to chat with you.',
		// "receiver_id":sender_id,
		// "noti_id":sl._id
		},
		"to": device_token,
		"priority":"high",
		},

		json: true
		}, function (err, response, body) {            
				if (err) {
				console.log(err);
				} else {
				console.log(body);
				}
			});
		}
    },
    
    LocTrackNotification: function (jobmateData,bossmateData,jobdetails){
		console.log(" LocTrackNotification",jobmateData.id);
		console.log("bossmateData",bossmateData.id);
	    console.log("jobdetails",jobdetails);

		var pushConfig = config.FCM;   
		console.log("FCM",pushConfig);

		//var device_token = result.device_token;
		var device_token = bossmateData.auth_token;

		if(device_token != null){   

		request.post({
		uri: pushConfig.requestUrl,
		headers: {
		"Authorization": "key=" + pushConfig.apiKey,
		"Content-Type": "application/json"
		},
		body: {        //data which will be seen in notification
		"notification":{

		"title": 'Track Job',					
		"message": 'The applicant "'+jobmateData.first_name+'" is heading towards "'+jobdetails.title+'" location.',
		"sound": "brass",
		"icon": "fcm_push_icon",
		"color": "#91be00",
		"click_action":"FCM_PLUGIN_ACTIVITY"
		},

		"data":{   //data which you want to save in pushnotification

		//"page_name":"ChatPage",
		"title": 'Track Job',	
		"message": 'The applicant "'+jobmateData.first_name+'" is heading towards "'+jobdetails.title+'" location.',
		"action": 'TrackJob',
	    "receiver_id":bossmateData.id,
		"sender_id":jobmateData.id,	
		"job_id":jobdetails.id,
		// "alert_title":'Chat request from '+result2.username.toLowerCase(),
		// "alert_content": result2.username+' wants to chat with you.',
		// "receiver_id":sender_id,
		// "noti_id":sl._id
		},
		"to": device_token,
		"priority":"high",
		},

		json: true
		}, function (err, response, body) {            
				if (err) {
				console.log(err);
				} else {
				console.log(body);
				}
			});
		}
    },

	JobMatchingNotification: function (job_title,userDetails){
      console.log(" JobMatchingNotification",job_title);
		console.log("sentto",userDetails.sentto_id);
		console.log(userDetails.auth_token);
	   

		var pushConfig = config.FCM;   
		console.log("FCM",pushConfig);
		
		var device_token = userDetails.auth_token;

		if(device_token != null){   

		request.post({
		uri: pushConfig.requestUrl,
		headers: {
		"Authorization": "key=" + pushConfig.apiKey,
		"Content-Type": "application/json"
		},
		body: {        //data which will be seen in notification
		"notification":{

		"title": 'Job Matching Found!',					
		"message": 'A new job -"'+job_title+'" matching your job search has been posted.',
		"sound": "brass",
		"icon": "fcm_push_icon",
		"color": "#91be00",
		"click_action":"FCM_PLUGIN_ACTIVITY"
		},

		"data":{   //data which you want to save in pushnotification

		//"page_name":"ChatPage",
		"title": 'Job Matching',	
		"message": 'A new job -"'+job_title+'" matching your job search has been posted.',
		"action": 'JobMatching',
	    "receiver_id":userDetails.sentto_id,
		"sender_id":"By Admin",	
		"job_id": ""		
		// "alert_title":'Chat request from '+result2.username.toLowerCase(),
		// "alert_content": result2.username+' wants to chat with you.',		
		},
		"to": device_token,
		"priority":"high",
		},

		json: true
		}, function (err, response, body) {            
				if (err) {
				console.log(err);
				} else {
				console.log(body);
				}
			});
		}
	},

 }
module.exports = NotificationService;