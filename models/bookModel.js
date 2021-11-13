const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    title:{
        type:String,
        required: [true, 'Please specify the title of the book']
    },
    author: {
        type: String,
        required: [true, 'Please specify author']
    },
    category: {
        type: String,
        required:[true, 'Please specify the category of the book']
    },
    quantity: {
        type:Number,
        required:[true, 'Please specify the number of book items for this book']
    },
    status: {
        type: String,
        default: 'available'
    }
});

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;