const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const Product = require('./model/product')
const methodOverride = require('method-override')

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
    res.render('products/new',{categories})
})

//*******Create/Add new product*******
app.post('/products', async(req,res)=>
{
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.redirect(`/products/${newProduct._id}`)
    //console.log(newProduct)
    //res.send("making your product")
})

//*********show list ofall products************
app.get('/products/:id',async(req,res) => {
    const {id} = req.params;
    const product = await Product.findById(id);
    console.log(product);
    res.render('products/show',{product})
    //res.send('Detail product list')
})

//***********Edit the form************
app.get('/products/:id/edit',async(req,res) => {
    const {id} = req.params;
    const product = await Product.findById(id);
    res.render('products/edit',{product,categories})
})


///*****Edit list***** */
app.put('/products/:id', async(req,res) => {
    const {id} = req.params;
   const product = await Product.findByIdAndUpdate(id,req.body, {runValidators:true,new: true });
   res.redirect(`/products/${product._id}`)
    // console.log(req.body)
    // res.send('PUT!!!!');
})


//**********delete the products********* */
app.delete('/products/:id',async(req,res) => {
    const {id} = req.params;
  const deleteProduct = await Product.findByIdAndDelete(id);
  res.redirect('/product');
    //res.send("You made it!!!")
})
app.listen(3000, () => {
    console.log("App is listening");
})
