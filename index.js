const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const Product = require('./model/product')
const methodOverride = require('method-override')
const AppError = require('./AppError');

mongoose.connect('mongodb://127.0.0.1:27017/farmStand').then(() =>{
    console.log("Mongo Connection is Open!!!!")

}).catch(err => {
    console.log("Oh no Mongo Error!!!!")
    console.log(err)
});

app.set('views', path.join(__dirname,'views'))
app.set('view engine','ejs');

//middleware
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))

const categories = ['fruit','vegetables','dairy'];

///filter by category////
app.get('/products', async(req,res) => {
    const { category } = req.query;
    if(category) {
        const products = await Product.find({ category });
        res.render('products/index', { products,category });

    }
    else{
        const products = await Product.find({})
        res.render('products/index', { products, category: 'All' });

    }
    //const products = await Product.find({})
    //res.render('products/index', { products})
})

//**** form to add new product */
app.get('/products/new',(req,res) => {
    //throw new AppError('Not Allowed',401)
    res.render('products/new',{categories})
})

//*******Create/Add new product*******
app.post('/products',wrapAsync(async(req,res,next)=>
{
    try{
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.redirect(`/products/${newProduct._id}`)
}catch(e)
{
    next(e);
}
    //console.log(newProduct)
    //res.send("making your product")
}))

function wrapAsync(fn){
    return function(req, res, next){
        fn(req, res,next).catch(e => next(e))
    }
}
//*********show list ofall products************
app.get('/products/:id',wrapAsync(async(req,res,next) => {
    const {id} = req.params;
    const product = await Product.findById(id);
    //console.log(product);
    if(!product){
       throw new AppError('Product not Found',404);
    }
    res.render('products/show',{product})
    //res.send('Detail product list')
}))

//***********Edit the form************
app.get('/products/:id/edit',wrapAsync(async(req,res) => {
    const {id} = req.params;
    const product = await Product.findById(id);
    res.render('products/edit',{product,categories})
}))


///*****Edit list***** */
app.put('/products/:id',wrapAsync(async(req,res,next) => {
    try{
    const {id} = req.params;
   const product = await Product.findByIdAndUpdate(id,req.body, {runValidators:true,new: true });
//    if(!product){
//     return next(new AppError('Product not Found',404))
//  }
   res.redirect(`/products/${product._id}`)
    }catch(e){
        next(e);
    }
    // console.log(req.body)
    // res.send('PUT!!!!');
}))


//**********delete the products********* */
app.delete('/products/:id',wrapAsync(async(req,res) => {
    const {id} = req.params;
  const deleteProduct = await Product.findByIdAndDelete(id);
  res.redirect('/product');
    //res.send("You made it!!!")
}))

const handleValidationErr = err => {
    console.dir(err);
    return new AppError(`Validation Failed...${err.message}`,400)
}

app.use((err,req,res,next) => {
    console.log(err.name);
    if(err.name === 'ValidationError') err = handleValidationErr(err)
    next(err);
})

app.use((err,req,res,next)=>{
    const {status = 500, message='Something went wrong'} = err;
    res.status(status).send(message);
})
app.listen(3000, () => {
    console.log("App is listening");
})
