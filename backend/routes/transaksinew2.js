const express = require("express");
const app = express()
const Sequelize = require("sequelize");
const Op = Sequelize.Op
const {auth, isAdmin, isKasir, isManajer} = require("../auth")

const models = require("../models");
const transaksi = models.transaksi;
const detail_transaksi = models.detail_transaksi;

app.use(express.json());

app.get("/", auth, isAdmin, async (req, res) => {
    const result = await transaksi.findAll({
        include: ["user", "meja", { model: detail_transaksi, as: "detail_transaksi", include: ["menu"] }],
        order: [["createdAt", "DESC"]],
    });
    res.json({ count: result.length, transaksi: result });
});

app.get("/:id", async (req, res) => {
    const param = { id_transaksi: req.params.id };
    try {
        const result = await transaksi.findOne({ where: param });
        res.json({ data: result });
    } catch (err) {
        res.json({ msg: err.message });
    }
});

app.get("/id/:id_transaksi", async (req, res) => {
    const param = { id_transaksi: req.params.id_transaksi };
    try {
        const result = await transaksi.findAll({
            where: param,
            include: ["user", "meja", { model: detail_transaksi, as: "detail_transaksi", include: ["menu"] }],
        });
        const sumTotal = await transaksi.sum("total", { where: param });
        res.json({ transaksibyid_transaksi: result, sumTotal: sumTotal });
    } catch (err) {
        res.json({ msg: err.message });
    }
}); 

app.get("/byUser/:id_user", async (req, res) => {
    const param = { id_user: req.params.id_user };
    try {
        const result = await transaksi.findAll({
            where: param,
            include: ["user", "meja", { model: detail_transaksi, as: "detail_transaksi", include: ["menu"] }],
            order: [["createdAt", "DESC"]],
        });
        const sumTotal = await transaksi.sum("total", { where: param });
        res.json({ count: result.length, transaksibyid_user: result, sumTotal: sumTotal });
    } catch (err) {
        res.json({ msg: err.message });
    }
});

app.post("/", async (req, res) => {
    const current = new Date().toISOString().split("T")[0];
    const data = {
        tgl_transaksi: current,
        id_user: req.body.id_user,
        id_meja: req.body.id_meja,
        nama_pelanggan: req.body.nama_pelanggan,
        status: req.body.status,
        total: req.body.total,
    };
    try {
        const result = await transaksi.create(data);
        const lastID = result.id_transaksi;
        const detail = req.body.detail_transaksi.map((item) => ({ ...item, id_transaksi: lastID }));
        await detail_transaksi.bulkCreate(detail);
        res.json({ message: "Data has been inserted" });
    } catch (err) {
        console.log(err.message);
        res.json({ message: err.message });
    }
});

app.post("/update/:id", async (req, res) => {
    const param = { id_transaksi: req.params.id };
    const data = { status: req.body.status };
    try {
        await transaksi.update(data, { where: param });
        res.json({ message: "Data has been updated" });
    } catch (err) {
        res.json({ message: err.message });
    }
});

app.delete("/delete/:id_transaksi", async (req, res) => {
    let param = { id_transaksi: req.params.id_transaksi }
    try {
        await detail_transaksi.destroy({ where: param })//menghapus detail dulu atau anak 
        await transaksi.destroy({ where: param })//baru selanjutnya hapus yang parent kalau insert sebaliknya
        res.json({
            message: "data has been deleted"
        })
    } catch (error) {
        res.json({
            message: error
        })
    }
})

// Search transaksi by nama user
app.post("/search", async (req, res) => {
    let keyword = req.body.keyword
    let result = await transaksi.findAll({
        where: {
            // id_user: req.params.id_user,
            [Op.or]: [
                {
                    id_transaksi: {
                        [Op.like]: `%${keyword}%`
                    }
                },
                {
                    total: {
                        [Op.like]: `%${keyword}%`
                    }
                },
                {
                    nama_pelanggan: {
                        [Op.like]: `%${keyword}%`
                    }
                },
                {
                    '$user.name$': {
                        [Op.like]: `%${keyword}%`
                    }
                }
            ]
        },
        include: [
            "user",
            "meja",
            {
                model: models.detail_transaksi,
                as: "detail_transaksi",
                include: ["menu"]
            }
        ],
        order: [['id_transaksi', 'DESC']]
    })
    let sumTotal = await transaksi.sum("total", {
        where: {
            // id_user: req.params.id_user,
            [Op.or]: [
                {
                    id_transaksi: {
                        [Op.like]: `%${keyword}%`
                    }
                },
                {
                    total: {
                        [Op.like]: `%${keyword}%`
                    }
                },
                {
                    nama_pelanggan: {
                        [Op.like]: `%${keyword}%`
                    }
                },
                {
                    '$user.name$': {
                        [Op.like]: `%${keyword}%`
                    }
                }
            ]
        },
        include: [
            "user",
            // "meja",
            // {
            //     model: models.detail_transaksi,
            //     as: "detail_transaksi",
            //     include: ["menu"]
            // }
        ],
        order: [['id_transaksi', 'DESC']]
    });
    res.json({
        count: result.length,
        transaksi: result,
        sumTotal: sumTotal
    })
})

app.post("/date", async (req, res) => {
    let start = new Date(req.body.start)
    let end = new Date(req.body.end)

    let result = await transaksi.findAll({
        where: {
            // id_user: req.params.id_user,
            // total: "lunas",

            tgl_transaksi: {
                [Op.between]: [
                    start, end
                ]
            }
        },
        include: [
            "user",
            "meja",
            {
                model: models.detail_transaksi,
                as: "detail_transaksi",
                include: ["menu"]
            }
        ],
        order: [['createdAt', 'DESC']],

    })
    let sumTotal = await transaksi.sum("total", {
        where: {
            // id_user: req.params.id_user,
            tgl_transaksi: {
                [Op.between]: [
                    start, end
                ]
            }
        }
    });
    res.json({
        count: result.length,
        transaksi: result,
        sumTotal: sumTotal
    })
})


module.exports = app;
