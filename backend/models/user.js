//importation
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

//creation schema user
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

//1 utilisateur = 1mail
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);