const mongoose = require('mongoose');

const Schema = mongoose.Schema

const productSchema = new Schema({
    title: {
        type: String,
        require: true
    },
    price: {
        type: Number,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    imageUrl: {
        type: String,
        require: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Product', productSchema);

// const getDb = require('../util/database').getDb;
//  const mongodb = require('mongodb');

// class Product {
//     constructor(title, price, description, imageUrl, id, userId) {
//         this.title = title;
//         this.price = price;
//         this.description = description;
//         this.imageUrl = imageUrl;
//         this._id = id
//         this.userId = userId;
//     }

//     save() {
//         const db = getDb();
//         let dpOp; // operations
//         if (this._id) {
//            dpOp = db
//            .collection('products').updateOne({_id:this._id},  {$set: this} );// $set describes the changes i want to make instead of explicitly telling it to replace
           
//         }
//         else {
//             dpOp = db
//             .collection('products').insertOne(this) // what collection i want to connect to?
//         }

//         return dpOp
//         .then(result => {
//             console.log(result)
//         })
//         .catch(err => console.log("error: ", err));
//     }
//     static fetchAll() {
//         const db = getDb();
//         // returns a cursor, which makes us go through our collection step by step instead of all at once
//         return db.collection('products').find().toArray() // could have filters, but rn it fetches all
//         .then(products => {
//             console.log(products)
//             return products
//         })
//         .catch(err => console.log(err));
//     }
//     static findByPk(prodId) {
//         const db = getDb();
//         return db
//         .collection('products')
//         // next() returns that next object the cursor is pointing at 
//         .find({_id: new mongodb.ObjectId(prodId)}) // _id is keyword in mongo
//         .next()
//         .then( product => {
//             console.log(product)
//             return product;
//         })
//         .catch(err => console.log(err));
//     }
//     static deleteById(prodId) {
//         const db = getDb();
//         return db.collection('products').deleteOne({_id: new mongodb.ObjectId(prodId)})
//         .then(result => {
//             console.log('Deleted');
//         })
//         .catch(err => console.log(err));
//     }

// }


// module.exports = Product;

