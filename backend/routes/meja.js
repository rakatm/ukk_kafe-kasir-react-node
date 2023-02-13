//import library
const express = require('express');
const bodyParser = require('body-parser');

//implementasi library
const app = express();
app.use(express.json())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//import model
const models = require('../models/index');
const meja = models.meja

//import sequelize op
const Sequelize = require("sequelize");
const Op = Sequelize.Op

//GET MEJA , METHOD: GET, FUNCTION: findAll
//menampilkan seluruh data MEJA
app.get("/", (req, res) => {
    meja.findAll()
        .then(meja => {
            res.json({
                count: meja.length,
                meja: meja,
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })//jika eror masuk ke blok .catch diambil erornya apa dan ditampilkan errornya
})

//GET meja by ID, METHOD: GET, FUNCTION: findOne
app.get("/id_meja/:id_meja",async (req, res) => {
    let param = {
        id_meja: req.params.id_meja
    }
    meja.findOne({where: param})
    .then(result => {
        res.json({
            meja: result
        })
    })
    .catch(error => {
        res.json({
            message: error.message
        })
    })   
        //jika eror masuk ke blok .catch diambil erornya apa dan ditampilkan errornya
})

//endpoint untuk menyimpan data meja, METHOD: POST, function: create
app.post("/", (req,res) => {
    let data = {
        meja : req.body.meja,
        status : req.body.status
    }
 
    meja.create(data)
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

//endpoint mengupdate data meja, METHOD: PUT, function:update
app.put("/:id", (req,res) => {
    let param = {
        id_meja : req.params.id
    }
    let data = {
        meja : req.body.meja,
        status : req.body.status
    }
    meja.update(data, {where: param})
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

//endpoint menghapus data meja, METHOD: DELETE, function: destroy
app.delete("/:id", (req,res) => {
    let param = {
        id_meja : req.params.id
    }
    meja.destroy({where: param})
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

 //search meja by name & username, method: post
 app.post("/search", async (req,res)=>{
    let keyword = req.body.keyword
    let result = await meja.findAll({
        where: {
            [Op.or]: [
                {
                    meja: {
                        [Op.like]: `%${keyword}%`
                    }
                },
                {
                    status: {
                        [Op.like]: `%${keyword}%`
                    }
                }
            ]
        }
    })
    res.json({
        meja: result
    })
    })


//video dan pembelajaran, bahas, kasus, game, kuis
//mu72e4
module.exports = app;