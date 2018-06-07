const Label_model = require('./models/Label_model');
const AddInfo_model = require('./models/AddInfo_model');
const Confirmation_model = require('./models/Confirmation_model');
var DogeCoin = new require('./dogecoin_wallet.js');
var config = require('./config');
const dogecoin = new DogeCoin({api_key:config.api_key, pass:config.pass, version:2});
var config = require('./config');
var outgoing_payment_handler = require('./handlers').outgoing_payment_handler;
// var register_all = require('./handlers').register_all;

exports.home = (req, res) =>{
	res.json({status: "success", message: "Welcome to Dogecoin wallet"});
}

function main_create_address(callback_function)
{
    function callback(error ,label)
    {
        if(error)
        {
        	if(callback_function){callback_function(error, null);}
        	else return error;
        }
        else
        {
        	function send_json(err, data)
		    {
		        if(err)
		        {
		        	console.log("status:error while generate_address, message:", err);
		        	if(callback_function){callback_function(err, null);}
		        	else return err;
		        }
		        else
		        {
			        Label_model.inc_by_one();
			        var arr = data.split("-");
			        AddInfo_model.insert_into_db({'label':arr[2], 'user_id':arr[1], 'address':arr[0], 'balance':0});
			        if(callback_function){callback_function(null, {'status': "success", 'id': arr[1], 'address': arr[0], 'label': arr[2]});}
			        else return {'status': "success", 'id': arr[1], 'address': arr[0], 'label': arr[2]};
			    }
		    }
		    dogecoin.generate_address(label, send_json);
        }
    }
    Label_model.find_one(callback);
}

exports.create_address = (req, res)=>{
	function callback_function(err, response)
	{
		if(err)
		{
			res.json({status:"error", message:err.message});
		}
		else
		{
			res.json(response);
		}
	}
	main_create_address(callback_function);
}

function main_get_address_using_label(label, callback_function)
{
	function send_json(err, data)
    {
        if(err)
        {
        	if(callback_function){callback_function(err, null);}
        	else return err;
        }
        else
        {
        	if(callback_function){callback_function(null, {'status': "success", 'address': data, 'label':label});}
        	else return {status: "success", address: data, label: req.params.label};
	        res.json({status: "success", address: data, label: req.params.label});
        }
    }
    dogecoin.get_address_by_label(label, send_json);
}

exports.get_address_using_label = (req, res)=>
{
	function callback_function(err, response)
	{
		if(err)
		{
			res.json({status: "error", message: err.message});
		}
		else
		{
			res.json(response);
		}
	}
	main_get_address_using_label(req.params.label, callback_function);	
}

function main_get_availabel_balance(add, callback_function)
{
	function send_json(err, data)
    {
        if(err)
        {
        	if(callback_function){callback_function(err, null);}
        	else return err;
        }
        else
        {
        	if(callback_function){callback_function(null, data);}
        	else return data;
        }
    }
    dogecoin.get_availabel_balance(add, send_json);
}

exports.get_availabel_balance = (req, res)=>{
	function callback_function(err, bal)
    {
        if(err)
        {
        	res.json({status:'error', message:err.message})
        }
        else
        {
        	res.json({status: "success", availabel_balance: bal});
        }
    }
    main_get_availabel_balance(req.params.add, callback_function);
}

function main_get_pending_balance(add, callback_function)
{
	function send_json(err, data)
    {
        if(err)
        {
        	if(callback_function){callback_function(err, null);}
        	else return err;
        }
        else
        {
        	if(callback_function){callback_function(null, data);}
        	else return data; 
        }
    }
    dogecoin.pending_received_balance(add, send_json);
}

exports.get_pending_balance = (req, res)=>{
	function callback_function(err, bal)
    {
        if(err)
        {
            res.json({status:"error", message: err.message});
        }
        else
        {
        	res.json({status: "success", pending_received_balance: bal});
        }
    }
    main_get_pending_balance(req.params.add, callback_function);
}

function main_withdrawl(req, callback_function)
{
	var from_addresses = [];
	var sum_actual = 0;
	function send_json(err, data)
    {
        if(err)
        {
        	if(callback_function){callback_function(err, null);}
        	else return err;
        }
        else
        {
            AddInfo_model.update_balance_using_address_list(from_addresses);
            outgoing_payment_handler({ from_addresses:from_addresses, amount:req.body.amount, to_addresses:req.body.to_addresses, 'txid':data}); // from here i will send the withdrawl event
        	if(callback_function){callback_function(null, data);}
        	else return data;
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
            function callback(err, addresses)
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
                            // console.log(addresses[i].balance);
                            sum_actual += addresses[i].balance;
                            from_addresses.push(addresses[i].address);
                        }
                    }
                    resolve(sum_actual);
                }
            }
            AddInfo_model.sorted_address(callback);
        });           
    }

    get_sum_actual()
    .then( (sum_actual) =>{
        if (sum_need>sum_actual)
        {
            console.log("sum_actual ", sum_actual, " sum_need" , sum_need);
            if(callback_function){callback_function('balance is not sufficient', null);}
            else return "balance is not sufficient";
        }
        else
        {
            if(sum_need < sum_actual)
            {
                req.body.to_addresses.push(config.change_add);
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
    	if(callback_function){callback_function("error while try to get sum in get_sum_actual", null);}
    	else return "error while try to get sum in get_sum_actual";
    });
}

exports.withdrawl = (req, res)=>{
	function callback_function(err,txid)
	{
		if(err)
		{
            if(err.message)
			    res.json({status:'error', message: err.message});
            else
                res.json({status:'error', message:err});
		}
		else
		{
			res.json({status:"success", txid:data});
		}
	}
	main_withdrawl(req, callback_function);
}


function main_transaction(txid, callback_function)
{
	function send_json(err, blocks)
    {
        if(err)
        {
        	if(callback_function){callback_function(err, null);}
        	else return err;
        }
        else
        {
        	if(callback_function){callback_function(null, blocks);}
        	else return blocks;
        }
    }
    dogecoin.get_transaction_details(txid, send_json);
}
exports.transaction = (req, res)=>{
	function callback_function(err, blocks)
    {
        if(err)
        {
            res.json({status:"error", message: err});
        }
        else
        {
        	res.json({status: "success", confirmations: blocks});
        }
    }
    main_transaction(req.params.txid, callback_function);
}

module.exports.main_create_address = main_create_address;
module.exports.main_get_address_using_label = main_get_address_using_label;
module.exports.main_get_availabel_balance = main_get_availabel_balance;
module.exports.main_get_pending_balance = main_get_pending_balance;
module.exports.main_withdrawl = main_withdrawl;
module.exports.main_transaction = main_transaction;
module.exports.dogecoin = dogecoin;
