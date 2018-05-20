var express = require('express');
const app = express();

app.get('/', function(req, res){
   res.json({status: "success", message: "Welcome to Dogecoin wallet"});
});

app.listen(5000, "0.0.0.0", (err, data) =>
    {
        if(err){
        console.error(err);
        }
        else{
        console.log('Server is up...');
        }
    }
);