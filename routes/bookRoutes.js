const express = require('express');
const Book = require('../models/bookModel');
const BookItem = require('../models/bookItemModel');
const User = require('../models/userModel');
const router = express.Router();


//  USER ROUTES

// get or search books (front-view)
router.get('/', async (req,res,next)=>{ // We will incooporate search here
    const user = req.session.user;
    if(!user){
        res.status(401).redirect('/');
    }else if(user.role == 'admin' && Object.keys(req.query).length === 0){              
        let filter = "ALL BOOKS";
        let books = await Book.find({});
        res.status(200).render('adminBooks', {data:{user,books,filter}})
    }else{ 
        if(req.query.category){
            let filter = "CATEGORY"
            const books = await Book.find(req.query);
            (user.role == 'user')? res.status(200).render('books', {data:{books,user,filter}}): res.status(200).render('adminBooks',{data:{books,user,filter}})

        }else if(req.query.search){
            let filter = "SEARCH RESULTS";
            let books = await Book.find({title: req.query.search}); // search book with title
            if(books.length == 0){ books = await Book.find({author: req.query.search}); } //search book by author
            if(books.length == 0){ books = await Book.find({category: req.query.search}); } //search book by category

            (user.role == 'user')? res.status(200).render('books', {data:{books,user,filter}}): res.status(200).render('adminBooks',{data:{books,user,filter}})
        };         
    };
});

router.get('/items/', async(req,res,next)=>{
    const user = req.session.user;
    if(!user){
        res.status(401).redirect('/');
    }else{
        //const book = await Book.findById(req.params.id);
        const books = await BookItem.find(req.query);
        return res.status(200).render('items', {data:{user,books}})
    };
});

router.post('/additem/:id',async(req,res,next)=>{
    const user = req.session.user;
    if(!user){
        res.status(401).redirect('/');
    }else{
        const book = await Book.findById(req.params.id);
        const item = {
            title: book.title,
            author: book.author,
            bookRef: book._id
        };
        const bookItem = await BookItem.create(item);
        const bookUpdate = await Book.findByIdAndUpdate(req.params.id,{quantity: book.quantity + 1}, {new:true});
        res.status(200).redirect(`/books/items?bookRef=${req.params.id}`);
    };
});

router.post('/deleteitem/:id', async(req,res,next)=>{
    const user = req.session.user;
    if(!user){
        res.status(401).redirect('/');
    }else{
        const item = await BookItem.findByIdAndDelete(req.params.id);
        const updateBook = await Book.findById(item.bookRef);
        const updated = await Book.findByIdAndUpdate(updateBook._id, {quantity: updateBook.quantity - 1});
        
        res.status(200).redirect(`/books/items?bookRef=${updated._id}`);

    }
});

router.post('/add', async(req,res,next)=>{
    const user = req.session.user;
    if(!user){
        res.status(401).redirect('/');
    }else{
        const book = await Book.create(req.body);
        req.body.bookRef = book._id;

        const items = [];
        for (let i = 0; i < req.body.quantity; i++) {
            items.push(req.body);
        };

        const books = await BookItem.insertMany(items);
        res.status(200).redirect('/books');
    };
});

router.post('/deletebook/:id', async(req,res,next)=>{
    const user = req.session.user;
    if(!user){
        res.status(401).redirect('/');
    }else{
        const book = await Book.findByIdAndDelete(req.params.id);
        const items = await BookItem.deleteMany({bookRef:book._id});
        res.status(200).redirect('/books');
    };
});

const setAvailability = async(id)=>{
    let books = await BookItem.find({bookRef:id});
    let flag = false;
    books.forEach(book => {
        if(book.status == "available"){ flag = true}
    });
    if(flag){
        let book = await Book.findByIdAndUpdate(id, {status:'available'});
    }else{
        let book = await Book.findByIdAndUpdate(id, {status:"not available"});
    };
};
// reserving a book with userId and boookId
router.post('/reserve/:id',async (req, res, next)=>{       
    const user = req.session.user;
    if(!user){
        res.status(401).redirect('/');
    }else if(user.fine > 0){
        res.status(200).redirect('/fine');
    }else{ 
        const filter = {
            bookRef: req.params.id,
            status : 'available',
        };
        const update = { 
            status: "reserved",
            user: {
                id: user._id,
                reserveDate: new Date()
            }
        };
        const item = await BookItem.findOneAndUpdate(filter, update, {new:true});
        setAvailability(item.bookRef);
        res.status(200).redirect('/mybooks'); //need to handle this with a script
    };
});

//Cancel Reserve
router.post('/cancel/:id', async(req,res,next)=>{
    const user = req.session.user;
    if(!user){
        res.status(401).redirect('/');
    }else{
    const update = {
        status: "available",
        user: {
            id: null,
            reserveDate: null
            }
        };
    const book = await BookItem.findByIdAndUpdate(req.params.id, update);
    //Set Book available
    const books = await Book.findByIdAndUpdate(book.bookRef, {status:'available'});
    (user.role == 'user')? res.redirect('/mybooks'):res.redirect('/reservations');
    }
});

router.post('/issue/:id', async(req,res,next)=>{
    const user = req.session.user;
    if(!user){
        res.status(401).redirect('/');
    }else{
        const book = await BookItem.findById(req.params.id);
        const update = {
            status : 'issued',
            user: { 
                id: book.user.id,
                reserveDate: book.user.reserveDate,
                issueDate : new Date(),
                dueDate : (new Date()).setDate((new Date()).getDate() + 4)
            }
        }
        const books = await BookItem.findByIdAndUpdate(req.params.id, update);
        res.status(200).redirect('/reservations');
    };
});

router.post('/return/:id', async(req,res,next)=>{
    const user = req.session.user;
    if(!user){
        res.status(401).redirect('/');
    }else{
        (user.role == 'admin')? res.redirect(307,`/books/cancel/${req.params.id}`):res.status(401).redirect('/mybooks');
    }
});

module.exports = router;