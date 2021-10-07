var router = require('express').Router();
var orderupCtrl = require('../controllers/orderup');


// GET /user
router.get('/orderup', orderupCtrl.index);
router.get('/orderup/:id/order',isLoggedIn, orderupCtrl.newPage)
router.get('/orderup/:id/checkout',isLoggedIn, orderupCtrl.checkout)
router.get('/orderup/:id/submit',isLoggedIn, orderupCtrl.submit)

router.post('/orderup/new', isLoggedIn, orderupCtrl.startOrder);
router.post('/orderup/order',isLoggedIn, orderupCtrl.selectRetaurant);
router.post('/orderup/:id/checkout',isLoggedIn, orderupCtrl.checkoutOrder);
router.post('/orderup/:id/submit', isLoggedIn, orderupCtrl.submitOrder);

router.delete('/orderup/:id/order',isLoggedIn, orderupCtrl.removeItem);
router.delete('/orderup/:id/checkout',isLoggedIn, orderupCtrl.removeItemCheckout);
router.delete('/orderup/:id/index',isLoggedIn, orderupCtrl.deleteOrder);



function isLoggedIn(req, res, next) {

	if ( req.isAuthenticated() ) return next();
	res.redirect('/auth/google');
}


module.exports = router;
