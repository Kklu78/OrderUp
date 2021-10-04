var router = require('express').Router();
var orderupCtrl = require('../controllers/orderup');


// GET /user
router.get('/orderup', orderupCtrl.index);
router.get('/orderup/:id/order',isLoggedIn, orderupCtrl.newPage)
router.get('/orderup/:id/checkout',isLoggedIn, orderupCtrl.checkout)





// Authorizing the user to use a route
// probably only want to use this on
// post, put or delete routes
function isLoggedIn(req, res, next) {
	// req.isAuthenticated() this is given to us by passport
	// it returns true or false
	if ( req.isAuthenticated() ) return next(); // next() go to the next function in middleware
	res.redirect('/auth/google');
}

router.post('/orderup/new', isLoggedIn, orderupCtrl.startOrder);
router.post('/orderup/order',isLoggedIn, orderupCtrl.selectRetaurant);
router.post('/orderup/:id/checkout',isLoggedIn, orderupCtrl.checkoutOrder);
router.delete('/orderup/:id/order',isLoggedIn, orderupCtrl.removeItem);
router.delete('/orderup/:id/checkout',isLoggedIn, orderupCtrl.removeItemCheckout);


module.exports = router;
