const mongoose = require("mongoose");

// 系统推荐表的定义
const stmRecommenderSchema = new mongoose.Schema({
  recommender_name: {
    type: String,
    required: true,
  },
  heat: {
    type: String,
    required: true,
  },
  time: {
    type:String,
    require: true
  }
});

const stmRecommender = mongoose.model("stm_recommender", stmRecommenderSchema);
// const systemFailure = mongoose.model('system_failure',systemFailureSchema)
module.exports = stmRecommender;
