var request = require('request');
var crypto = require('crypto');
var config = require('./config');
// var eventEmitter = new events.EventEmitter();

function send_callback(data, url){
	let payload = Buffer.from(JSON.stringify(data)).toString('base64');
	const signature = crypto.createHmac('sha512', config.priv_key).update(payload).digest('hex');
	const options = {
		uri:url,
		headers: {
			'Content-Type': 'application/json',
	    	'BUC-APIKEY': config.pub_key,
    		'BUC-PAYLOAD': payload,
    		'BUC-SIGNATURE': signature
	  	},
	  	json: {}
	}

	request.post(options, function(error, response, body){
		if(error){
			console.log(error.message);
			return;
		}
		console.log('response:', JSON.stringify(body, 0, 2));
	});
}

function outgoing_payment_handler(payment){
	send_callback(payment, config.callback_config_withdraw);
	console.log('outgoing_payment', payment);
}

function incoming_payment_handler(payment){
	let obj = new Object();
	obj['status'] = 'utx';
	obj['tx_hash'] = payment.x.hash;
	obj['to_add_and_val'] = payment.x.outputs;
	send_callback(obj, config.callback_config_deposit);
	console.log('incoming_payment', obj);
}

module.exports.outgoing_payment_handler = outgoing_payment_handler;
module.exports.incoming_payment_handler = incoming_payment_handler;