var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CelebSchema = new Schema({
  user_id: {type: String},
  name: {type: String},
  id: {type: String},
  known_for: {type: Array},
  pic_url: {type: String},
  popularity: {type: String}
});

module.exports = mongoose.model("Celeb", CelebSchema);
