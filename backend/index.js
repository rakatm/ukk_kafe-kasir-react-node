//import
const express = require('express');
const cors = require('cors');

//implementasi
const app = express();
app.use(cors());

// !--------------------------------------------------------------------------------

// todo = endpoint nanti ditambahkan di sini

//endpoint user
const user = require('./routes/user');
app.use("/user", user)

const menu = require('./routes/menu');
app.use("/menu", menu)

const meja = require('./routes/meja');
app.use("/meja", meja)

// const transaksi = require('./routes/transaksi');
// app.use("/transaksi", transaksi)

const transaksi = require('./routes/transaksinew');
app.use("/transaksi", transaksi)


// !--------------------------------------------------------------------------------

//run server
app.listen(8080, () => {
    console.log('server run on port 8080')
})
