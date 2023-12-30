const mongoose = require('mongoose');

const Product = require('./model/product');

mongoose.connect('mongodb://127.0.0.1:27017/farmStand').then(() =>{
    console.log("Mongo Connection is Open!!!!")

}).catch(err => {
    console.log("Oh no Mongo Error!!!!")
    console.log(err)
});

// const p = new Product({
//     name: 'Ralph lauren',
//     price: 1.99,
//     category: 'fruit'
// })

// p.save().then(p => {
//     console.log(p)
// })
// .catch(e => {
//     console.log(e)
// })

const seedProduct = [
    {
        name: 'Fair eggplant',
        price: 1.02,
        category: 'vegetables'
    },
    {
        name: 'Organic dates',
        price: 3.80,
        category: 'fruit'
    },
    {
        name: 'Organic seedless watermelon',
        price: 3.99,
        category: 'fruit'
    },
    {
        name: 'Organic celery',
        price: 4.80,
        category: 'vegetables'
    },
    {
        name: 'Chocolate whole milk',
        price: 6.00,
        category: 'dairy'
    },
    {
        name: 'Amul Paneer',
        price: 7.80,
        category: 'dairy'
    },
]

Product.insertMany(seedProduct)
.then(res => {
    console.log(res)
}).catch(e => {
    console.log(e)
})