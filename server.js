var express = require('express');
var DogeCoin = new require('./dogecoin_wallet.js');
var port = process.env.PORT || 5000;
var host = process.env.HOST || "0.0.0.0";
var api_key = process.env.DOGECOIN_MAIN_KEY || '1bbe-4b1c-591d-af62';
var pass = process.env.DOGECOIN_MAIN_PASS || 'buyucoin123';

var mongoose = require('mongoose');
var Label = require('./lastLabel');
var AddInfo = require('./addressInformation');
var Confirmation = require('./confirmations');
var db = 'mongodb://localhost/mydb';

var change_add = "ACgGLSLpsdW42hQs2bz3WfbnCQs2toqTfi"; //label:test_1, user_id:1;

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

app.get('/create-address', api_controler.create_address);

app.get('/create-address', (req, res)=>
{
    function callback_function(error ,label)
    {
        if(error)
        {
            res.json({status:"error", message:error});
        }
        else
        {
            function send_json(err, data)
            {
                if(err)
                {
                    res.json({status: "error while generate_address", message: err.message});
                }
                Label_model.inc_by_one();
                var arr = data.split("-");
                AddInfo_model.insert_into_db({'label':arr[2], 'user_id':arr[1], 'address':arr[0], 'balance':0});
                res.json({status: "success", id: userId, address: add, label: lab});
            }
            dogecoin.generate_address(label, send_json);
        }
    }
    Label_model.find_one(callback_function);
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
            AddInfo_model.update_balance_using_address_list(from_addresses);
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
            function callback_function(err, addresses)
            {
                if(err)
                    reject(err);
                else
                {
                    for(var i = 0; i< addresses.length; i++)
                    {
                        if(sum_actual >= sum_need)
                            break
                        else
                        {
                            console.log(addresses[i].balance);
                            sum_actual += addresses[i].balance;
                            from_addresses.push(addresses[i].address);
                        }
                    }
                    resolve(sum_actual);
                }
            }
            AddInfo_model.sorted_address(callback_function);
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
                confirmation_model.update_status_fully_confirmed(tx_hash);
                function callback(err, addr)
                {
                    for(j in addr)
                    {
                        function send_json_date(err, bal)
                        {
                            if(err)
                            {
                                console.log("error while geting balance related to a address, err: ", err);
                            }
                            else
                            {
                                addInfo_model.update_balance(addr[j], bal);
                            }
                        }
                        dogecoin.get_availabel_balance(addr.add[j], send_json_data);
                    }
                }
                confirmation_model.find_addresses(tx_hash, callback);
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
        function callback(err, adds)=> // adds all addresses related to us of this transactions_hash
        {
            if(err)
            {
                console.log("error in callback, err: ", err);
            }
            else
            {
                confirmation_model.insert_into_db({"hash":data.x.hash, "status":"unconfirmed", "add":adds})
            }
        }
        AddInfo_model.find_address(addresses, callback);
    }

    else if(data.op == "block"){
        console.log("block has been created");
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
                confirmation_model.find_hashes(callback);
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
            then((confirmed_hash)=>
            {
                if(confirmed_hash.length>0)
                {
                    console.log("3");
                    console.log("hashes>>>>>>>>>>>>>>>>: ", confirmed_hash);
                    confirmation_model.update_status_confirmed(confirmed_hash);
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
        confirmation_model.find_confirmed_hash(callback_function);
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