const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { Op } = require('sequelize');
const { menu, detail_transaksi } = require('../models');
const { auth, isAdmin, isKasir, isManajer } = require("../auth");
const { isDataView } = require('util/types');

const app = express();
app.use(express.json());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './image/menu');
    },
    filename: (req, file, cb) => {
        cb(null, `menu-${Date.now()}${path.extname(file.originalname)}`);
    },
});
const upload = multer({ storage });

app.get('/', auth, isAdmin, async (req, res) => {
    try {
        const data = await menu.findAll({
            attributes: ['id_menu', 'nama_menu', 'jenis', 'deskripsi', 'gambar', 'harga'],
        });
        res.json({
            count: data.length,
            menu: data,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});

app.get('/:id_menu', auth, isAdmin, async (req, res) => {
    try {
        const data = await menu.findOne({
            where: { id_menu: req.params.id_menu },
            attributes: ['id_menu', 'nama_menu', 'jenis', 'deskripsi', 'gambar', 'harga'],
        });
        if (data === null) {
            res.status(404).json({
                message: 'Data not found',
            });
        } else {
            res.json({
                menu: data,
            });
        }
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});

app.post('/add',auth, isAdmin, upload.single('gambar'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({
                message: 'No uploaded file',
            });
        } else {
            const data = {
                nama_menu: req.body.nama_menu,
                jenis: req.body.jenis,
                deskripsi: req.body.deskripsi,
                gambar: req.file.filename,
                harga: req.body.harga
            };
            await menu.create(data);
            res.json({
                message: 'Data has been inserted',
            });
        }
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});

app.put('/update/:id',auth, isAdmin, upload.single('gambar'), async (req, res) => {
    try {
        const param = { id_menu: req.params.id };
        const data = {
            nama_menu: req.body.nama_menu,
            jenis: req.body.jenis,
            deskripsi: req.body.deskripsi,
            harga: req.body.harga
        };
        if (req.file) {
            data.gambar = req.file.filename;
            const oldData = await menu.findOne({
                where: { id_menu: req.params.id },
                attributes: ['gambar'],
            });
            await fs.unlink(`./image/menu/${oldData.gambar}`);
        }
        await menu.update(data, { where: param });
        res.json({
            message: 'Data has been updated',
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});

app.delete('/delete/:id_menu', auth, isAdmin, async (req, res) => {
    try {
        const param = { id_menu: req.params.id_menu };
        const oldData = await menu.findOne({
            where: param,
            attributes: ['gambar'],
        });
        await fs.unlink(`./image/menu/${oldData.gambar}`);
        await menu.destroy({ where: param });
        await detail_transaksi.destroy({ where: { id_menu: req.params.id_menu } });
        res.json({
            message: 'Data has been deleted',
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});

app.get("/search/:keyword",auth, isAdmin, async (req, res) => {
    let keyword = req.params.keyword
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
                        [Op.like]: `${keyword}`
                    }
                },
            ]
        }
    })
    res.json({
        menu: result
    })
})


module.exports = app;