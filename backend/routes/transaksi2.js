// //import library
// const express = require ("express")
// const app = express()
// app.use(express.json())

// //import model
// const models = require("../models/index")
// const transaksi = models.transaksi
// const user = models.user
// const meja = models.meja
// const detail_transaksi = models.detail_transaksi

// //import sequelize op
// const Sequelize = require("sequelize")
// const Op = Sequelize.Op

// //import auth 
// const auth = require("../auth")
// const jwt = require("jsonwebtoken")
// const SECRET_KEY = "BeruangKutub"

// //JIKA BELUM LUNAS TANGGAL BAYAR TETEP NULL/LANGSUNG TERISI NULL
// app.get("/", async (req, res) =>{
//     let result = await transaksi.findAll({
//         include: [
//             "user",
//             "meja",
//             {
//                 model: models.detail_transaksi,
//                 as : "detail_transaksi",
//                 include: ["menu"]
//             }
//         ],
//         order: [['createdAt', 'DESC']]
//     })
//     res.json({
//         count: result.length,
//         transaksi: result
//     })
// })


// app.get("/id/:id_transaksi", async (req, res) => {
//     let param = { id_transaksi: req.params.id_transaksi }
//     let result = await transaksi.findAll({
//         where: param,
//         include: [
//             "user",
//             "meja",
//             {
//                 model: models.detail_transaksi,
//                 as : "detail_transaksi",
//                 include: ["menu"]
//             }
//         ]
//     })
//     let sumTotal = await transaksi.sum("total", {
//         where: param
//     })
//     res.json({
//         transaksibyid_transaksi: result,
//         sumTotal: sumTotal
//     })
// })

// app.get("/idTotal/:id_transaksi", async (req, res) => {
//     let param = { id_transaksi: req.params.id_transaksi }
//     // let result = await transaksi.findAll({
//     //     attributes: ['total'],
//     //     where: param})
//     // let sumTotal = await transaksi.sum("total", {
//     //     where: param
//     // })
//     let result = await transaksi.findAll({
//         // attributes: ['total'],
//         where: param
//     })
//     res.json({
//         total: result[0].total,
//         // sumTotal: sumTotal
//     })
// })

// //get transaksi by user id 
// app.get("/byUser/:id_user", async (req, res) => {
//     let param = { id_user: req.params.id_user }
//     let result = await transaksi.findAll({
//         where: param,
//         include: [
//             "user",
//             "meja",
//             {
//                 model: models.detail_transaksi,
//                 as: "detail_transaksi",
//                 include: ["menu"]
//             }
//         ],
//         order: [['createdAt', 'DESC']]

//     })
//     let sumTotal = await transaksi.sum("total", {
//         where: param
//     })
//     res.json({
//         count: result.length,
//         transaksibyid_user: result,
//         sumTotal: sumTotal
//     })
// })

// //tambah transaksi
// app.post("/", async (req, res) => {
//     let current = new Date().toISOString().split('T')[0]
//     let data = {
//         tgl_transaksi: current,//current : 
//         id_user: req.body.id_user,//siapa customer yang beli
//         id_meja: req.body.id_meja,
//         nama_pelanggan: req.body.nama_pelanggan,
//         status: "belum_bayar"
//         // total: req.body.total
//     }
//     let param = { id_meja: req.params.id_meja }

//     let upMeja = {
//         available: "no"
//     }
//     await meja.update(upMeja, ({ where: param }))
//     transaksi.create(data)
//         .then(result => {
//             let lastID = result.id_transaksi
//             console.log(lastID)
//             detail = req.body.detail_transaksi
//             detail.forEach(element => {//perungalan barang yang ada pada detail disimpan dalam element
//                 element.id_transaksi = lastID
//                 // element.subtotal = element.qty * element.price
//             });
//             console.log(detail);
//             detail_transaksi.bulkCreate(detail)//bulkCreate create data lebih dari satu kali
//                 .then(result => {
//                     res.json({
//                         message: "Data has been inserted"
//                     })
//                 })
//                 .catch(error => {
//                     res.json({
//                         message: error.message
//                     })
//                 })
//         })
//         .catch(error => {
//             console.log(error.message);
//         })
// })

// // Middleware untuk memeriksa apakah pengguna memiliki role sebagai Kasir
// const checkIsKasir = (req, res, next) => {
//     if (req.user.role !== 'Kasir') {
//       return res.status(401).json({
//         message: 'Unauthorized access. Only Kasir is allowed to perform this action.'
//       });
//     }
//     next();
//   };

// //tambah transaksi 2
// app.post("/tambah/:id_meja",  async (req, res) => {
//     const userId = req.body.id_user;
//   // Periksa apakah pengguna memiliki role sebagai Kasir
//   const userCek = await user.findOne({ where: { id_user: userId } });
//   if (!userCek || userCek.role !== "Kasir") {
//     return res.status(401).json({
//       message: "Unauthorized access. Only Kasir is allowed to perform this action.",
//     });
//   }

//     let current = new Date().toISOString().split('T')[0]
//     let data = {
//         tgl_transaksi: current,//current : 
//         // id_user: req.body.id_user,//siapa customer yang beli
//         // id_meja: req.body.id_meja,
//         nama_pelanggan: req.body.nama_pelanggan,
//         status: "belum_bayar",
//         total: 0 // inisialisasi nilai total awal
//     }
//     let param = { id_meja: req.params.id_meja }

//     // Periksa apakah meja tersedia atau tidak
//     let mejaData = await meja.findOne({
//         where: { id_meja: req.params.id_meja, available: "yes" },
//     });
//     if (!mejaData) {
//         return res.json({
//             message: "Meja tidak tersedia",
//         });
//     }

//     // Periksa apakah meja masih digunakan atau tidak
//     let transaksiData = await transaksi.findOne({
//         where: { id_meja: req.params.id_meja, status: "belum_bayar" },
//     });
//     if (transaksiData) {
//         return res.json({
//             message: "Meja masih digunakan",
//         });
//     }

//     let upMeja = {
//         available: "no"
//     }
//     await meja.update(upMeja, ({ where: param }))
//     transaksi.create(data)
//         .then(result => {
//             let lastID = result.id_transaksi
//             console.log(lastID)
//             detail = req.body.detail_transaksi
//             let total = 0 // inisialisasi nilai total detail transaksi
//             detail.forEach(element => {//perungalan barang yang ada pada detail disimpan dalam element
//                 element.id_transaksi = lastID
//                 element.subtotal = element.qty * element.price // perhitungan subtotal
//                 total += element.subtotal // penjumlahan subtotal untuk nilai total detail transaksi
//             });
//             console.log(detail);
//             detail_transaksi.bulkCreate(detail)//bulkCreate create data lebih dari satu kali
//                 .then(result => {
//                     transaksi.update({ total: total }, { where: { id_transaksi: lastID } }) // update nilai total transaksi
//                         .then(result => {
//                             res.json({
//                                 message: "Data has been inserted"
//                             })
//                         })
//                         .catch(error => {
//                             res.json({
//                                 message: error.message
//                             })
//                         })
//                 })
//                 .catch(error => {
//                     res.json({
//                         message: error.message
//                     })
//                 })
//         })
//         .catch(error => {
//             console.log(error.message);
//         })
// })


// //update status
// app.post("/update/:id", async (req, res) => {
//     let param = { id_transaksi: req.params.id }
//     let data = {
//         status: req.body.status
//     }
//     let paramMeja = { id_meja: req.body.id_meja }
//     let upMeja = {
//         available: "yes"
//     }
//     if (req.body.status === "lunas") {
//         await meja.update(upMeja, ({ where: paramMeja }))
//         transaksi.update(data, { where: param })
//             .then(result => {
//                 res.json({
//                     message: "Data has been Updated"
//                 })
//             })
//             .catch(error => {
//                 res.json({
//                     message: error.message
//                 })
//             })
//     } else {
//         res.json({
//             message: "Data can not be Updated"
//         })
//     }
// })

// //update menu plus update total
// app.post("/updateDetailTotal", async (req, res) => {
//     let detail = req.body.detail_transaksi.map((item) => ({
//         id_transaksi: req.body.id_transaksi,
//         id_menu: item.id_menu,
//         price: item.price,
//         qty: item.qty,
//         subtotal: item.price * item.qty
//     }));

//     detail_transaksi
//         .bulkCreate(detail)
//         .then(async (result) => {
//             let lastID = req.body.id_transaksi;
//             console.log(lastID);
//             // Mengambil data transaksi berdasarkan id_transaksi
//             let transaksiData = await transaksi.findByPk(lastID);
//             if (transaksiData) {
//                 // Menghitung total baru berdasarkan detail transaksi yang baru ditambahkan
//                 let newTotal = await detail_transaksi.sum("subtotal", {
//                     where: { id_transaksi: lastID },
//                 });
//                 // Update total pada data transaksi
//                 transaksiData.total = newTotal;
//                 await transaksiData.save();
//                 res.json({
//                     message: "Data total has been updated",
//                 });
//             } else {
//                 res.json({
//                     message: "Data transaksi not found",
//                 });
//             }
//         })
//         .catch((error) => {
//             res.json({
//                 message: error.message,
//             });
//         });
// });

// //delete transaksi
// app.delete("/del/:id_transaksi", async (req, res) => {
//     let param = { id_transaksi: req.params.id_transaksi }
//     try {
//         await detail_transaksi.destroy({ where: param })//menghapus detail dulu atau anak 
//         await transaksi.destroy({ where: param })//baru selanjutnya hapus yang parent kalau insert sebaliknya
//         res.json({
//             message: "data has been deleted"
//         })
//     } catch (error) {
//         res.json({
//             message: error
//         })
//     }
// })

// // Search transaksi by nama user
// app.post("/search", async (req, res) => {
//     let keyword = req.body.keyword
//     let result = await transaksi.findAll({
//         where: {
//             // id_user: req.params.id_user,
//             [Op.or]: [
//                 {
//                     id_transaksi: {
//                         [Op.like]: `%${keyword}%`
//                     }
//                 },
//                 {
//                     total: {
//                         [Op.like]: `%${keyword}%`
//                     }
//                 },
//                 {
//                     nama_pelanggan: {
//                         [Op.like]: `%${keyword}%`
//                     }
//                 },
//                 {
//                     '$user.name$': {
//                         [Op.like]: `%${keyword}%`
//                     }
//                 }
//             ]
//         },
//         include: [
//             "user",
//             "meja",
//             {
//                 model: models.detail_transaksi,
//                 as: "detail_transaksi",
//                 include: ["menu"]
//             }
//         ],
//         order: [['id_transaksi', 'DESC']]
//     })
//     let sumTotal = await transaksi.sum("total", {
//         where: {
//             // id_user: req.params.id_user,
//             [Op.or]: [
//                 {
//                     id_transaksi: {
//                         [Op.like]: `%${keyword}%`
//                     }
//                 },
//                 {
//                     total: {
//                         [Op.like]: `%${keyword}%`
//                     }
//                 },
//                 {
//                     nama_pelanggan: {
//                         [Op.like]: `%${keyword}%`
//                     }
//                 },
//                 {
//                     '$user.name$': {
//                         [Op.like]: `%${keyword}%`
//                     }
//                 }
//             ]
//         },
//         include: [
//             "user",
//             // "meja",
//             // {
//             //     model: models.detail_transaksi,
//             //     as: "detail_transaksi",
//             //     include: ["menu"]
//             // }
//         ],
//         order: [['id_transaksi', 'DESC']]
//     });
//     res.json({
//         count: result.length,
//         transaksi: result,
//         sumTotal: sumTotal
//     })
// })

// //get data transaksi by date
// app.post("/date", async (req, res) => {
//     let start = new Date(req.body.start)
//     let end = new Date(req.body.end)

//     let result = await transaksi.findAll({
//         where: {
//             // id_user: req.params.id_user,
//             // total: "lunas",

//             tgl_transaksi: {
//                 [Op.between]: [
//                     start, end
//                 ]
//             }
//         },
//         include: [
//             "user",
//             "meja",
//             {
//                 model: models.detail_transaksi,
//                 as: "detail_transaksi",
//                 include: ["menu"]
//             }
//         ],
//         order: [['createdAt', 'DESC']],

//     })
//     let sumTotal = await transaksi.sum("total", {
//         where: {
//             // id_user: req.params.id_user,
//             tgl_transaksi: {
//                 [Op.between]: [
//                     start, end
//                 ]
//             }
//         }
//     });
//     res.json({
//         count: result.length,
//         transaksi: result,
//         sumTotal: sumTotal
//     })
// })

// //jumlah transaksi total hari ini 
// app.post("/hariini", async (req, res) => {
//     let today = new Date();
//     today.setHours(0, 0, 0, 0);

//     let tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);

//     let result = await models.transaksi.findAll({
//         where: {
//             tgl_transaksi: {
//                 [Op.between]: [today, tomorrow],
//             },
//             include: [
//                 "user",
//                 "meja",
//                 {
//                     model: models.detail_transaksi,
//                     as: "detail_transaksi",
//                     include: ["menu"]
//                 }
//             ],
//             status: "lunas",
//         },
//         attributes: [
//             [sequelize.fn("sum", sequelize.col("total")), "total_hari_ini"],
//         ],
//     });

//     res.json({
//         total_hari_ini: result[0].dataValues.total_hari_ini,
//     });
// });


// module.exports = app;