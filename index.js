const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const Product = require('./model/product')
const Farm = require('./model/farm')
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


//FARM ROUTES

//index page for FARM
app.get('/farms',async(req,res)=>{
    const farms = await Farm.find({});
    res.render('farms/index',{farms})
})

//Create new farm FORM
app.get('/farms/new', (req,res) => {
    res.render('farms/new')
})

//Show all the list of Farms
app.get('/farms/:id',async(req,res) => {
    const farm = await Farm.findById(req.params.id).populate('products');
    console.log(farm);
    res.render('farms/show',{farm})
})

//Delete the Farm with specific ID
app.delete('/farms/:id',async(req,res) => {
    //console.log("DELETINGGGG!!!!")
    const farm = await Farm.findByIdAndDelete(req.params.id);
    res.redirect('/farms');
})

app.post('/farms', async(req,res) => {
    const farm = new Farm(req.body);
    await farm.save();
    res.redirect('./farms')
})

//farm id is connected with products so its nested Routing means with the help of Farm ID we will be able to get Product details.
app.get('/farms/:id/products/new', async(req,res) => {
    const {id} = req.params;
    const farm = await Farm.findById(id);
    res.render('products/new', {categories,farm})
})

app.post('/farms/:id/products',async(req,res) => {
    const {id} = req.params;
    const farm = await Farm.findById(id);
    const {name,price,category} = req.body;
    const product = new Product({name,price,category});
    farm.products.push(product);
    product.farm = farm;
    await farm.save();
    await product.save();
    //res.send(farm);
    res.redirect(`/farms/${farm.id}`);
})


//PRODUCT ROUTES
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
app.get('/products/:id',async(req,res,next) => {
    const {id} = req.params;
    const product = await Product.findById(id).populate('farm','name');
    console.log(product);
    //console.log(product);
    // if(!product){
    //    throw new AppError('Product not Found',404);
    // }
    res.render('products/show',{product});
    //res.send('Detail product list')
})

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
