exports.create_address = (req, res){
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
}

