const mongo = require('mongoose')
const schema = mongo.Schema

const quiz = new schema({
    quizID : {
        type: String,
        required : true
    },
    quizDate : {
        type : Date,
        required : true
    },
    quizCreationDate : {
        type : Date,
        required : true
    },
    quizCreator : {
        type : Number,
        required : true
    },
    quizStatus : {
        type : String,
        required : true,
        default : "Pending"
    },
    quizDuration : {
        type: Number,
        required : true
    }
})