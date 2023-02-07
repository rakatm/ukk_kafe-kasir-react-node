//import library mysql
const mysql = require("mysql2") 


//inisialisasi database yang digunakan
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "ukk_kafe"
})


//lakukan koneksi database
db.connect(error => {
    if (error) {
        console.log(error.message)
    } else {
        console.log("MySQL Connected")
    }
})

//export konfigurasi database
module.exports = db