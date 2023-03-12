// const express = require("express")
// const meja = require("../models/index").meja
// const sequelize = require("sequelize")
// const {auth, isAdmin, isKasir, isManajer} = require("../auth2")
// const Op = sequelize.Op
// const app = express()
// app.use(express.urlencoded({ extended: true }))
// app.use(express.json())

// app.get("/",auth, isAdmin, async (req, res) => {
//     meja.findAll()
//         .then(result => {
//             res.json({
//                 data: result
//             })
//         })
//         .catch(error => {
//             res.json({
//                 message: error.message
//             })
//         })
// })

// app.get("/:id",auth, isAdmin, async (req, res) => {
//     let param = {
//         id_meja: req.params.id
//     }
//     meja.findOne({ where: param })
//         .then(result => {
//             res.json({
//                 data: result
//             })
//         })
//         .catch(error => {
//             res.json({
//                 message: error.message
//             })
//         })
// })

// app.post("/add", auth, isAdmin, async (req, res) => {
//     let data = {
//         nomor_meja: req.body.nomor_meja,
//         status: req.body.status
//     }
//     meja.create(data)
//         .then(result => {
//             res.json({
//                 message: "Data Added",
//                 data: result
//             })
//         })
//         .catch(error => {
//             res.json({
//                 message: error.message
//             })
//         })
// })

// app.put("/update",auth, isAdmin, async (req, res) => {
//     let param = {
//         id_meja: req.body.id_meja
//     }
//     let data = {
//         nomor_meja: req.body.nomor_meja,
//         status: req.body.status
//     }
//     meja.update(data, { where: param })
//         .then(result => {
//             res.json({
//                 message: "Data Updated",
//                 data: result
//             })
//         })
//         .catch(error => {
//             res.json({
//                 message: error.message
//             })
//         })
// })

// app.delete("/delete/:id",auth, isAdmin, async (req, res) => {
//     let param = {
//         id_meja: req.params.id
//     }
//     meja.destroy({ where: param })
//         .then(result => {
//             res.json({
//                 message: "Data Deleted"
//             })
//         })
//         .catch(error => {
//             res.json({
//                 message: error.message
//             })
//         })
// })

// app.get("/search/:keyword",auth, isAdmin, async (req,res)=>{
//     let keyword = req.params.keyword
//     let result = await meja.findAll({
//         where: {
//             [Op.or]: [
//                 {
//                     nomor_meja: {
//                         [Op.like]: `%${keyword}%`
//                     }
//                 },
//                 {
//                     status: {
//                         [Op.like]: `${keyword}`
//                     }
//                 }
//             ]
//         }
//     })
//     res.json({
//         meja: result
//     })
//     })


// module.exports = app