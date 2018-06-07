var AddInfo = require('../collections/addressInformation');

var insert_into_db = function(dict){
	var newAdd = new AddInfo();
	newAdd.label = dict.label;
	newAdd.user_id = dict.user_id;
	newAdd.address = dict.address;
	newAdd.balance = dict.balance;
	newAdd.save(function(err, info){
            if(err){
                console.log('error while insert_into_db, err: ', err);
            }
            else{
                console.log("succsessfully insert_into_db, info: ", info);
            }
        });
}

var update_balance_using_address_list = function(from_addresses){
	AddInfo.update({"address":{$in:from_addresses}}, {$set:{'balance':0}}, {'multi':true})
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
}

var sorted_address = (callback_function)=>{
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
			// console.log("all addresses in sorted sorted form: ", addresses);
			if(callback_function){ callback_function(null, addresses)}
			else return addresses;
		}
	});
}

var update_balance = function(add, bal){
	// console.log("add: ", add);
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

var find_address = function(adds, callback_function){
	AddInfo.find({"address":{$in:adds}}, {"address":1, "_id":0})
	.exec(function(err, res)	{
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

module.exports.insert_into_db = insert_into_db;
module.exports.update_balance_using_address_list = update_balance_using_address_list;
module.exports.sorted_address = sorted_address;
module.exports.update_balance = update_balance;
module.exports.find_address = find_address;
