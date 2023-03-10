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

//import model
const models = require('../models/index');
const menu = models.menu

//import sequelize op
const Sequelize = require("sequelize");
const Op = Sequelize.Op

// !----------------------------------------------------------------------------------------------------

//GET MENU , METHOD: GET, FUNCTION: findAll
//menampilkan seluruh data MENU
app.get("/", auth, isAdmin, async (req, res) => {
    await menu.findAll()
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
app.get("/:id_menu", auth, isAdmin, async(req, res) => {
    await menu.findOne({ where: { id_menu: req.params.id_menu } })
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

app.post("/", auth, isAdmin,upload.single("gambar"), async(req, res) =>{
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
        await menu.create(data)
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

app.put("/:id", auth, isAdmin,upload.single("gambar"), (req, res) => {
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

app.delete("/:id", auth, isAdmin, async (req, res) => {
    try {
        let param = { id_menu: req.params.id }
        let result = await menu.findOne({ where: param })
        let oldFileName = result.gambar

        //delete oldfile
        let dir = path.join(__dirname, "../gambar/menu", oldFileName)
        await fs.unlink(dir, err => console.log(err))

        //delete data
        await menu.destroy({ where: param })
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

app.post("/search", auth, isAdmin, async (req, res) => {
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
                    deskripsi: {
                        [Op.like]: `%${keyword}%`
                    }
                },
                {
                    harga: {
                        [Op.like]: `%${keyword}%`
                    }
                },
            ]
        }
    })
    res.json({
        menu: result
    })
})

// !----------------------------------------------------------------------------------------------------

// //mendapatkan menu terlaris
// app.get("/terlaris", async (req, res) => {
//     try {
//       const result = await detail_transaksi.findAll({
//         attributes: [
//           'id_menu',
//           [models.sequelize.fn('sum', models.sequelize.col('qty')), 'total_penjualan']
//         ],
//         include: [
//           {
//             model: menu,
//             as: 'menu',
//             // where: { jenis: 'makanan' },
//             attributes: ['nama_menu']
//           }
//         ],
//         group: ['id_menu'],
//         order: [[models.sequelize.fn('sum', models.sequelize.col('qty')), 'DESC']]
//       });
//       res.status(200).json({ menu: result });
//     } catch (error) {
//       console.log(error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   });

module.exports = app;