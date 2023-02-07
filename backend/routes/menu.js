//import library
const express = require('express');
const bodyParser = require('body-parser');

//implementasi library
const app = express();
app.use(express.json())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const multer = require("multer")
const path = require("path")
const fs = require("fs")//untuk membaca file sistem (dimana file itu)

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./gambar/menu")
    },
    filename: (req, file, cb) => {
        cb(null, "menu-" + Date.now() + path.extname(file.originalname))
    }
})
let upload = multer({ storage: storage })

//import model
const models = require('../models/index');
const menu = models.menu

//import sequelize op
const Sequelize = require("sequelize");
const Op = Sequelize.Op

// !----------------------------------------------------------------------------------------------------

//GET MENU , METHOD: GET, FUNCTION: findAll
//menampilkan seluruh data MENU
app.get("/", (req, res) => {
    menu.findAll()
        .then(menu => {
            res.json({
                count: menu.length,
                menu: menu
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
})

//GET MENU by ID, METHOD: GET, FUNCTION: findOne
app.get("/:id_menu", (req, res) => {
    menu.findOne({ where: { id_menu: req.params.id_menu } })
        .then(result => {
            res.json({
                menu: result
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })

})

// !----------------------------------------------------------------------------------------------------

app.post("/", upload.single("gambar"), (req, res) =>{
    if (!req.file) {
        res.json({
            message: "No uploaded file"
        })
    } else {
        let data = {
            nama_menu: req.body.nama_menu,
            jenis: req.body.jenis,
            deskripsi: req.body.deskripsi,
            gambar: req.file.filename,
            harga: req.body.harga,
        }
        menu.create(data)
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
    }
})

// !----------------------------------------------------------------------------------------------------

app.put("/:id", upload.single("gambar"), (req, res) => {
    let param = { id_menu: req.params.id }
    let data = {
        nama_menu: req.body.nama_menu,
        jenis: req.body.jenis,
        deskripsi: req.body.deskripsi,
        gambar: req.file.filename,
        harga: req.body.harga,
    }
    if (req.file) {
        const row = menu.findOne({ where: param })
            .then(result => {
                let oldFileName = result.gambar

                //delete old file
                let dir = path.join(__dirname, "../gambar/menu", oldFileName)
                fs.unlink(dir, err => console.log(err))
            })
            .catch(error => {
                console.log(error.message);

            })
        data.gambar = req.file.filename
    }

    menu.update(data, { where: param })
        .then(result => {
            res.json({
                message: "Data has been Updated"
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
})

// !----------------------------------------------------------------------------------------------------

app.delete("/:id", async (req, res) => {
    try {
        let param = { id_menu: req.params.id }
        let result = await menu.findOne({ where: param })
        let oldFileName = result.gambar

        //delete oldfile
        let dir = path.join(__dirname, "../gambar/menu", oldFileName)
        fs.unlink(dir, err => console.log(err))

        //delete data
        menu.destroy({ where: param })
            .then(result => {
                res.json({
                    message: "Data has been deleted",
                })
            })
            .catch(error => {
                res.json({
                    message: error.message
                })
            })
    }
    catch (error) {
        res.json({
            message: error.message
        })
    }
})

// !----------------------------------------------------------------------------------------------------
//search for menu, method:post

app.post("/search", async (req, res) => {
    let keyword = req.body.keyword
    let result = await menu.findAll({
        where: {
            [Op.or]: [
                {
                    id_menu: {
                        [Op.like]: `%${keyword}%`
                    }
                },
                {
                    nama_menu: {
                        [Op.like]: `%${keyword}%`
                    }
                },
                {
                    jenis: {
                        [Op.like]: `%${keyword}%`
                    }
                },
                {
                    stock: {
                        [Op.like]: `%${keyword}%`
                    }
                }
            ]
        }
    })
    res.json({
        menu: result
    })
})

module.exports = app;