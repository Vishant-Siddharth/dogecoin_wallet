"use strict";
var throw_error = require('./custom_error');

class DogeCoin
{
    constructor (obj)
    {
        if (!obj)
        {
            throw new throw_error('Please pass the dictionary', 500)
        }
        if ((!obj.api_key || !obj.pass || !obj.version))
        {
            throw new throw_error('Not all parameters were passed', 500)
        }
        this.PIN = obj.pass;
        var BlockIo = require('block_io');
        this.block_io = new BlockIo(obj.api_key, obj.pass, obj.version);
    }

    generate_address(label, call_back_function)
    {
        var generate_add = (label) =>
        {
            var self = this;
            return new Promise(function(resolve, reject)
            {
                function response(err, res)
                {
                    if (err)
                    {
                        // console.log("if err: ", err);
                        reject(err);
                    }

                    if (res.data.address)
                    {
                        // console.log("if add: ", res.data);
                        let val = res.data.address + "-" + res.data.user_id + "-" + res.data.label;
                        resolve(val);
                    }
                    else
                    {
                        // console.log('else res: ',res);
                        var err = new throw_error(res.data.error_message, 500)
                        reject(err);
                    }
                };
                self.block_io.get_new_address({'label': label}, response); //ans coming from get_new_address
            })
        };
        generate_add(String(label))
            .then((result) =>{ 
                try
                {
                    call_back_function(null, result);
                }
                catch(e)
                {
                    console.log("error1234 ", e);
                    call_back_function(e, null);
                }
            })
            .catch((err) => {if(err){console.log('asdf: ', err);}call_back_function(err, null);});

    };

    get_address_by_label(label, call_back_function)
    {
        var get_add_by_label = (label) =>
        {
            var self = this;
            return new Promise(function(resolve, reject)
            {
                function response(err, res)
                {
                    if (err)
                    {
                        reject(err);
                    }
                    if (res.data.address)
                    {
                        resolve(res.data.address);
                    }
                    else
                    {
                        reject(new throw_error(res.data.error_message, 500));
                    }
                };
                self.block_io.get_address_by_label({'label':label}, response);
            });
        };
        get_add_by_label(label)
            .then((result) =>{ console.log('then');call_back_function(null, result);})
            .catch((err) => {if(err){console.log('asdf');}call_back_function(err, null);});
    };

    get_availabel_balance(address, call_back_function)
    {
        // console.log("address: ", address);
        var get_availabel_bal = (address) =>
        {
            // console.log("get_availabel_balance:", address);
            var self = this;
            return new Promise(function(resolve, reject)
            {
                function response(err, res)
                {
                    if(err)
                    {
                        reject(err);
                    }
                    if (res.data.available_balance)
                    {
                        resolve(res.data.available_balance);
                    }
                    else
                    {
                        reject(new throw_error(res.data.error_message, 500));
                    }
                };
                self.block_io.get_address_balance({'address':address}, response);
            });
        };

        get_availabel_bal(address)
            .then((result) =>{call_back_function(null, result);})
            .catch((err) => {if(err){console.log('asdf');}call_back_function(err, null);});
    };

    pending_received_balance(address, call_back_function)
    {
        console.log("address: ", address);
        var pending_received_bal = (address) =>
        {
            var self = this;
            return new Promise(function(resolve, reject)
            {
                function response(err, res)
                {
                    if(err)
                    {
                        reject(err);
                    }
                    if (res.data.pending_received_balance)
                    {
                        resolve(res.data.pending_received_balance);
                    }
                    else
                    {
                        reject(new throw_error(res.data.error_message, 500));
                    }
                };
                self.block_io.get_address_balance({'address':address}, response);
            })
        };

        pending_received_bal(address)
            .then((result) =>{call_back_function(null, result);})
            .catch((err) => {if(err){console.log('asdf');}call_back_function(err, null);});
    };

    withdrawl_balance(dic, call_back_function)
    {
        let to_address = dic.to_addresses;
        let amount = dic.amount;
        let from_address = dic.from_addresses;
//        let pin = this.PIN

        var withdrawl_bal = () =>
        {
            var self = this;
            return new Promise(function(resolve, reject)
            {
                function response(err, res)
                {
                    if(err)
                    {
                        reject(err);
                    }
                    if (res.data.txid)
                    {
                        resolve(res.data.txid);
                    }
                    else
                    {
                        reject(new throw_error(res.data.error_message, 500));
                    }
                };
                self.block_io.withdraw_from_addresses({'amount':amount, 'from_addresses':from_address, 'to_addresses':to_address, 'PIN':self.pin}, response);
            });
        };
        withdrawl_bal()
            .then((result) =>{call_back_function(null, result);})
            .catch((err) => {if(err){console.log('asdf');}call_back_function(err, null);});
    };

    get_transaction_details(txid, call_back_function)
    {
        var transaction_details = (txid) =>
        {
            return new Promise(function(resolve, reject)
            {
                let url = "https://dogechain.info/api/v1/transaction/" + txid
                var request = require('request');
                request(url, function (error, response, body)
                {
                    if (error != null)
                    {
                        console.log('error: ', error);
                        reject(error)
                    }
                    let jsonObject = JSON.parse(body);
                    if (jsonObject.transaction && jsonObject.transaction.confirmations)
                    {
                        resolve(jsonObject['transaction']['confirmations']);
                    }
                    else
                        reject(jsonObject['error']);
                });
            });
        };
        transaction_details(txid)
            .then((result) =>{
                console.log(result);
                if(call_back_function){call_back_function(null, result);}
                else return result;
            })
            .catch((err) => {
                if(err){
                    console.log('asdf');
                }
                if(call_back_function)
                {
                    call_back_function(err, null);
                }
                else return err;
            });
    };
}

module.exports = DogeCoin


