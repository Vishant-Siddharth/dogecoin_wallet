var express = require('express');
var DogeCoin = new require('./dogecoin_wallet.js');


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


app.listen(5000, "0.0.0.0", (err, data) =>
    {
        if(err){
        console.error(err);
        }
        else{
        console.log('Server is up...');
        }
    }
);