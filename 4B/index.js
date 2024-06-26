const express = require('express');
const hbs = require("hbs");
const { Sequelize, QueryTypes } = require("sequelize");
const config = require("./config/config.json");
const sequelize = new Sequelize(config.development.database, config.development.username, config.development.password, {
  host: config.development.host,
  dialect: config.development.dialect,
//   logging: false 
});
const path = require("path"); // inpor modul dari direktori lainnya
const multer = require('multer'); 


const app = express();
const port = 5000;

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, 'src/views'));

hbs.registerPartials(path.join(__dirname, 'src/views')); //templet biar bisa digunakan diberbagai file, untuk menghindari pungalan kode yang sama dengan fungsi yang sama

hbs.registerHelper('eq', function (a, b) {
    return a === b;
});

app.use("/assets", express.static(path.join(__dirname, 'src/assets')));
app.use(express.urlencoded({ extended: false })); // true menggunakan library qs yang lebih kuat
// app.use(methodOverride('_method'));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/assets/img/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); //t
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.get("/", home);
app.get("/add_provinsi", viewprovinsi);
app.post("/add_provinsi", upload.single('photo'), addprovinsi);
app.get("/add_kabupaten", viewkabupaten);
app.post("/add_kabupaten", upload.single('photo'), addkabupaten);
app.get("/detail/:id", detail);
app.get("/detail-kab/:id", detailKab);
app.get("/update_provinsi/:id", updateviewprovinsi);
app.post("/update_provinsi/:id", upload.single('photo'), updateprovinsi);
app.post("/delete_provinsi/:id", deleteprovinsi);
app.get("/update_kabupaten/:id", updateviewkabupaten);
app.post("/update_kabupaten/:id", upload.single('photo'), updatekabupaten);
app.post("/delete_kabupaten/:id", deleteKabupaten);

async function home(req, res) {
    const { filter } = req.query;
    let query = `
        SELECT
            provinsi_tbs.id AS provinsi_id,
            provinsi_tbs.nama AS provinsi_nama,
            provinsi_tbs.diresmikan AS provinsi_diresmikan,
            provinsi_tbs.photo AS provinsi_photo,
            provinsi_tbs.pulau AS provinsi_pulau,
            kabupaten_tbs.id AS kabupaten_id,
            kabupaten_tbs.nama AS kabupaten_nama,
            kabupaten_tbs.provinsi_id AS kabupaten_provinsi_id,
            kabupaten_tbs.diresmikan AS kabupaten_diresmikan,
            kabupaten_tbs.photo AS kabupaten_photo
        FROM
            provinsi_tbs
        LEFT JOIN
            kabupaten_tbs ON kabupaten_tbs.provinsi_id = provinsi_tbs.id
    `;
    
    if (filter === '1') {
        query = `
            SELECT
                id AS provinsi_id,
                nama AS provinsi_nama,
                diresmikan AS provinsi_diresmikan,
                photo AS provinsi_photo,
                pulau AS provinsi_pulau
            FROM
                provinsi_tbs
        `;
    } else if (filter === '2') {
        query = `
            SELECT
                kabupaten_tbs.id AS kabupaten_id,
                kabupaten_tbs.nama AS kabupaten_nama,
                kabupaten_tbs.provinsi_id AS kabupaten_provinsi_id,
                kabupaten_tbs.diresmikan AS kabupaten_diresmikan,
                kabupaten_tbs.photo AS kabupaten_photo,
                provinsi_tbs.nama AS provinsi_nama
            FROM
                kabupaten_tbs
            LEFT JOIN
                provinsi_tbs ON kabupaten_tbs.provinsi_id = provinsi_tbs.id
        `;
    }

    const obj = await sequelize.query(query, { type: QueryTypes.SELECT });
    res.render("index", { data: obj });
}

function viewprovinsi(req, res) {
    res.render("add_provinsi");
}

async function addprovinsi(req, res) {
    let { nama, resmi, pulau } = req.body;
    const photo = req.file ? `/assets/img/${req.file.filename}` : '';

    const date = new Date();
    const dateString = date.toISOString().slice(0, 19).replace("T", " ");

    const query = `
        INSERT INTO "provinsi_tbs"(nama, diresmikan, photo, pulau, "createdAt", "updatedAt")
        VALUES ('${nama}', '${resmi}', '${photo}', '${pulau}', '${dateString}', '${dateString}')
    `;
    await sequelize.query(query, { type: QueryTypes.INSERT });

    res.redirect("/");
}

async function updateviewprovinsi(req, res) {
    const { id } = req.params;

    const query = `
        SELECT
            id, nama, diresmikan, photo, pulau
        FROM
            provinsi_tbs
        WHERE
            id = :id;
    `;

    const data = await sequelize.query(query, {
        replacements: { id: id },
        type: QueryTypes.SELECT
    });

    res.render("update_provinsi", { data: data[0] });
}

async function updateprovinsi(req, res) {
    const { id } = req.params;
    let { nama, resmi, pulau } = req.body;
    const photo = req.file ? `/assets/img/${req.file.filename}` : '';

    const date = new Date();
    const dateString = date.toISOString().slice(0, 19).replace("T", " ");

    const query = `
        UPDATE "provinsi_tbs"
        SET nama = :nama, diresmikan = :diresmikan, photo = :photo, pulau = :pulau, "updatedAt" = :updatedAt
        WHERE id = :id;
    `;
    //biar bisa pake pst gress
    await sequelize.query(query, {
        replacements: { id: id, nama, diresmikan: resmi, photo, pulau, updatedAt: dateString },
        type: QueryTypes.UPDATE
    });

    res.redirect("/");
}

async function deleteprovinsi(req, res) {
    const { id } = req.params;

    const query = `
        DELETE FROM "provinsi_tbs"
        WHERE id = :id;
    `;

    await sequelize.query(query, {
        replacements: { id: id },
        type: QueryTypes.DELETE
    });

    res.redirect("/");
}

async function viewkabupaten(req, res) {
    const query = `SELECT id, nama FROM "provinsi_tbs"`;
    const provinces = await sequelize.query(query, { type: QueryTypes.SELECT });

    res.render("add_kabupaten", { provinces });
}

async function addkabupaten(req, res) {
    let { nama, resmi, provinsi_id } = req.body;
    const photo = req.file ? `/assets/img/${req.file.filename}` : '';

    const date = new Date();
    const dateString = date.toISOString().slice(0, 19).replace("T", " ");

    const query = `
        INSERT INTO "kabupaten_tbs"(nama, diresmikan, photo, provinsi_id, "createdAt", "updatedAt")
        VALUES ('${nama}', '${resmi}', '${photo}', '${provinsi_id}', '${dateString}', '${dateString}')
    `;
    await sequelize.query(query, { type: QueryTypes.INSERT });

    res.redirect("/");
}

async function updateviewkabupaten(req, res) {
    const { id } = req.params;

    const kabupatenQuery = `
        SELECT
            id, nama, diresmikan, photo, provinsi_id
        FROM
            kabupaten_tbs
        WHERE
            id = :id;
    `;

    const provincesQuery = `SELECT id, nama FROM provinsi_tbs`;

    const [kabupatenData, provinces] = await Promise.all([
        sequelize.query(kabupatenQuery, {
            replacements: { id: id },
            type: QueryTypes.SELECT
        }),
        sequelize.query(provincesQuery, { type: QueryTypes.SELECT })
    ]);

    res.render("update_kabupaten", {
        data: kabupatenData[0],
        provinces: provinces
    });
}

async function updatekabupaten(req, res) {
    const { id } = req.params;
    let { nama, resmi, provinsi_id } = req.body;
    const photo = req.file ? `/assets/img/${req.file.filename}` : '';

    const date = new Date();
    const dateString = date.toISOString().slice(0, 19).replace("T", " ");

    if (!provinsi_id) {
        res.status(400).send("Provinsi ID tidak ditemukan di body request.");
        return;
    }

    const query = `
        UPDATE "kabupaten_tbs"
        SET nama = :nama, diresmikan = :diresmikan, photo = :photo, provinsi_id = :provinsi_id, "updatedAt" = :updatedAt
        WHERE id = :id;
    `;

    await sequelize.query(query, {
        replacements: { id: id, nama, diresmikan: resmi, photo, provinsi_id, updatedAt: dateString },
        type: QueryTypes.UPDATE
    });

    res.redirect("/");
}

async function deleteKabupaten(req, res) {
    const { id } = req.params;

    const query = `
        DELETE FROM "kabupaten_tbs"
        WHERE id = :id;
    `;

    await sequelize.query(query, {
        replacements: { id: id },
        type: QueryTypes.DELETE
    });

    res.redirect("/");
}

async function detail(req, res) {
    const id = req.params.id;

    const query = `
        SELECT
            provinsi_tbs.id AS provinsi_id,
            provinsi_tbs.nama AS provinsi_nama,
            provinsi_tbs.diresmikan AS provinsi_diresmikan,
            provinsi_tbs.photo AS provinsi_photo,
            provinsi_tbs.pulau AS provinsi_pulau,
            kabupaten_tbs.id AS kabupaten_id,
            kabupaten_tbs.nama AS kabupaten_nama,
            kabupaten_tbs.provinsi_id AS kabupaten_provinsi_id,
            kabupaten_tbs.diresmikan AS kabupaten_diresmikan,
            kabupaten_tbs.photo AS kabupaten_photo
        FROM
            provinsi_tbs
        LEFT JOIN
            kabupaten_tbs ON kabupaten_tbs.provinsi_id = provinsi_tbs.id
        WHERE
            provinsi_tbs.id = :id;
    `;

    const obj = await sequelize.query(query, {
        replacements: { id: id },
        type: QueryTypes.SELECT
    });

    res.render("detail", { data: obj[0] });
}

async function detailKab(req, res) {
    const id = req.params.id;

    const query = `
        SELECT
            provinsi_tbs.id AS provinsi_id,
            provinsi_tbs.nama AS provinsi_nama,
            provinsi_tbs.diresmikan AS provinsi_diresmikan,
            provinsi_tbs.photo AS provinsi_photo,
            provinsi_tbs.pulau AS provinsi_pulau,
            kabupaten_tbs.id AS kabupaten_id,
            kabupaten_tbs.nama AS kabupaten_nama,
            kabupaten_tbs.provinsi_id AS kabupaten_provinsi_id,
            kabupaten_tbs.diresmikan AS kabupaten_diresmikan,
            kabupaten_tbs.photo AS kabupaten_photo
        FROM
            kabupaten_tbs
        LEFT JOIN
            provinsi_tbs ON provinsi_tbs.id = kabupaten_tbs.provinsi_id
        WHERE
            kabupaten_tbs.id = :id;
    `;

    const obj = await sequelize.query(query, {
        replacements: { id: id },
        type: QueryTypes.SELECT
    });

    res.render("detail-kab", { data: obj[0] });
}

app.listen(port, () => {
    console.log(`Server berjalan pada port http://localhost:${port}`);
});
