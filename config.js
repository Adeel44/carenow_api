module.exports = {
  
  "database" : "mongodb://localhost:27017/CareNowApp?authSource=admin",
 
    // "username" : 'xxxxxxx',
 
    // "password" :'xxxxxxxx',
	"port" : process.env.PORT || 2205,
	"secretKey" : "hyrgqwjdfbw4534efqrwer2q38945765",
	dev_mode : true,
    __root_dir: __dirname,   
	__site_url: 'http://nodeserver.brainiuminfotech.com:2205/',
    //__baseurl: 'http://localhost:4200/#/'
    
  //  __baseurl: 'http://nodeserver.brainiuminfotech.com/pinki/carenow/'
    _baseUrl: 'http://nodeserver.brainiuminfotech.com:2205/'
,

 FCM: {
            requestUrl: 'https://fcm.googleapis.com/fcm/send',
            apiKey: 'AIzaSyBhQ33jxW5tj5TiGbA8iMO2oVopS8d_6bw'     //this is the server legacy key of your project.       
         },

 FCM_helper: {
            requestUrl: 'https://fcm.googleapis.com/fcm/send',
            apiKey: 'AAAAZDG5jIs:APA91bFXlQQo-xe5k_hCRuSJ1zmq1anhhHuO3QtIeVH1cRReVINCjeJLU5TB4CaV8DM2-6ncrBc7CVwMSyM-RpX5ZumUaEPXHm0GYDE-afvd9UqaeS8HDVplLD_uI85Wo04CBD-OqgqH'     //this is the server key of your project.       
         }

}
