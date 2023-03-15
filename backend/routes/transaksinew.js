//import library
const express = require ("express")
const app = express()
app.use(express.json())

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

//import model
const models = require("../models/index")
const transaksi = models.transaksi
const user = models.user
const meja = models.meja
const detail_transaksi = models.detail_transaksi

//import sequelize op
const Sequelize = require("sequelize")
const Op = Sequelize.Op

// !----------------------------------------------------------------------------------------------------
const jwt = require('jsonwebtoken');
const SECRET_KEY = "BelajarNodeJSItuMenyengankan"
const auth = require("../auth")

function isKasir (req, res, next) {
    let token = req.headers.authorization.split(" ")[1]
    let decoded = jwt.verify(token, SECRET_KEY)
    if (decoded.role === "kasir") {
        next()
    } else {
        res.json({
            message: "You are not authorized to access this resource"
        })
    }
}
function isManajer (req, res, next) {
    let token = req.headers.authorization.split(" ")[1]
    let decoded = jwt.verify(token, SECRET_KEY)
    if (decoded.role === "manajer") {
        next()
    } else {
        res.json({
            message: "You are not authorized to access this resource"
        })
    }
}

// !----------------------------------------------------------------------------------------------------

//JIKA BELUM LUNAS TANGGAL BAYAR TETEP NULL/LANGSUNG TERISI NULL
app.get("/", auth, isKasir, async (req, res) =>{
    let result = await transaksi.findAll({
        include: [
            "user",
            "meja",
            {
                model: models.detail_transaksi,
                as : "detail_transaksi",
                include: ["menu"]
            }
        ],
        order: [['createdAt', 'DESC']]
    })
    res.json({
        count: result.length,
        transaksi: result
    })
})

app.get("/id/:id_transaksi", auth, isKasir, async (req, res) => {
    let param = { id_transaksi: req.params.id_transaksi }
    let result = await transaksi.findAll({
        where: param,
        include: [
            "user",
            "meja",
            {
                model: models.detail_transaksi,
                as : "detail_transaksi",
                include: ["menu"]
            }
        ]

    })
    let sumTotal = await transaksi.sum("total", {
        where: param
    })
    res.json({
        transaksibyid_transaksi: result,
        sumTotal: sumTotal
    })
})

// !----------------------------------------------------------------------------------------------------
// get transaksi by user id 
app.get ("/byUser/:id_user", auth, isKasir, async (req,res) => {
    let param = { id_user: req.params.id_user}
    let result = await transaksi.findAll({
        where: param,
        include: [
            "user",
            "meja",
            {
                model: models.detail_transaksi,
                as: "detail_transaksi",
                include: ["menu"]
            }
        ],
        order: [['createdAt', 'DESC']]

    })
     let sumTotal = await transaksi.sum("total", {
         where: param
     })
    res.json({
        count: result.length,
        transaksibyid_user: result,
        sumTotal: sumTotal
    })
})


// !----------------------------------------------------------------------------------------------------

// update status transaksi
app.post("/update/:id_transaksi", auth, isKasir, async (req, res) => {
    let param = { id_transaksi: req.params.id_transaksi }
    let data = {
        status: req.body.status
    }
    let paramMeja = { id_meja: req.body.id_meja }
    let upMeja = {
        status: "available"
    }
    if (req.body.status === "lunas") {
        await meja.update(upMeja, ({ where: paramMeja }))
        transaksi.update(data, { where: param })
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
    } else {
        res.json({
            message: "Data can not be Updated"
        })
    }
})

// !----------------------------------------------------------------------------------------------------

//tambah transaksi new
app.post("/tambah/:id_meja",  auth, isKasir, async (req, res) => {
    const userId = req.body.id_user;
    // Periksa apakah pengguna memiliki role sebagai Kasir
    const userCek = await user.findOne({ where: { id_user: userId } });
    if (!userCek || userCek.role !== "kasir") {
        return res.status(401).json({
            message: "Unauthorized access. Only Kasir is allowed to perform this action.",
        });
    }

  let current = new Date().toISOString().split('T')[0]
  let data = {
      tgl_transaksi: current,//current : 
      id_user: req.body.id_user,//siapa customer yang beli
      id_meja: req.body.id_meja,
      nama_pelanggan: req.body.nama_pelanggan,
      status: "belum_bayar",
  }
  let param = { id_meja: req.params.id_meja }

  // Periksa apakah meja tersedia atau tidak
  let mejaData = await meja.findOne({
      where: { id_meja: req.params.id_meja, status: "available" },
  });
  if (!mejaData) {
      return res.json({
          message: "Meja tidak tersedia",
      });
  }

  // Periksa apakah meja masih digunakan atau tidak
  let transaksiData = await transaksi.findOne({
      where: { id_meja: req.params.id_meja, status: "belum_bayar" },
  });
  if (transaksiData) {
      return res.json({
          message: "Meja masih digunakan",
      });
  }

  let upMeja = {
      status: "not available"
  }
  await meja.update(upMeja, ({ where: param }))
  transaksi.create(data)
      .then(result => {
          let lastID = result.id_transaksi
          console.log(lastID)
          detail = req.body.detail_transaksi
          let total = 0 // inisialisasi nilai total detail transaksi

          detail.forEach(element => {//perungalan barang yang ada pada detail disimpan dalam element
              element.id_transaksi = lastID
              element.subtotal = element.qty * element.harga // perhitungan subtotal
              total += element.subtotal // penjumlahan subtotal untuk nilai total detail transaksi
          });
          console.log(detail);

          detail_transaksi.bulkCreate(detail)//bulkCreate create data lebih dari satu kali
              .then(result => {
                  transaksi.update({ total: total }, { where: { id_transaksi: lastID } }) // update nilai total transaksi
                      .then(result => {
                          res.json({
                              message: "Data has been inserted"
                          })
                      })
                      .catch(error => {
                          res.json({
                              message: error.message
                          })
                      })
              })
              .catch(error => {
                  res.json({
                      message: error.message
                  })
              })
      })
      .catch(error => {
          console.log(error.message);
      })
    console.log();
})

// !----------------------------------------------------------------------------------------------------

app.delete("/delete/:id_transaksi", auth, isKasir, async (req, res) =>{
    let param = { id_transaksi: req.params.id_transaksi}
    try {
        await detail_transaksi.destroy({where: param})//menghapus detail dulu atau anak 
        await transaksi.destroy({where: param})//baru selanjutnya hapus yang parent kalau insert sebaliknya
        res.json({
            message : "data has been deleted"
        })
    } catch (error) {
        res.json({
            message: error
        })
    }
})

// !----------------------------------------------------------------------------------------------------

// Search transaksi by nama user
app.post("/search", auth, isManajer, async (req, res) => {
  let keyword = req.body.keyword
  let result = await transaksi.findAll({
      where: {
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
      ],
      order: [['id_transaksi', 'DESC']]
  });
  res.json({
      count: result.length,
      transaksi: result,
      sumTotal: sumTotal
  })
})

// !----------------------------------------------------------------------------------------------------

//get data transaksi by date
app.post("/date", auth, isManajer, async (req, res) => {
  let start = new Date(req.body.start)
  let end = new Date(req.body.end)

  let result = await transaksi.findAll({
      where: {

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
