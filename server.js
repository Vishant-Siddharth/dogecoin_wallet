var express = require('express');
var DogeCoin = new require('./dogecoin_wallet.js');
var port = process.env.PORT || 5000;
var host = process.env.HOST || "0.0.0.0";
var api_key = process.env.DOGECOIN_MAIN_KEY || '2b5b-0dff-6e47-c216';
var pass = process.env.DOGECOIN_MAIN_PASS || 'vectorvishant3731';

var mongoose = require('mongoose');
var Label = require('./lastLabel');
var AddInfo = require('./addressInformation');
var Confirmation = require('./confirmations');
var db = 'mongodb://localhost/mydb';

var change_add = "ADEVmbAr1WjvzBarkWyk5cpghcG7LUDcK9"; //label:test_1, user_id:1;

var bodyParser = require('body-parser');

var tx_hashes = [];
var map_for_hash = {};

mongoose.connect(db);

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
const dogecoin = new DogeCoin({api_key:api_key, pass:pass, version:2});


app.get('/', function(req, res){
   res.json({status: "success", message: "Welcome to Dogecoin wallet"});
});


app.get('/create-address', (req, res)=>
{
    function send_json(err, data)
    {
        console.log("data: ", data);
        if(err)
        {
            res.json({status: "ghjkljherror", message: err.message});
        }
        var arr = data.split("-");
        let add = arr[0];
        let userId = arr[1];
        let lab = arr[2];

        console.log("add: ", add, "user_id: ", userId, "lab: ", lab);

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
        newAdd.balance = 0;
        newAdd.save(function(err, info){
            if(err){
                res.send('error in saving');
            }
            else{
                console.log("information saved: ", info);
                addresses.push(add);
                console.log("newly generate_address: ", add);
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

app.post('/withdrawl', (req,res)=> {
    
    var from_addresses = [];
    var sum_actual = 0;
    
    function send_json(err, data)
    {
        if(err)
        {
            res.json({status:'error', message: err.message});
        }
        else
        {
            AddInfo.update({"address":{$in:from_addresses}}, {$set:{'balance':0}})
            .exec(function(err, re){
                if(err)
                {
                    console.log("error while updating from_addresses balances, err: ", err);
                }
                else
                {
                    console.log("successfully updated from_addresses balance, res: ", re);
                }
            });
            res.json({status:"success", txid: data});
        }
    }
    console.log(req.body);
    let sum_need = 0;
    let am = req.body.amount;
    for(let i = 0; i< am.length ; i++)
    {
        sum_need += am[i];
    }
    
    sum_need += 1;
    console.log("sum_need ", sum_need);

    var get_sum_actual = ()=>{

        return new Promise(function(resolve, reject)
        {
            AddInfo.find().sort({balance:-1})
            .exec(function(err, add_info){
                if(err)
                {
                    reject(err);
                }
                else
                {
                    for(var i = 0 ; i < add_info.length ; i++){
                        if (sum_actual >= sum_need)
                            break;
                        else
                        {
                            console.log(add_info[i].balance);
                            sum_actual += add_info[i].balance;
                            from_addresses.push(add_info[i].address); 
                        }
                    }
                    resolve(sum_actual);
                }
            });
        });
            
    }

    get_sum_actual()
    .then( (sum_actual) =>{
        if (sum_need>sum_actual)
        {
            console.log("sum_actual ", sum_actual, " sum_need" , sum_need);
            res.json({status:'error', message: 'balance is not sufficient'});
        }

        else
        {
            if(sum_need < sum_actual)
            {
                req.body.to_addresses.push(change_add);
                req.body.amount.push(sum_actual - sum_need);
                let params = { from_addresses:from_addresses.join(), amount:req.body.amount.join(), to_addresses:req.body.to_addresses.join()};
                console.log(params);
                dogecoin.withdrawl_balance(params, send_json);
            }
            else
            {
                let params = { from_addresses:from_addresses.join(), amount:req.body.amount.join(), to_addresses:req.body.to_addresses.join()};
                console.log(params);
                dogecoin.withdrawl_balance(params, send_json);
            }
        }
    })
    .catch( (err)=>{
        console.log("error while try to get sum in get_sum_actual");
    });
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

function update_conf_to_fullyConfirm(tx_hash){
    function send_json(err, block_height)
    {
        if(err)
        {
            console.log("error while changing confirmd to fully confirmed , err.message: ", err.message);
        }
        else
        {
            if(block_height!=null && block_height>=30)
            {
                Confirmation.update({"hash":tx_hash},{$set:{"status":'fully_confirmed'}})
                .exec(function(err, res){
                    if(err)
                    {
                        console.log("error while updating status from confirmed to fully_confirmed, err: ", err);
                    }
                    else
                    {
                        console.log("res: ", res);
                    }
                });

                Confirmation.find({"hash":tx_hash}, {'add':1,'_id':0})
                .exec(function(err, addr){
                    if(err)
                    {
                        console.log('error when finding add, err: ', err);
                    }
                    else
                    {
                        for(j in addr.add)
                        {
                            function send_json_data(err, bal)
                            {
                                if(err)
                                {
                                    console.log("error while geting balance related to a address, err: ", err);
                                }
                                else
                                {
                                    AddInfo.update({"address":addr.add[j]}, {$set:{"balance":bal}})
                                    .exec(function(err, r){
                                        if(err)
                                        {
                                            console.log("err when updating the balance, err: ", err);
                                        }
                                        else
                                        {
                                            console.log("successfully updated r: ", r);
                                        }
                                    });
                                }
                            }
                            dogecoin.get_availabel_balance(addr.add[j], send_json_data);
                        }
                    }
                });
            }
        }
    }   
    dogecoin.get_transaction_details(tx_hash, send_json);
}

server.on('message', function(msg){
    data = JSON.parse(msg);
    
    if (data.op == "utx"){
        t = data.x.outputs; // all addresses those are unconformed with balance
        var addresses = [];
        for (i in t)
        {
            addresses.push(t[i].addr); // all addresses those are unconfirm
        }

        AddInfo.find({address:{$in: addresses } }, {"address":1, "_id":0})
        .exec(function(err, info){
            if(err)
            {
                console.log('error in address filltration ');
            }
            else if(info.length>0) // info has all of our those addresses, those are related to that hash
            {
                var add = info.map(x => x.address);
                var addNew = new Confirmation();
                addNew.hash = data.x.hash;
                addNew.status = 'unconfirmed';
                addNew.add = add;
                addNew.save(function( err, info ){
                    if(err)
                    {
                        console.log('error while push in confirmation in db');
                    }
                    else
                    {
                        console.log('saved ', info);
                    }
                });
            }
        });
    }

    else if(data.op == "block"){
        console.log("block has been created");
        var tx_hashes = [];
        var confirmed_hash = [];
        
        var find_tx_hashes = () => 
        {
            return new Promise(function(resolve, reject){
                Confirmation.find({}, {"hash":1, '_id':0})
                .exec(function(err, hashes){
                    console.log("1");
                    if(err)
                    {
                        console.log('error while searching in Confirmation block, err: ', err);
                        reject(err);
                    }
                    else
                    {
                        tx_hashes = hashes.map(x => x.hash); // all transaction hash we have in Confirmation
                        console.log("tx_hashes: ", tx_hashes);
                        resolve(tx_hashes);
                    }
                });
            });
        }

        var find_confirmed_hash = () =>
        {
            return new Promise(function(resolve, reject){
                find_tx_hashes().
                    then((tx_hashes)=>{
                        if(tx_hashes.length>0)
                        {
                            console.log("2");
                            console.log("data.x.txs: ", data.x.txs);
                            console.log("tx_hashes: ", tx_hashes);
                            if(data.x.txs == undefined && tx_hashes == undefined)
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
            then((confirmed_hash)=>{
                if(confirmed_hash.length>0)
                {
                    console.log("3");
                    console.log("hashes>>>>>>>>>>>>>>>>: ", confirmed_hash);
                    Confirmation.update({ hash:{$in:confirmed_hash} }, {$set:{'status':'confirmed'}}, {multi:true}) //confirmed all confirmed_hashes
                    .exec(function(err, info){
                        if(err)
                            console.log('error when change the status from unconfirmed to Connected, error: ', err);
                        else
                        {
                            console.log('updated successfully, info ', info);
                        }
                    });
                }
            })
            .catch((err)=>{
                console.log("error in find_confirmed_hash(), err: ", err);
            });


        Confirmation.find({status:"confirmed"}, {"hash":1, "_id":0})
        .exec(function(err, txHashes){
            console.log("4");
            if(err)
            {
                console.log('error while finding all confirmed transactions');
            }
            else
            {
                txHashes = txHashes.map(x => x.hash); //all confirmed
                console.log("txHashes: ", txHashes);
                for(i in txHashes)
                {
                    // console.log("coming into loop");
                    update_conf_to_fullyConfirm(txHashes[i]);
                }
            }
        });
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


module.exports = common_hash;




// balance:{2,2,2,2,2,2}
// to_addresses:["ACFURXN4D4rsT34dL5LK4wtSrk8M6py31z", "AFbGi6e54T7aSR4SqxhPzJtpuw7ukqATB3", "9xYy7asUi5UooMMtYMzwDyKjt64UJJKps9","A4yydwdZRkq3eQLBTnLkKPUmpNfscf6HH1", "9ySDmEZ78wNbDAaQ238BjvECd8fGWHpoNG", "9uy4GZE1fwS3mCfba7bsCeCpRYaw2v6PZv"]
// from_addresses:{ "9xiGjuimbHJVF7wzcuYVMAzZbJpGSAkCNA" }