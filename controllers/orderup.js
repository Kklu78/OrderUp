const User = require('../models/user');
const Documenu = require('../models/documenu');
const OrderUp = require('../models/orderup')
const UserOrder = require('../models/userorder')
const mongoose = require('mongoose');


module.exports = {
  index,
  startOrder,
  selectRetaurant,
  checkoutOrder,
  checkout,
  newPage,
  removeItem,
  removeItemCheckout

};



async function index(req, res, next) {
  try {
    let users = await User.find({})
    let allUserOrders = await UserOrder.find({})

    if (req.user) {
      let userOrders = await UserOrder.find({ userId: req.user._id })

      let OrderIds = []
      userOrders.forEach(o =>
        OrderIds.push(o.orderId))
      let mainOrders = await OrderUp.find({ _id: { $in: OrderIds } })

      let orderRest = new Set()
      mainOrders.forEach(o =>
        orderRest.add(o.restaurantId))
      orderRest = Array.from(orderRest)

      restaurants = []


      for await (const r of orderRest) {
        let restaurant = await Documenu.Restaurants.get(r)
        restaurants.push(restaurant.result)
      }

      
      res.render('orderup/index', {
        users,
        userOrders,
        user: req.user,
        title: 'Welcome to OrderUp',
        order: '',
        restaurants,
        mainOrders,
        allUserOrders
      });

    } else {
      userOrders = null


      res.render('orderup/index', {
        users,
        userOrders,
        user: req.user,
        title: 'Welcome to OrderUp',
        order: '',
        restaurants: '',
        mainOrders: '',
        allUserOrders: ''
      });

    }

    // let orders = await OrderUp.find({})
    // 
    // console.log(userOrders)



  } catch (err) {
    console.log(err)
  }
}


async function startOrder(req, res, next) {
  try {
    let friendsList = await User.find({ _id: { $ne: req.user._id } })

    const params = {
      'fullmenu': true
    }
    // let result = await Documenu.Restaurants.getByZipCode(req.body.zipcode, params);
    // console.log(req, 'req')
    Documenu.Restaurants.getByZipCode(req.body.zipcode, params)
      .then(data => {
        // console.log(data)
        // console.log(res.data[0].menus[0].menu_sections[0].menu_items);
        res.render('orderup/new', {
          title: 'Start A Group Order',
          restaurants: data.data,
          friendsList


        })
      });
  } catch (err) {
    console.log(err)
    res.send(err)
  }
}

async function selectRetaurant(req, res, next) {
  try {
    let newOrder = { open: true }
    for (let i = (Object.keys(req.body).length - 2); i < Object.keys(req.body).length; i++) {
      newOrder[Object.keys(req.body)[i]] = req.body[Object.keys(req.body)[i]]
    }
    let createdOrder = await OrderUp.create(newOrder)

    let currentUser = {}
    currentUser[req.user._id] = 'on'
    req.body = Object.assign(currentUser, req.body)

    let userOrders = []
    console.log(req.body, 'req.body')
    for (let i = 0; i < Object.keys(req.body).length - 2; i++) {
      let x = {}
      let userObj = await User.findById(Object.keys(req.body)[i])
      console.log(userObj._id)
      x['userId'] = userObj._id
      x['orderId'] = createdOrder._id
      x['order'] = {}
      let userOrder = await UserOrder.create(x)
      userOrders.push(userOrder._id)
    }
    createdOrder['userOrders'] = userOrders
    await createdOrder.save()
    console.log(createdOrder)



    res.redirect(`/orderup/${createdOrder._id}/order`)


  } catch (err) {
    console.log(err)

  }

}

async function checkoutOrder(req, res, next) {
  try {
    console.log(req.body)
    let order = await OrderUp.findById(req.params.id)
    let restaurant = await Documenu.Restaurants.get(order.restaurantId)
    let userOrders = await UserOrder.find({ userId: req.user._id, orderId: order._id })
    let userOrder = await UserOrder.findById(userOrders[0]._id)

    console.log(userOrder)

    for (const item in req.body) {
      if (req.body[item] > 0) {
        console.log(item)
        userOrder.order[item] = userOrder.order[item] ? Number(userOrder.order[item]) + Number(req.body[item]) : req.body[item]
      }
    }
    await userOrder.markModified('order')
    await userOrder.save()
    console.log(userOrder)




    if (!!req.body.update) {
      res.redirect(`/orderup/${userOrder.orderId}/order`)
    } else {
      res.redirect(`/orderup/${userOrder.orderId}/checkout`)

    }
  } catch (err) {
    console.log(err)
  }
}


async function checkout(req, res, next) {
  try {
    let createdOrder = await OrderUp.findById(req.params.id)
    let restaurant = await Documenu.Restaurants.get(createdOrder.restaurantId)
    let userOrders = await UserOrder.find({ orderId: createdOrder._id })
    let users = await User.find({})

    let totalOrder = {}
    userOrders.forEach(o => {
      for (const i in o.order) {
        totalOrder[i] = totalOrder[i] ? Number(totalOrder[i]) + Number(o.order[i]) : o.order[i]

      }
    })

    res.render('orderup/checkout', {
      title: '',
      restaurant: restaurant.result,
      order: createdOrder,
      userOrders,
      users,
      totalOrder
    })
  } catch (err) {
    console.log(err)
  }
}


async function newPage(req, res, next) {
  try {
    console.log(req.params)

    let createdOrder = await OrderUp.findById(req.params.id)
    let restaurant = await Documenu.Restaurants.get(createdOrder.restaurantId)
    let userOrders = await UserOrder.find({ userId: req.user._id, orderId: createdOrder._id })
    let userOrder = await UserOrder.findById(userOrders[0]._id)

    res.render(`orderup/order`, {
      title: '',
      restaurant: restaurant.result,
      order: createdOrder,
      userOrder

    })

  } catch (err) {
    console.log(err)
  }
}

async function removeItem(req, res, next) {
  try {
    let createdOrder = await OrderUp.findById(req.params.id)
    let restaurant = await Documenu.Restaurants.get(createdOrder.restaurantId)
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