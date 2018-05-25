'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var information = new Schema({
    user_id:{
        type:Number,
        require:true,
        unique:true
    },
    address:{
        type:String,
        required:true,
        unique:true
    },
    label:{
        type:String,
        required:true,
        unique:true
    }
});

module.exports = mongoose.model('AddInfo', information, 'AddInfo');