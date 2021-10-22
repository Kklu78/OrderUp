const User = require('../models/user');
const Documenu = require('../models/documenu');
const OrderUp = require('../models/orderup')
const UserOrder = require('../models/userorder')
const Restaurants = require('../models/restaurant')


module.exports = {
  index,
  startOrder,
  selectRetaurant,
  checkoutOrder,
  checkout,
  newPage,
  removeItem,
  removeItemCheckout,
  submitOrder,
  submit,
  deleteOrder
};

//Render Functions

//index(homepage)
async function index(req, res, next) {
  try {
    let users = await User.find({})
    let allUserOrders = await UserOrder.find({})

    if (req.user) {
      let userOrders = await UserOrder.find({ userId: req.user._id, closed: false })

      let OrderIds = []
      userOrders.forEach(o =>
        OrderIds.push(o.orderId))
      let mainOrders = await OrderUp.find({ _id: { $in: OrderIds } })

      let orderRest = new Set()
      mainOrders.forEach(o =>
        orderRest.add(o.restaurantId))
      orderRest = Array.from(orderRest)

      let restaurantslist = []

      Restaurants.forEach(x => {
        if (orderRest.includes(x.restaurant_id.toString())) {
          restaurantslist.push(x)
        }
      })
      // for await (const r of orderRest) {
      //   let restaurant = await Documenu.Restaurants.get(r)
      //   restaurants.push(restaurant.result)
      // }


      res.render('orderup/index', {
        users,
        userOrders,
        user: req.user,
        title: '',
        order: '',
        restaurants: restaurantslist,
        mainOrders,
        allUserOrders
      });

    } else {
      userOrders = null


      res.render('orderup/index', {
        users,
        userOrders,
        user: req.user,
        title: '',
        order: '',
        restaurants: '',
        mainOrders: '',
        allUserOrders: ''
      });

    }



  } catch (err) {
    console.log(err)
  }
}

//select restaurantpage(new.ejs)
async function startOrder(req, res, next) {
  try {
    let friendsList = await User.find({ _id: { $ne: req.user._id } })

    res.render('orderup/new', {
      title: 'Select A Restaurant',
      restaurants: Restaurants,
      friendsList


    })



    // const params = {
    //   'fullmenu': true
    // }

    // Documenu.Restaurants.getByZipCode(req.body.zipcode, params)
    //   .then(data => {

    //     res.render('orderup/new', {
    //       title: 'Select A Restaurant',
    //       restaurants: data.data,
    //       friendsList


    //     })
    //   });
  } catch (err) {
    console.log(err)
    res.send(err)
  }
}
//order page (order.ejs)
async function newPage(req, res, next) {
  try {
    let createdOrder = await OrderUp.findById(req.params.id)
    let restaurant = Restaurants.filter(x => x.restaurant_id.toString() === createdOrder.restaurantId)[0]

    // let restaurant = await Documenu.Restaurants.get(createdOrder.restaurantId)
    let userOrders = await UserOrder.find({ userId: req.user._id, orderId: createdOrder._id })
    let userOrder = await UserOrder.findById(userOrders[0]._id)
    console.log(restaurant)
    res.render(`orderup/order`, {
      title: 'Order',
      restaurant: restaurant,
      order: createdOrder,
      userOrder

    })

  } catch (err) {
    console.log(err)
  }
}
//checkout page (checkout.ejs)
async function checkout(req, res, next) {
  try {
    let createdOrder = await OrderUp.findById(req.params.id)
    let restaurant = Restaurants.filter(x => x.restaurant_id.toString() === createdOrder.restaurantId)[0]

    // let restaurant = await Documenu.Restaurants.get(createdOrder.restaurantId)
    let userOrders = await UserOrder.find({ orderId: createdOrder._id })
    let users = await User.find({})

    let totalOrder = {}
    userOrders.forEach(o => {
      for (const i in o.order) {
        totalOrder[i] = totalOrder[i] ? Number(totalOrder[i]) + Number(o.order[i]) : o.order[i]
      }
    })

    res.render('orderup/checkout', {
      title: 'Checkout',
      restaurant,
      order: createdOrder,
      userOrders,
      users,
      totalOrder
    })
  } catch (err) {
    console.log(err)
  }
}

//submit page (thankyou.ejs)
async function submit(req, res, next) {
  try {
    let createdOrder = await OrderUp.findById(req.params.id)

    res.render(`orderup/thankyou`, {
      title: 'Thank You'
    })


  } catch (err) {
    console.log(err)
  }
}

//Post Functions


//selects restaurant //creates main order //creats user orders
//(new.ejs)
async function selectRetaurant(req, res, next) {
  try {
    let newOrder = {}
    for (let i = (Object.keys(req.body).length - 2); i < Object.keys(req.body).length; i++) {
      newOrder[Object.keys(req.body)[i]] = req.body[Object.keys(req.body)[i]]
    }
    let createdOrder = await OrderUp.create(newOrder)

    let currentUser = {}
    currentUser[req.user._id] = 'on'
    req.body = Object.assign(currentUser, req.body)

    let userOrders = []
    for (let i = 0; i < Object.keys(req.body).length - 2; i++) {
      let x = {}
      let userObj = await User.findById(Object.keys(req.body)[i])
      x['userId'] = userObj._id
      x['orderId'] = createdOrder._id
      x['order'] = {}
      let userOrder = await UserOrder.create(x)
      userOrders.push(userOrder._id)
    }
    createdOrder['userOrders'] = userOrders
    await createdOrder.save()



    res.redirect(`/orderup/${createdOrder._id}/order`)


  } catch (err) {
    console.log(err)

  }

}

//updates cart//submits order
//order.ejs
async function checkoutOrder(req, res, next) {
  try {
    let order = await OrderUp.findById(req.params.id)
    // let restaurant = await Documenu.Restaurants.get(order.restaurantId)
    let userOrders = await UserOrder.find({ userId: req.user._id, orderId: order._id })
    let userOrder = await UserOrder.findById(userOrders[0]._id)
    for (const x in req.body) {
      req.body[x] = Array.isArray(req.body[x]) ? req.body[x].reduce((a, b) => Number(a) + Number(b)) : req.body[x]
    }


    for (const item in req.body) {
      if (req.body[item] > 0) {
        userOrder.order[item] = userOrder.order[item] ? Number(userOrder.order[item]) + Number(req.body[item]) : req.body[item]
      }
    }
    await userOrder.markModified('order')
    await userOrder.save()




    if (req.body.update) {
      res.redirect(`/orderup/${userOrder.orderId}/order`)
    } else {
      res.redirect(`/orderup/${userOrder.orderId}/checkout`)

    }
  } catch (err) {
    console.log(err)
  }
}

//archives order(will not show up as open orders)
//checkout.ejs
async function submitOrder(req, res, next) {
  try {
    let createdOrder = await OrderUp.findById(req.params.id)
    createdOrder.closed = true
    await createdOrder.markModified('closed')
    await createdOrder.save()
    let userOrders = await UserOrder.find({ orderId: createdOrder._id })

    for await (const o of userOrders) {
      o.closed = true
      await o.markModified('closed')
      await o.save()
    }
    res.redirect(`/orderup/${createdOrder._id}/submit`)

  } catch (err) {
    console.log(err)
  }
}


//Delete Functions

//(order.ejs)
async function removeItem(req, res, next) {
  try {
    let createdOrder = await OrderUp.findById(req.params.id)
    let restaurant = Restaurants.filter(x => x.restaurant_id.toString() === createdOrder.restaurantId)[0]
    // let restaurant = await Documenu.Restaurants.get(createdOrder.restaurantId)
    let userOrders = await UserOrder.find({ userId: req.user._id, orderId: createdOrder._id })
    let userOrder = await UserOrder.findById(userOrders[0]._id)
    delete userOrder.order[req.body.delete]
    await userOrder.markModified('order')
    await userOrder.save()

    res.redirect(`/orderup/${userOrder.orderId}/order`)

  } catch (err) {
    console.log(err)
  }
}

//(checkout.ejs)
async function removeItemCheckout(req, res, next) {
  try {
    let createdOrder = await OrderUp.findById(req.params.id)
    let userOrders = await UserOrder.find({ userId: req.user._id, orderId: createdOrder._id })
    let userOrder = await UserOrder.findById(userOrders[0]._id)
    delete userOrder.order[req.body.delete]
    await userOrder.markModified('order')
    await userOrder.save()

    res.redirect(`/orderup/${userOrder.orderId}/checkout`)

  } catch (err) {
    console.log(err)
  }
}

//index.ejs
async function deleteOrder(req, res, next) {
  try {

    let userOrder = await UserOrder.findById(req.params.id)
    let mainOrder = await OrderUp.findById(userOrder.orderId)
    mainOrder.userOrders.remove(req.params.id)
    await mainOrder.markModified('userOrders')
    await mainOrder.save()
    await UserOrder.deleteOne({ _id: req.params.id })

    res.redirect(`/orderup`)

  } catch (err) {
    console.log(err)
  }
}