var genrate_address = function(api_key, pass, lable)
{
    var genrate_add = function(api_key, pass, lable) {
        return new Promise(function(resolve, reject)
        {
            function response(err, res)
            {
                console.log("res: ", res);
                if (res.data.address)
                    resolve(res.data.address);
                else
                    resolve(res.data.error_message);
                reject(err);
                //else reject(res);
            };

            var ans;
            var BlockIo = require('block_io');
            var version = 2;
            var block_io = new BlockIo(api_key, pass, version);
            block_io.get_new_address({'label': lable}, response); //ans coming from get_new_address
        })
    };

    genrate_add(lable)
            .then(
                function(result){ans = result; console.log(`end: ${ans}`); },
                function(err){ console.log(err); console.log('error'); }
            )
};

/////////////////////////////////////////////////////////////////////////////////////////////
var get_address_by_label = function(api_key, pass, lable)
{
    var get_add_by_label = function(api_key, pass, lable){
        return new Promise(function(resolve, reject)
        {
            function response(err, res)
            {
                console.log("res: ", res);
                if (res.data.address)
                    resolve(res.data.address);
                else
                    resolve(res.data.error_message);
                reject(err);
            };
            var BlockIo = require('block_io');
            var version = 2;
            var ans;
            var block_io = new BlockIo(api_key, pass, version);
            block_io.get_address_by_label({'lable':lable}, response);
        })
    };

    get_add_by_label(api_key, pass, lable)
        .then(
            function(result){ans = result; console.log(`end: ${ans}`); },
            function(err){ console.log(err); console.log('error'); }
        )
};

///////////////////////////////////////////////////////////////////////////////////////////////
var get_available_balance = function(api_key, pass, address, lable, id)
{
    var get_available_bal = function(api_key, pass, address='False', lable='False', id='False'){
        return new Promise(function(resolve, reject)
        {
            function response(err, res)
            {
                console.log("res: ", res);
                if (res.data.available_balance)
                    resolve(res.data.available_balance);
                else
                    resolve(res.data.error_message);
                reject(err);
            };
            var ans;
            var BlockIo = require('block_io');
            var version = 2;
            var block_io = new BlockIo(api_key, pass, version);
//            console.log(api_key, pass);
            if (address != 'False')
                { console.log('address');
                block_io.get_address_balance({'address':address}, response);}
            else if (lable != 'False')
                { console.log('lable');
                block_io.get_address_balance({'lable':lable}, response);}
            else if (id != 'False')
                { console.log('id');
                block_io.get_address_balance({'user_id':id}, response);}
            else
                { console.log('gfd');
                block_io.get_balance({}, response);}
        })
    };

    get_available_bal( address = 'False',lable = 'default', id = 'False')
        .then(
            function(result){ans = result; console.log(`end: ${ans}`); },
            function(err){ console.log(err); console.log('error'); }
        )
};

////////////////////////////////////////////////////////////////////////////////////////////////
var pending_received_balance = function(api_key, pass, address, lable, id)
{
    var pending_received_bal = function(api_key, pass, address = 'False', lable = 'False', id = 'False'){
        return new Promise(function(resolve, reject)
        {
            function response(err, res)
            {
                console.log("res: ", res);
                if (res.data.pending_received_balance)
                    resolve(res.data.pending_received_balance);
                 else
                    resolve(res.data.error_message);
                reject(err);
            };

//            console.log(lable, " ", address, " ", id);
            var BlockIo = require('block_io');
            var version = 2;
            var ans;
            var block_io = new BlockIo(api_key, pass, version);
            if (lable != 'False')
                { console.log('lable');
                block_io.get_address_balance({'lable':lable}, response);}
            else if (address != 'False')
                { console.log('address');
                block_io.get_address_balance({'address':address}, response);}
            else if (id != 'False')
                { console.log('id');
                block_io.get_address_balance({'user_id':id}, response);}
            else
                { console.log('gfd');
                block_io.get_balance({}, response);}
        })
    };

    pending_received_bal(api_key, pass, address = 'False', lable='False', id = 'False')
        .then(
            function(result){ans = result; console.log(`end: ${ans}`); },
            function(err){ console.log(err); console.log('error'); }
        )
};

/////////////////////////////////////////////////////////////////////////////////////////////
var get_withdrawl = function(api_key, pass, amounts, to_addresses, pin)
{
    var amount = amounts.join();
    var to_address = to_addresses.join();
    var BlockIo = require('block_io');
    var version = 2;
    var ans;
    var block_io = new BlockIo(api_key, pass, version);
    url = "https://block.io/api/v2/withdraw/?api_key=" + api_key + "&amounts=" + amount + "&to_addresses=" + to_address + "&pin=" + pin
    var request = require('request');
    request(url, function (error, response, body) {
//      console.log('error:', error); // Print the error if one occurred
//      console.log('statusCode:', response); // Print the response status code if a response was received
//      console.log('body:', body ); // Print the HTML for the Google homepage.
      var jsonObject = JSON.parse(body);
      console.log('status: ', jsonObject);
      if (jsonObject['data']['txid'])
      {
        console.log('txid', jsonObject['data']['txid']);
        ans = jsonObject['data']['txid'];
      }
      else
      {
        console.log('error_message', jsonObject['data']['error_message']);
        ans = jsonObject['data']['error_message'];
      }
    });
};

//////////////////////////////////////////////////////////////////////////////////////////////////
var get_transactions_detail = function(api_key, pass, TXID)
{
    var get_transaction = function(api_key, pass, TXID){
        return new Promise(function(resolve, reject)
        {
            function response(err, res)
            {
                console.log("res: ", res);
                if (res.status)
                    resolve(res.status);
                else
                    resolve(res.data.error_message);
                reject(err);
            };
            var BlockIo = require('block_io');
            var version = 2;
            var ans;
            var block_io = new BlockIo(api_key, pass, version);
            block_io.get_transactions({'type': 'sent', 'before_tx': TXID}, response);
        })
    };
    get_transaction(api_key, pass, TXID)
        .then(
            function(result){ans = result; console.log(`end: ${ans}`); },
            function(err){ console.log(err); console.log('error'); }
        )
};

//module.exports =
module.exports.get_available_balance = get_available_balance;
module.exports.get_transactions_detail = get_transactions_detail;
module.exports.get_withdrawl = get_withdrawl;
module.exports.get_address_by_label = get_address_by_label;
module.exports.pending_received_balance = pending_received_balance;
module.exports.get_address_by_label = get_address_by_label;
