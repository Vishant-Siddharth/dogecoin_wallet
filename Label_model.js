var Label = require('./lastLabel');

var inc_by_one = function()=>{
	Label.update({}, {$inc:{"label":1}})
	.exec((err, label)=>{
		if(err)
			console.log("error while inc_by_one, err: ", err);
		else{
			console.log("inc_by_one succsessfully, label: ", label);
		}
	});
}

var find_one = function(callback_function)=>{
	Label.findOne()
		.exec(function(err, labels)=>{
			if(err)
			{
				console.log("error while find_one , err: ", err);
				if(callback_function) callback_function(err, null);
				else return err;
			}
			else
			{
				console.log("find_one succsessfully, label: ", labels.label);
				if(callback_function) callback_function(null, labels.label);
				else return labels.label;
			}
		});
}

module.export.inc_by_one = inc_by_one;
module.export.find_one = find_one;