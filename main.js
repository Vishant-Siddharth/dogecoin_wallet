var BlockIo = require('block_io');
var version = 2;
data = {};
function response(err, res){data = res;}
var block_io = new BlockIo('2b5b-0dff-6e47-c216', 'vishant3731', version);
block_io.get_new_address({'label': 'add24'}, console.log);
