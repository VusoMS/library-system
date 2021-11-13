const mongoose = require('mongoose');

const bookItemSchema = mongoose.Schema({
    title:{
        type:String,
        required: [true, 'Please specify the title of the book']
    },
    author: {
        type: String,
        required: [true, 'Please specify author']
    },
    bookRef:{
        type: String,
        required:[true, 'Specify which Book is this book-item for']
    },
    status:{
        type: String,
        enum: ['available', 'reserved','issued','overdue'],
        default: 'available'
    },
    user: {
        id:String,
        reserveDate: Date,
        issueDate: Date,
        dueDate: Date
    }
});

const BookItem = mongoose.model('BookItem', bookItemSchema);
module.exports = BookItem;