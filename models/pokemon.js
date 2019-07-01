const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Populate = require("../utils/autopopulate");

const PokemonSchema = new Schema({
	title: { type: String, required: true },
	url: {type: String, required: true},
	summary: {type: String, required: true},
	level: { type: String, required: true },
	comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
	author: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});
PokemonSchema
    .pre('findOne', Populate('author'))
    .pre('find', Populate('author'))

module.exports = mongoose.model("Pokemon", PokemonSchema);
