'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var conformation_schema= new Schema({
    hash:{
        type:String,
        require:true,
        unique:true
    },
    status:{
        type:String,
        required:true, // want only three value 'unconfirmed', 'confirmed', 'fully_confirmed'
        enum:['unconfirmed', 'confirmed', 'fully_confirmed']
    },
    add:{
        type:[],//not sure will work or not
        required:true
    }
});

module.exports = mongoose.model('Confirmaton', conformation_schema, 'Confirmation');