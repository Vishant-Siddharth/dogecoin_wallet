var Confirmation = require('./confirmations');

var insert_into_db = function(dict) {
	var addNew = new Confirmation();
    addNew.hash = dict.hash;
    addNew.status = dict.status;
    addNew.add = dict.add;
    addNew.save(function( err, res ){
        if(err)
        {
            console.log('error while insert_into_db');
        }
        else
        {
            console.log('saved ', res);
        }
    });
}

var update_status_fully_confirmed = function(tx_hash){
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
}

var update_status_confirmed = function(confirmed_hash){
	Confirmation.update({ hash:{$in:confirmed_hash} }, {$set:{'status':'confirmed'}}, {multi:true}) //confirmed all confirmed_hashes
    .exec(function(err, info){
        if(err)
            console.log('error when update_status_confirmed, error: ', err);
        else
        {
            console.log('updated successfully, info ', info);
        }
    });
}

var find_hashes = function(callback)
{
	Confirmation.find({}, {"hash":1, '_id':0})
    .exec(function(err, hashes){
        if(err)
        {
            console.log('error when find_hashes, err: ', err);
            if(callback){callback(err, null);}
            else return err;
        }
        else
        {
            tx_hashes = hashes.map(x => x.hash); // all transaction hash we have in Confirmation
            console.log("tx_hashes: ", tx_hashes);
            if(callback){callback(null, tx_hashes);}
        	else return tx_hashes;
        }
    });
}

var find_confirmed_hash = function(callback)
{
	Confirmation.find({status:"confirmed"}, {"hash":1, "_id":0})
    .exec(function(err, txHashes)
    {
        if(err)
        {
            console.log('error when  find_confirmed_hash, err: ', err);
            if(callback){callback(err, null);}
            else return err;
        }
        else
        {
            txHashes = txHashes.map(x => x.hash); //all confirmed
            console.log("txHashes: ", txHashes);
            if(callback){callback(null, txHashes);}
        	else return txHashes;
        }
    });
}

var find_addresses = function(tx_hash, callback){
	Confirmation.find({"hash":tx_hash}, {'add':1,'_id':0})
    .exec(function(err, addr){
        if(err)
        {
            console.log('error while find_addresses, err: ', err);
            if(callback){callback(err, null);}
            else return err;
        }
        else
        {
        	console.log("addresses: ", addr.add);
        	if(callback){callback(null, addr.add);}
        	else return addr.add;
        }
}

module.export.insert_into_db = insert_into_db;
module.export.update_status_fully_confirmed = update_status_fully_confirmed;
module.export.update_status_confirmed = update_status_confirmed;
module.export.find_hashes = find_hashes;
module.export.find_confirmed_hash = find_confirmed_hash;
module.export.find_addresses = find_addresses;