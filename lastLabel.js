'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var labelSchema = new Schema({ // we have to do somthing like that it will create automaticaly one label at every call
    label:{
        type:Number,
        required:true,
        unique:true
    }
});

module.exports = mongoose.model('Label', labelSchema, 'Label');










































































//var MongoClient = require('mongodb').MongoClient;
//var url = "mongodb://localhost:27017/";
//
//class mongodb
//{
//    constructor(obj)
//    {
////        var db_name = opj.db;// = "mydb";
////        this.col_name = obj.collection; //last_label;
////        this.dbo = db.db(db_name);
//        this.url = "mongodb://local:host:27017/";
//    }
//
//    create_database(db_name)
//    {
//        let url = this.url + db_name;
//        MongoClient.connect(url, function(err, db)
//        {
//            if (err) throw err;
//            console.log("Database Created");
//            db.close();
//        });
//    }
//
//    create_collection(col_name)
//    {
//        let dbo = db.db(db_name);
//        dbo.createcollection(col_name, function(err, res){
//            if (err) throw err;
//            console.log("collection created");
//            db.close();
//        });
//    }
//    MongoClient.connect(url, function(err, db) {
//        if (err) throw err;
//
//        var dbo = db.db("mydb"); // database;
//
//        var myobj = {label:1};
//        dbo.collection("last_label").insertOne(myobj, function(err, res){ //for insert in collection
//        if(err) throw  err;
//        console.log("1 document inserted");
//        });
//
//        var new_label;
//        var old_label;
//        dbo.collection("last_label").findOne({}, function(err, result){ //for findOne
//        if (err) throw err;
//         old_label = result.label;
//         new_label = result.label+1;
//         console.log(result.label);
//        });
//
//        var myquery = {label:old_label}
//        var newValue{$set:{label:new_label}};
//        dbo.collection("last-label").updateOne(myquery, newValue, function(err, res){ //for update
//        if (err) throw err;
//        });
//
//    db.close();
//    });
//}