const User = require('../models/user');
const Documenu = require('../models/documenu.js');

module.exports = {
  index,
  addFact,
  startOrder
};


function addFact(req, res) {
  req.user.facts.push(req.body);
  // req.user is a mongoose document
  // where did we assign the mongoose document to req.user
  console.log(req.user)
  req.user.save(function (err) {
    res.redirect('/orderup')
  })
}

function index(req, res, next) {
  console.log(req.user, 'req.user')
  // Make the query object to use with user.find based up
  // the user has submitted the search form or now
  let modelQuery = req.query.name ? { name: new RegExp(req.query.name, 'i') } : {};
  // Default to sorting by name
  let sortKey = req.query.sort || 'name';
  User.find(modelQuery)
    .sort(sortKey).exec(function (err, users) {
      if (err) return next(err);
      // Passing search values, name & sortKey, for use in the EJS
      res.render('orderup/index', {
        users,
        user: req.user,
        name: req.query.name,
        sortKey,
        title: 'ORDER UP'
      });
    });
}

async function startOrder(req, res, next) {
  const params = {
    'fullmenu': true
  }
  let result = await Documenu.Restaurants.getByZipCode('91789', params);
  Documenu.Restaurants.getByZipCode('91789', params)
    .then(data => {
      console.log(data)
      // console.log(res.data[0].menus[0].menu_sections[0].menu_items);
      res.render('orderup/new', {
        title: 'Start A Group Order',
        restaurants: data.data

      })
    });
}
