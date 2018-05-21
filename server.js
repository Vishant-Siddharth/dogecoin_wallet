var express = require('express');
var DogeCoin = new require('./dogecoin_wallet.js');
var port = process.env.PORT || 5000;
var host = process.env.HOST || "0.0.0.0";

const app = express();
const dogecoin = new DogeCoin({api_key:'b270-9972-3478-2fa8', pass:'vishant3731', version:2});


app.get('/', function(req, res){
   res.json({status: "success", message: "Welcome to Dogecoin wallet"});
});


app.get('/create-address/:label', (req, res)=>{
    function send_json(err, data){
        if(err){
            res.json({status: "error", message: err.message});
        }
        res.json({status: "success", address: data, label: req.params.label});
    }
    dogecoin.generate_address(req.params.label, send_json);
});


app.get('/get-label/:label', (req, res)=>{
    function send_json(err, data){
        if(err){
            res.json({status: "error", message: err.message});
        }
        res.json({status: "success", address: data, label: req.params.label});
    }
    dogecoin.get_address_by_label(req.params.label, send_json);
});

var server = require('http').createServer(app);


server.listen(port, host, (err, data) => {
    if(err){
        console.error(err);
    }
    console.log('Server listening at http://%s:%d', host, port);
});