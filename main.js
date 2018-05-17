//var http = require('http');
//
//http.createServer(
//    function (request, response){
//        response.writeHead(200, {'context-type':'text/plain'});
//        response.end('hello world\n');
//    }).listen(8081);
//var t=0;
//do{
//    t++;
//    console.log('t: ',t);
//}while(t<5);
//console.log("Server running at server https://127.0.0.1:8081/");

//var http = require('requests')
//
//var op={
//    host:'api-sandbox.oanda.com',
//    port:80,
//    path:'/v1/quote?instruments=USD_ZAR',
//    method:'GET'
//    };
//
//http.request(op, function(res){
//    var body = '';
//    res.on('data', function(chunk){
//        body+=chunk;
//        });
//    }).end();
//
//var request = require('request');
//request('https://api.huobi.pro/market/detail/merged?symbol=ethusdt', function (error, response, body) {
//  console.log('error:', error); // Print the error if one occurred
//  console.log('statusCode:', response); // Print the response status code if a response was received
////  console.log('body:', body ); // Print the HTML for the Google homepage.
////  var jsonObject = JSON.parse(body);
////  console.log('status: ', jsonObject)
//});
//
//var request = require('request');
//request('https://api.huobi.pro/market/detail/merged?symbol=ethusdt', function (error, response, body) {
//  console.log('error:', error);
//  console.log('statusCode:', response);
//});
//
//var request = require('request');
//var = request.get('https://api.huobi.pro/market/detail/merged?symbol=ethusdt')

//var BlockIo = require('block_io');
//var version = 2; // API version
//var block_io = new BlockIo('b270-9972-3478-2fa8', 'vectorvishant3731', version);
//
//var val = block_io.get_new_address({'label': 'add6'}, console.log);
//
//console.log('val: ', val);

var BlockIo = require('block_io');
var version = 2;
data = {};
function response(err, res){data = res;}
var block_io = new BlockIo('b270-9972-3478-2fa8', 'vishant3731', version);
block_io.get_new_address({'label': 'add24'}, console.log);
//console.log(data.data['address']);