var AddInfo = require('./addressInformation');

var insert_into_db_info = function(dict)=>{
	var newAdd = new AddInfo();
	var newAdd.label = dict.label;
	var newAdd.user_id = dict.user_id;
	var newAdd.address = dict.address;
	var newAdd.balance = dict.balance;
	newAdd.save(function(err, info){
            if(err){
                console.log('error while insert_into_db, err: ', err);
            }
            else{
                console.log("succsessfully insert_into_db, info: ", info);
            }
        });
}

var update_balance_using_address_list = function(from_addresses)=>{
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

var sorted_address = function(callback_function)=>{
	AddInfo.find().sort({'balance':-1})
	.exec(function(err, addresses){
		if(err)
		{
			console.log("error in sorted_address, err: ", err);
			if(callback_function){ callback_function(err, null)}
			else return err;
		}
		else
		{
			console.log("all addresses in sorted sorted form: ", addresses);
			if(callback_function){ callback_function(null, addresses)}
			else return addresses;
		}
	});
}

var update_balance = function(add, bal)=>{
	AddInfo.update({"address":add}, {$set:{"balance":bal}})
    .exec(function(err, res){
        if(err)
        {
            console.log("err when updating the balance, err: ", err);
        }
        else
        {
            console.log("successfully updated res: ", res);
        }
    });
}

var find_address = function(adds, callback_function)=>{
	AddInfo.find({"address":{$in:adds}}, {"address":1, "_id":0})
	.exec(function(err, res)=>{
		if(err)
		{
			console.log("error in find_address, err: ", err);
			if(callback_function){callback_function(err, null);}
			else return err; 
		}
		else
		{
			var add = res.map(x => x.address);
			if(callback_function){callback_function(null, add);}
			else return add;

		}
	})
}

module.export.insert_into_db_info = insert_into_db_info;
module.export.update_balance_using_address_list = update_balance_using_address_list;
module.export.sorted_address = sorted_address;
module.export.update_balance = update_balance;
module.export.find_address = find_address;