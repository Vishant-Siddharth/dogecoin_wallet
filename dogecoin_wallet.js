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
//            var api_key = '2b5b-0dff-6e47-c216';
//            var pass = 'vector31';
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
//            var api_key = '2b5b-0dff-6e47-c216';
//            var pass = 'vector31';
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
var get_available_balance = function( address, lable, id)
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
            var api_key = '2b5b-0dff-6e47-c216';
            var pass = 'vector31';
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
var pending_received_balance = function( address, lable, id)
{
    var pending_received_bal = function(api_key, pass, address = 'False', lable = 'False', id = 'False'){
        return new Promise(function(resolve, reject)
        {
            function response(err, res)
            {
                console.log("res: ", res);
                resolve(res.data.pending_received_balance);
                reject(err);
            };

            console.log(lable, " ", address, " ", id);
            var api_key = '2b5b-0dff-6e47-c216';
            var pass = 'vector31';
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
var get_withdraw = function(amounts, to_addresses, pin)
{
    var withdraw_from_add = function(api_key, pass, amounts, to_addresses, pin){
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
            var api_key = '2b5b-0dff-6e47-c216';
            var pass = 'vector31';
            var BlockIo = require('block_io');
            var version = 2;
            var ans;
            var block_io = new BlockIo(api_key, pass, version);
            var f_add = from_addresses.join();
            var t_add = to_addresses.join();
            var amo = amounts.join();
            block_io.withdraw({'amounts': amo, 'to_addresses': t_add, 'pin': pin}, response);
        })
    };

    withdraw_from_address(api_key, pass, amounts, to_addresses, pin)
        .then(
            function(result){ans = result; console.log(`end: ${ans}`); },
            function(err){ console.log(err); console.log('error'); }
        )
};

//////////////////////////////////////////////////////////////////////////////////////////////////
var get_transactions = function(TXID)
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
            block_io.get_transactions({'type': 'sent', 'before_tx': TXID}, response);
        })
    };

    var api_key = '2b5b-0dff-6e47-c216';
    var pass = 'vector31';
    var BlockIo = require('block_io');
    var version = 2;
    var ans;
    var block_io = new BlockIo(api_key, pass, version);
    get_transaction(api_key, pass, TXID)
        .then(
            function(result){ans = result; console.log(`end: ${ans}`); },
            function(err){ console.log(err); console.log('error'); }
        )
};

//module.exports =
module.exports.get_available_balance = get_available_balance;
module.exports.get_transactions = get_transactions;
module.exports.get_withdraw = get_withdraw;
module.exports.get_address_by_label = get_address_by_label;
module.exports.pending_received_balance = pending_received_balance;
module.exports.get_address_by_label = get_address_by_label;
