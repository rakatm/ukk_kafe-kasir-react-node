//import library
const express = require('express');
const bodyParser = require('body-parser');
const md5 = require('md5');

//implementasi library
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//import model
const model = require('../models/index');
const user = model.user

//import sequelize op
const Sequelize = require("sequelize")
const Op = Sequelize.Op

// !----------------------------------------------------------------------------------------------------
const jwt = require('jsonwebtoken');
const SECRET_KEY = "BelajarNodeJSItuMenyengankan"
const auth = require("../auth")

function isAdmin (req, res, next) {
    let token = req.headers.authorization.split(" ")[1]
    let decoded = jwt.verify(token, SECRET_KEY)
    if (decoded.role === "admin") {
        next()
    } else {
        res.json({
            message: "You are not authorized to access this resource"
        })
    }
}
// !----------------------------------------------------------------------------------------------------

//endpoint menampilkan semua data user, method: GET, function: findAll()
app.get("/", auth, isAdmin, async(req,res) => {
  user.findAll()
      .then(result => {
          res.json({
              user : result
          })
      })
      .catch(error => {
          res.json({
              message: error.message
          })
      })
})
// !----------------------------------------------------------------------------------------------------
//GET user by ID, METHOD: GET, FUNCTION: findOne
app.get("/id_user/:id_user",auth, isAdmin, async (req, res) => {
    let param = {
        id_user: req.params.id_user
    }
    user.findOne({where: param})
    .then(result => {
        res.json({
            user: result
        })
    })
    .catch(error => {
        res.json({
            message: error.message
        })
    })   
})
// !----------------------------------------------------------------------------------------------------
//endpoint untuk menyimpan data user, METHOD: POST, function: create
app.post("/", auth, isAdmin, async(req,res) => {
  let data = {
      nama_user : req.body.nama_user,
      role : req.body.role,
      username : req.body.username,
      password : md5(req.body.password)
  }
  user.create(data)
      .then(result => {
          res.json({
              message: "data has been inserted"
          })
      })
      .catch(error => {
          res.json({
              message: error.message
          })
      })
})

// !----------------------------------------------------------------------------------------------------

//endpoint mengupdate data user, METHOD: PUT, function:update
app.put("/:id", auth, isAdmin, async(req,res) => {
    let param = {
        id_user : req.params.id
    }
    let data = {
        nama_user : req.body.nama_user,
        role : req.body.role,
        username : req.body.username,
        password : md5(req.body.password)
    }
    user.update(data, {where: param})
        .then(result => {
            res.json({
                message: "data has been updated"
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
})


// !----------------------------------------------------------------------------------------------------
//endpoint menghapus data user, METHOD: DELETE, function: destroy
app.delete("/:id", auth, isAdmin, async(req,res) => {
  let param = {
    id_user : req.params.id
  }
  user.destroy({where: param})
      .then(result => {
          res.json({
              message: "data has been deleted"
          })
      })
      .catch(error => {
          res.json({
              message: error.message
          })
      })
})

// !----------------------------------------------------------------------------------------------------

//search user by name, address, : method : post
app.post("/search", auth, isAdmin, async (req,res)=>{
    let keyword = req.body.keyword
    let result = await user.findAll({
        
            where: {
                [Op.or]: [
                    {
                        id_user: {
                            [Op.like]: `%${keyword}%`
                        }
                    },
                    {
                        nama_user: {
                            [Op.like]: `%${keyword}%`
                        }
                    },
                    {
                        role: {
                            [Op.like]: `%${keyword}%`
                        }
                    }
                ]
            }  
    })
    res.json({
        user: result
    })

})

// !----------------------------------------------------------------------------------------------------

app.post("/auth", async (req,res) => {
    let data= {
        username: req.body.username,
        password: md5(req.body.password)
    }

    let result = await user.findOne({where: data})
    if(result){
        let payload = JSON.stringify(result)
        // generate token
        let token = jwt.sign(payload, SECRET_KEY)
        res.json({
            logged: true,
            data: result,
            token: token
        })
    }else{
        res.json({
            logged: false,
            message: "Invalid username or password"
        })
    }
})

module.exports = app





