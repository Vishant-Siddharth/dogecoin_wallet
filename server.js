var express = require('express');
var DogeCoin = new require('./dogecoin_wallet.js');
var port = process.env.PORT || 5000;
var host = process.env.HOST || "0.0.0.0";
var api_key = process.env.DOGECOIN_MAIN_KEY || '*******************';
var pass = process.env.DOGECOIN_MAIN_PASS || '#####################';

const app = express();
const dogecoin = new DogeCoin({api_key:api_key, pass:pass, version:2});


app.get('/', function(req, res){
   res.json({status: "success", message: "Welcome to Dogecoin wallet"});
});


app.get('/create-address/:label', (req, res)=>{
    function send_json(err, data)
    {
        if(err)
        {
            res.json({status: "error", message: err.message});
        }
        var arr = data.split("-");
        let add = arr[0];
        let user_id = arr[1];
        res.json({status: "success",id: user_id, address: add, label: req.params.label});
    }
    dogecoin.generate_address(req.params.label, send_json);
});


app.get('/get-address-using-lable/:label', (req, res)=>{
    function send_json(err, data)
    {
        if(err)
        {
            res.json({status: "error", message: err.message});
        }
        res.json({status: "success", address: data, label: req.params.label});
    }
    dogecoin.get_address_by_label(req.params.label, send_json);
});

app.get('/get-available-balance/:add', (req, res)=>{
    function send_json(err, data)
    {
        if(err)
        {
            res.json({status:"error", message: err.message});
        }
        res.json({status: "success", available_balance: data});
    }
    dogecoin.get_available_balance(req.params.add, send_json);
});

app.get('/get-pending-balance/:add', (req, res)=>{
    function send_json(err, data)
    {
        if(err)
        {
            res.json({status:"error", message: err.message});
        }
        res.json({status: "success", pending_received_balance: data});
    }
    dogecoin.pending_received_balance(req.params.add, send_json);
});

app.get('/withdrawl-balance/:amount/:to_addresses', (req, res)=>{
    function send_json(err, data)
    {
        if(err)
        {
            res.json({status:"error", message: err.message});
        }
        res.json({status: "success", txid: data});
    }
    console.log(req.params)
    dogecoin.withdrawl_balance(req.params, send_json);
});

app.get('/transaction/:txid', (req, res)=>{
    function send_json(err, data)
    {
        if(err)
        {
            res.json({status:"error", message: err.message});
        }
        res.json({status: "success", confirmations: data});
    }
    dogecoin.get_transaction_details(req.params.txid, send_json);
});


var server = require('http').createServer(app);

server.listen(port, host, (err, data) => {
    if(err){
        console.error(err);
    }
    console.log('Server listening at http://%s:%d', host, port);
});