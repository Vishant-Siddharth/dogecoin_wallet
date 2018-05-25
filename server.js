var express = require('express');
var DogeCoin = new require('./dogecoin_wallet.js');
var port = process.env.PORT || 5000;
var host = process.env.HOST || "0.0.0.0";
var api_key = process.env.DOGECOIN_MAIN_KEY || '2b5b-0dff-6e47-c216';
var pass = process.env.DOGECOIN_MAIN_PASS || 'vectorvishant3731';

var mongoose = require('mongoose');
var Label = require('./lastLabel');
var AddInfo = require('./addressInformation');
var db = 'mongodb://localhost/mydb';

mongoose.connect(db);

const app = express();
const dogecoin = new DogeCoin({api_key:api_key, pass:pass, version:2});


app.get('/', function(req, res){
   res.json({status: "success", message: "Welcome to Dogecoin wallet"});
});


app.get('/create-address', (req, res)=>{
    function send_json(err, data)
    {
        console.lo
        console.log("data: ", data);
        if(err)
        {
            res.json({status: "ghjkljherror", message: err.message});
        }
        var arr = data.split("-");
        let add = arr[0];
        let userId = arr[1];
        let lab = arr[2];

        console.log("add: ", add, " user_id: ", userId, " lab: ", lab);

        Label.findOneAndUpdate(
            {
                "label":lab
            },
            {
                $set:
                    {
                        "label":Number(lab)+1
                    }
            },
            {
                upsert:true
            },
            function(err, updateLabel){
                if(err){
                    res.send('error updating');
                } else {
                    console.log("lable updated: ", updateLabel);
//                    res.send(updateLabel);
                }
            }
        );

        var newAdd = new AddInfo();
        newAdd.label = lab;
        newAdd.user_id = userId;
        newAdd.address = add;
        newAdd.save(function(err, info){
            if(err){
                res.send('error in saving');
            }
            else{
                console.log("information saved: ", info);
//                res.send({status: "success", id: user_id, address: add, label: lab});
            }
        });
        res.json({status: "success", id: userId, address: add, label: lab});
    }

    Label.findOne()
        .exec(function(err, labels){
            if(err){
                res.send('error has been occured');
//                res.json(status:"error", message:err);
            }
            else{
                console.log("labels: ",labels);
                dogecoin.generate_address(labels.label, send_json);
            }
        });
});


app.get('/get-address-using-label/:label', (req, res)=>{
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

app.get('/get-availabel-balance/:add', (req, res)=>{
    function send_json(err, data)
    {
        if(err)
        {
            res.json({status:"error", message: err.message});
        }
        res.json({status: "success", availabel_balance: data});
    }
    dogecoin.get_availabel_balance(req.params.add, send_json);
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