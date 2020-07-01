const mongoose = require('mongoose');

const teamSchema = mongoose.Schema({

	name:{
		type: String,
		maxlength: 50
	},
	name:{
		type: String,
		maxlength: 50
	},
	memebers:{
		type: Array
	},
	tasks:{
		type: Array,
		default: [
		{'name':'Sample task','description':'This is a sample task','deadline': '23/4/2020', 'doneby':'Jack'}
		]
	},
	access:{
		type:String
	}

})

const Team = mongoose.model('Team', teamSchema)

module.exports = {Team}