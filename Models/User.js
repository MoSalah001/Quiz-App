const mongo = require('mongoose');
const schema = mongo.Schema;

const user = new schema({
    staffID : {
        type : Number,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    storeID : {
        type : Number,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    userType : {
        type : Number,
        required : true,
        default: 0
    },
    KYC : {
        type : Boolean,
        required : true,
        default: false
    }
});

module.exports = mongo.model('user',user);