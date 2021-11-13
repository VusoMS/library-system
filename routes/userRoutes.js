const express = require('express');
const BookItem = require('../models/bookItemModel');
const Book = require('../models/bookModel')
const User = require('../models/userModel');
//const AppError = require('../utils/appError');
const router = express.Router();


router.post('/signup', async (req,res,next)=>{
    const user = await User.create(req.body)
    
    req.session.user = user;
    req.session.save();
    res.status(200).redirect('/home');
 });

router.post('/login', async(req,res,next)=>{
    const { email, password } = req.body;

    //CHECK IF EMAIL/PASSWORD IS CORRECT
    if (!email || !password) {
        return next(new AppError('Please provide email and password'), 400);
    }

    //CHECK IF USER EXISTS AND PASSWORD IS CORRECT
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
        res.status(401).json({
            status: 'failed',
            message: "Wrong email or password"
        });
    }else if(user.role == 'user'){
        req.session.user = user;
        req.session.save();
        res.status(200).redirect('/home');
    }else{
        req.session.user = user;
        req.session.save(); 
        res.status(200).redirect('/dashboard');
    };
});

router.get('/signout', (req,res,next)=>{
    req.session.destroy();
    res.redirect('/')
});

router.post('/cancel/:id', async(req,res,next)=>{
    const user = req.session.user;
    if(!user){
        res.status(401).redirect('/');
    }else if(user.role == 'user'){
        res.status(401).redirect('/home');
    }else{
        const member = await User.findByIdAndDelete(req.params.id);
        const unreturnedBooks = await BookItem.deleteMany({"user._id":req.params.id, status:"issued"});
        res.status(200).redirect('/members');
    }
});

const setOverdue = async function(){
    const loaned = await BookItem.find({status:'issued'});
    for(let i=0; i<loaned.length;i++){
        let book = await BookItem.findByIdAndUpdate(loaned[i]._id, {status:'overdue'});
    }
}

router.get('/dashboard', async(req,res,next)=>{
    const user = req.session.user;
    if(!user){
        res.status(401).redirect('/');
    }else{
        //Perfom an update of updating status of overdue books
        setOverdue();
        
        const users = (await User.find({})).length
        const books = (await Book.find({})).length
        const bookItems = (await BookItem.find({})).length
        const reserved = (await BookItem.find({status:"reserved"})).length
        const issued = (await BookItem.find({status:'issued'})).length
        const overdue = (await BookItem.find({status:'overdue'})).length

        const info = { users,books,bookItems,reserved,issued,overdue }
        res.status(200).render('dashboard', {data:{user, info}}); }
});

router.get('/reservations', async(req,res,next)=>{
    const user = req.session.user;
    if(!user){
        res.status(401).redirect('/');
    }else{
        const reserved = await BookItem.find({status:'reserved'});
        const issued = await BookItem.find({status:'issued'});
        res.status(200).render('reservations', {data:{user,reserved,issued}})
    }
});

router.get('/new', async(req,res,next)=>{
    const user = req.session.user;
    if(!user){
        res.status(401).redirect('/');
    }else{
        res.status(200).render('addbook', {data:{user}});
    };
});

router.get('/home',async (req,res,next)=>{
    const user = req.session.user;
    if(!user){
        res.status(401).redirect('/');
    }else{ res.status(200).render('home', {data:{user}}); }
});

router.get('/me', (req,res,next)=>{
    const user = req.session.user;
    if(!user){
        res.status(401).redirect('/');
    }else{ res.status(200).render('profile', {data:{user}}); }
});

router.post('/update',async (req,res,next)=>{
    const user = req.session.user;
    if(!user){
        res.status(401).redirect('/');
    }else{ 
        const update = {
            firstName: (req.body.firstName=='') ? user.firstName : req.body.firstName,
            lastName: (req.body.lastName=='') ? user.lastName : req.body.lastName,
            email: (req.body.email=='') ? user.email : req.body.email
        }
        const profile = await User.findByIdAndUpdate(user._id, update, {new:true});
        req.session.user = profile;
        req.session.save();
        res.status(200).redirect('/me');
    }
});

router.get('/mybooks', async(req,res,next)=>{
    const user = req.session.user;
    if(!user){
        res.status(401).redirect('/');
    }else{
        const reserved = await BookItem.find({"user.id":user._id, status:'reserved'});
        const issued =   await BookItem.find({"user.id":user._id, status:'issued'});

        res.status(200).render('mybooks', {data:{user,reserved,issued}});
    };
});

router.get('/fine', async(req,res,next)=>{
    const user = req.session.user;
    if(!user){
        res.status(401).redirect('/');
    }else{
        res.status(200).render('payment',{data:{user}});
    };
});

router.post('/pay', async(req,res,next)=>{
    const user = req.session.user;
    if(!user){
        res.status(401).redirect('/');
    }else{
        const updatedUser = await User.findByIdAndUpdate(user._id, {fine:0}, {new:true});
        req.session.user = updatedUser;
        req.session.user.save();
        res.status(200).redirect('/me');
    };
});

router.get('/members',async (req,res,next)=>{
    const user = req.session.user;
    if(!user){
        res.status(401).redirect('/');
    }else{
        const users = await User.find({});
        res.status(200).render('members',{data:{user,users}});
    };
});

router.get('/reports', async(req,res,next)=>{
    const user = req.session.user;
    if(!user){
        res.status(401).redirect('/');
    }else{
        setOverdue();
        const loan = await BookItem.find({status:'issued'});
        const overdue = await BookItem.find({status:'overdue'});
        res.status(200).render('reports', {data:{user,loan,overdue}});
    }
    
});

module.exports = router;