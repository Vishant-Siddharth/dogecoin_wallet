var Label_ = require('./models/Label_model');
var AddInfo_model = require('./models/AddInfo_model');
var Confirmation_model = require('./models/Confirmation_model');

var express = require('express');
const app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var tx_hashes = [];
var map_for_hash = {};

var mongoose = require('mongoose');
var db = 'mongodb://localhost/mydb';
mongoose.connect(db);

const dogecoin = require('./api_controler').dogecoin;
const api_controller = require('./api_controler');

var config = require('./config');
var incoming_payment_handler = require('./handlers').incoming_payment_handler;
// var register_all = require('./handlers').register_all;

app.get('/', api_controller.home);
app.get('/create-address', api_controller.create_address);
app.get('/get-address-using-label/:label', api_controller.get_address_using_label);
app.get('/get-availabel-balance/:add', api_controller.get_availabel_balance);
app.get('/get-pending-balance/:add', api_controller.get_pending_balance);
app.post('/withdrawl', api_controller.withdrawl);
app.get('/transaction/:txid', api_controller.transaction);

var server = require('http').createServer(app);

server.listen(config.port, config.host, (err, data) => {
    if(err){
        console.error(err);
    }
    console.log('Server listening at http://%s:%d', config.host, config.port);
});


/////////////////////////////////////////////////////////////////////////////////////////////


var Websocket = require('ws');
var server = new Websocket("wss://ws.dogechain.info/inv");

server.on('open', () => {
    server.send(JSON.stringify({"op":"unconfirmed_sub"}), ()=>{
        console.log("Connected to the server");
    });
    server.send(JSON.stringify({"op":"blocks_sub"}), ()=>{
        console.log("Connected to the server");
    });
});

function common_hash(arr1, arr2, callback) { // return common hash between our hashs and curr block's hashs
    var ret = [];
    arr1.sort();
    arr2.sort();
    for(var i = 0; i < arr1.length; i += 1) {
        if(arr2.indexOf(arr1[i]) > -1){
            ret.push(arr1[i]);
        }
    }
    if (callback){callback(null, ret)}
    return ret;
};

function update_conf_to_fullyConfirm(tx_hash)
{
    dogecoin.get_transaction_details(tx_hash, function send_json(err, block_height)
    {
        if(err)
        {
            console.log("error while changing confirmd to fully confirmed , err.message: ", err.message);
        }
        else
        {
            if(block_height!=null && block_height>=30)
            {
                console.log("block_height:", block_height);
                Confirmation_model.update_status_fully_confirmed(tx_hash);
                Confirmation_model.find_addresses(tx_hash, function callback(error, addr)
                {
                    if(error)
                    {
                        console.log("error:", error);
                    }
                    else
                    {
                        for(var j = 0; j<addr.length; j++)
                        {
                            var add = addr[j];
                            dogecoin.get_availabel_balance(addr[j],function send_json_data(err, bal)
                            {
                                if(err)
                                {
                                    console.log("error while geting balance related to a address, err: ", err);
                                }
                                else
                                {
                                    AddInfo_model.update_balance(add, bal);
                                }
                            });
                        }
                    }
                });
            }
        }
    });  
}

server.on('message', function(msg){
    data = JSON.parse(msg);
    if (data.op == "utx"){
        // console.log("event utx has come");
        t = data.x.outputs; // all addresses those are unconformed with balance
        var addresses = [];
        for (i in t)
        {
            addresses.push(t[i].addr); // all addresses those are unconfirm
        }
        function callback(err, adds){ // all of common addresses of db and utx
            if(err)
            {
                console.log("error in callback, err: ", err);
            }
            else if(adds.length>0)
            {
                incoming_payment_handler(data); // send deposite event from here;
                Confirmation_model.insert_into_db({"hash":data.x.hash, "status":"unconfirmed", "add":adds})
            }
        }
        AddInfo_model.find_address(addresses, callback);
    }

    else if(data.op == "block")
    {
        // console.log("block has been created");
        var tx_hashes = [];
        var confirmed_hash = [];
        var find_tx_hashes = () => 
        {
            return new Promise(function(resolve, reject){
                function callback(err, hashes)
                {
                    if(err)
                    {
                        console.log('error in callback: ', err);
                        reject(err);
                    }
                    else
                    {
                        console.log("tx_hashes: ", tx_hashes);
                        resolve(hashes);;
                    }
                }
                Confirmation_model.find_hashes(callback);
            });
        }

        var find_confirmed_hash = () =>
        {
            return new Promise(function(resolve, reject)
            {
                find_tx_hashes().
                then((tx_hashes)=>{
                    if(tx_hashes.length>0)
                    {
                        console.log("2");
                        console.log("data.x.txs: ", data.x.txs);
                        console.log("tx_hashes: ", tx_hashes);
                        if(data.x.txs != undefined && tx_hashes != undefined)
                            common_hash( data.x.txs, tx_hashes, (err, confirmed_hash) => {if(err){console.log(err);reject(err);} else{resolve(confirmed_hash);}});
                    }    
                })
                .catch((err)=>{
                    console.log("2");
                    console.log("error in 2, err: ", err);
                    reject(err);
                });        
            });
        }
                
        find_confirmed_hash().
            then((confirmed_hash)=>
            {
                if(confirmed_hash.length>0)
                {
                    console.log("3");
                    console.log("hashes>>>>>>>>>>>>>>>>: ", confirmed_hash);
                    Confirmation_model.update_status_confirmed(confirmed_hash);
                }
            })
            .catch((err)=>{
                console.log("error in find_confirmed_hash(), err: ", err);
            });

        function callback_function(err, hashes)
        {
            if(err)
            {
                console.log("error: ", err);
            }
            else
            {
                for(i in hashes)
                {
                    update_conf_to_fullyConfirm(hashes[i]);
                }
            }
        }
        Confirmation_model.find_confirmed_hashs(callback_function);
    }

    else{
        if (data.op == "status"){
            console.log(data.msg);
        }
    }
});


server.on('error', function(res){
    console.log(res);
});


module.exports.update_conf_to_fullyConfirm = update_conf_to_fullyConfirm;





// balance:{2,2,2,2,2,2}
// to_addresses:["ACFURXN4D4rsT34dL5LK4wtSrk8M6py31z", "AFbGi6e54T7aSR4SqxhPzJtpuw7ukqATB3", "9xYy7asUi5UooMMtYMzwDyKjt64UJJKps9","A4yydwdZRkq3eQLBTnLkKPUmpNfscf6HH1", "9ySDmEZ78wNbDAaQ238BjvECd8fGWHpoNG", "9uy4GZE1fwS3mCfba7bsCeCpRYaw2v6PZv"]
// from_addresses:{ "9xiGjuimbHJVF7wzcuYVMAzZbJpGSAkCNA" }