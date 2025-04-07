const {Schema, model} = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose')

const UserSchema = new Schema({
    email:{
        type:String,
        required :true
    }
})

UserSchema.plugin(passportLocalMongoose);

module.exports=model('User',UserSchema);