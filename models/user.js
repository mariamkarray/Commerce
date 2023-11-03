const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        // product ID stores a reference of a product (object ID)
        items: [
            {
                productId: {type: Schema.Types.ObjectId, ref: 'Product', required: true},
                quantity: { type: Number, required: true } 
                }
            ], // store an array of docs 
    }
});

userSchema.methods.addToCart = function(product) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
        // returns from the callback function not the addToCart()
        return cp.productId.toString() === product._id.toString();
    });
    // default quantity 
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    // if item is in cart (value is not -1)
    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    }
    else { 
        updatedCartItems.push(
        {productId:product._id, 
        quantity: newQuantity})
    }

    const updatedCart = {
        items: updatedCartItems
    };
    this.cart = updatedCart
    return this.save();
}
userSchema.methods.removeFromCart = function(productId) {
    const updatedCartItems = this.cart.items.filter(item => {
        return item._id.toString() !== productId.toString();
    })
    this.cart.items = updatedCartItems;
    return this.save();
}

userSchema.methods.clearCart = function(productId) {
    this.cart = {items: []};
    return this.save();
}


module.exports = mongoose.model('User', userSchema);

// const getDb = require('../util/database').getDb;
// const mongodb = require('mongodb');
// const { getOrders } = require('../controllers/shop');

// class User {
//     constructor(username, email, cart, id) {
//         this.name = username;
//         this.email = email;
//         this.cart = cart; // {items: []}
//         this._id = id;
//     }
//     save() {

//     }
//     static save() {
//         const db = getDb();
//         let dpOp; // operations
//         dpOp = db
//         .collection('users').insertOne(this) 
//         return dpOp
//         .then(result => {
//             console.log(result)
//         })
//         .catch(err => console.log("error: ", err));
//     }

//     addToCart(product) {
//         const cartProductIndex = this.cart.items.findIndex(cp => {
//             // returns from the callback function not the addToCart()
//             return cp.productId.toString() === product._id.toString();
//         });
//         // default quantity 
//         let newQuantity = 1;
//         const updatedCartItems = [...this.cart.items];

//         // if item is in cart (value is not -1)
//         if (cartProductIndex >= 0) {
//             newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//             updatedCartItems[cartProductIndex].quantity = newQuantity;
//         }
//         else { 
//             updatedCartItems.push(
//             {productId: new mongodb.ObjectId(product._id), 
//             quantity: newQuantity})
//         }

//         const updatedCart = {
//             items: updatedCartItems
//         };
//         // update user to store cart in there
//         const db = getDb();
//         return db.collection('users').updateOne(
//         { _id: new mongodb.ObjectId(this._id)},
//         { $set: {cart: updatedCart} })
//     }

//     getCart() {
//         const db = getDb();
//         // mapping array of items where every item is an object into an array of strings (IDs)
//         const productIds = this.cart.items.map(i => {
//             return i.productId;
//         })
//         // find all the products in the cart
//         return db
//         .collection('products').find({
//             // mongodb operator in takes an array of IDs
//             // which will be accepted 
//             // gives me all elements where the ID is one of the IDs mentioned in this array here.
//             _id: {$in: productIds}}).toArray()
//             .then(
//                 products => {
//                     // gives me the product object, i want the quantity
//                     return products.map(p => {
//                         return {...p, quantity: this.cart.items.find(i => {
//                             return i.productId.toString () === p._id.toString();
//                         }).quantity
//                     }
//                     });
//                 });
//         }

//         deleteItemFromCart(prodId) {
//             const db = getDb();
//             return db.collection('users').updateOne({_id: this._id},
//                 {
//                     $pull: { "cart.items": { productId: new mongodb.ObjectId(prodId) } } 
//                 })}

//         addOrder() {
//             const db = getDb();
//             return this.getCart()
//             .then(products => {
//                 const order = {
//                     items: products,
//                     user: {
//                         _id: new mongodb.ObjectId(this._id),
//                         name: this.name
//                     }
//                 };
//                 return db.collection('orders').insertOne(order)
//             })
//             .then(result => {
//                 this.cart = {items: []};
//                 return db.collection('users').updateOne({_id: new mongodb.ObjectId(this._id)},
//                     {
//                         $set: { cart: { items: []} } 
//                     })
//             })
//     }

    
//     // find orders for a given user
//     getOrders() {
//         const db = getDb();
//         return db.collection('orders').find({'user._id': new mongodb.ObjectId(this._id)})
//         .toArray()
//     }

//     static findByPk(userId) {
//         const db = getDb();
//         return db
//         .collection('users')
//         // next() returns that next object the cursor is pointing at 
//         .findOne({_id: new mongodb.ObjectId(userId)})
//         .then( user => {
//             console.log(user)
//             return user;
//         })
//         .catch(err => console.log(err));
//     }
// }

// module.exports = User;