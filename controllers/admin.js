const Product = require('../models/product');
const mongodb = require('mongodb');
const { validationResult } = require('express-validator')
fileHelper = require('../util/file');

exports.getAddProducts = (req, res, next) => {
    if (!req.session.isLoggedIn)
        return res.redirect('/login')

        res.render('admin/edit-product', {
        pageTitle: 'Add Product', 
        path: '/admin/add-product',
        hasError: false,
        editing: false,
        errorMessage: [],
        validationErrors: []
    })
}

exports.postAddProduct = (req, res, next) => { 
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    if (!image) {
        return res.status(422).render('admin/edit-product', {
             pageTitle: 'Add Product',
             path: '/admin/add-product',
             editing: false,
             hasError: true,
             product: {
                 title,
                 price, 
                 description
             },
             errorMessage: "Please attach an image.",
             validationErrors:  []
         });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       return  res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            product: {
                title,
                price, 
                description
            },
            errorMessage: errors.array()[0].msg,
            validationErrors:  errors.array()
        });
    }
    const imageUrl = image.path;
   const product = new Product({title: title, 
    price: price, 
    imageUrl,
    description: description, 
    userId: req.session.user

});

   product.save() // save() is in mongoose
    .then(
        result => {
            console.log('Created Product');
            res.redirect('/admin/products')
        }
        
    )
     .catch(err => {
    //     return  res.status(500).render('admin/edit-product', {
    //         pageTitle: 'Edit Product',
    //         path: '/admin/add-product',
    //         editing: true,
    //         hasError: true,
    //         product: {
    //             title,
    //             imageUrl,
    //             price, 
    //             description,
    //             _id: prodId
    //         },
    //         errorMessage: "Database operation failed, please try again.",
    //         validationErrors:  []
    //     });
    // res.redirect('/500');
    
    const error = new Error(err);
    error.httpsStatuCode = 500;
    // passed to a special 4 arg middleware that handles errors
    return next(error);
    })
};


exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) return res.redirect('/');
    
    // from the name passed in the router (:productId) 
    // we can extract the product ID from the url
    const prodId = req.params.productId;

   Product.findById(prodId)

    // after recieving the product, callback product is executed
   // Product.findByPk(prodId)
    .then(product => {
        if (!product) {
            return res.redirect('/');
        }
        res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: editMode,
            product: product,
            hasError: false, 
            errorMessage: [],
            validationErrors: []
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpsStatuCode = 500;
        // passed to a special 4 arg middleware that handles errors
        return next(error);
})
}

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const image = req.file;
    const updatedDesc = req.body.description;
  
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(422).render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: true,
        hasError: true,
        product: {
          title: updatedTitle,
          price: updatedPrice,
          description: updatedDesc,
          _id: prodId
        },
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array()
      });
    }
  
    Product.findById(prodId)
      .then(product => {
        if (product.userId.toString() !== req.user._id.toString()) {
          return res.redirect('/');
        }
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.description = updatedDesc;
        // if the user uploaded a new image
        if (image) {
          fileHelper.deleteFile(product.imageUrl);
          product.imageUrl = image.path;
        }
        return product.save().then(result => {
          console.log('UPDATED PRODUCT!');
          res.redirect('/admin/products');
        });
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  };
 exports.getProducts = (req, res, next) => {
    Product.find({userId: req.user._id})
    .then(products => {
        res.render('admin/products', {
            prods: products,
            pageTitle: 'Admin Products',
            path: '/admin/products'
        });
    })
    .catch(err => console.log(err));;
   
}

exports.deleteProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId).then( product => {
        if (!product) {
            return next(new Error('Product not found'))
        }
        fileHelper.deleteFile(product.imageUrl);
        return Product.deleteOne({_id: prodId, userId: req.user._id})
    }
    )
    .then( () => {
        console.log('DELETED PRODUCT!')
        // instead of redirecting, we send JSON behind the scenes
        res.status(200).json({message: 'Success!'});
    })
    .catch(err => {
        res.status(500).json({message: 'Deleting failed!'});
    })
}
