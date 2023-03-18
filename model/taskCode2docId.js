const mongoose = require("mongoose")

const taskCode2docIdSchema = new mongoose.Schema({
    task_code: {
        type: String,
        required: true
    },
    docId: {
        type: String,
        required: true
    }
})

const taskCode2docId = mongoose.model('taskCode2docId', taskCode2docIdSchema, 'taskCode2docId')
module.exports = taskCode2docId