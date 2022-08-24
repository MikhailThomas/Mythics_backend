require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const con = require("./config/dbconn");
const bcrypt = require("bcrypt");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");

const PORT = process.env.PORT
// middleWare
const cookieParser = require("cookie-parser");
// express app
const app = express();
const router = express.Router();
app.use(router, cors(), express.json(),bodyParser.urlencoded({extended: 'true'}));

app.set("port", PORT || 5000);

app.use(express.static("view"));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${app.get("port")}`);
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// monsters
router.get("/monsters", (req, res) => {
  const getAll = `
    select * from Monsters
    `;
  con.query(getAll, (err, results) => {
    if (err) throw err;
    res.json({
      status: 200,
      monsters: results,
    });
  });
});

// get Monsters
router.get('/monsters/:id', (req, res) =>{
  const getSingle = `
  select monsterID = ${req.params.id}
  `
  con.query(getSingle, (err,results)=>{
    if (err) throw err
    res.json({
      status: 200,
      Monsters: results
    });
  });
});

// register
router.post("/monsters", bodyParser.json(), (req, res) => {
  const body = req.body;
  let species = `
    select * from Monsters where species = ?
    `;

  let speciesA = {
    emailAddress: body.emailAddress,
  };
  con.query(email, emailA, async (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      res.json({
        status: 400,
        msg: "This email already exists",
      });
    } else {
      let generateSalt = await bcrypt.genSalt();
      body.password = await bcrypt.hash(body.password, generateSalt);
      body.dateJoined = new Date().toISOString().slice(0, 10);

      const add = `
            insert into Users(firstName, lastName, img, description,favorite, emailAddress, home, phone_number, password, dateJoined) VALUES(?,?,?,?,?,?,?,?,?,?)
            `;
      con.query(
        add,
        [
          body.firstName,
          body.lastName,
          body.img,
          body.description,
          body.favorite,
          body.emailAddress,
          body.home,
          body.phone_number,
          body.password,
          body.dateJoined,
        ],
        (err, results) => {
          if (err) throw err;
          res.json({
            status: 200,
            msg: "You have successfuly registered",
          });
        }
      );
    }
  });
});


// fetch user
router.get("/users", (req, res) => {
  const getAll = "select * from Users";
  con.query =
    (getAll,
    (err, result) => {
      if (err) throw err;
      res.json({
        status: 200,
        users: results,
      });
    });
});

// fetch single user
router.get("/user/:id", (req, res) => {
  const getSingle = `select * from Users where id = ${req.params.id}`;

  con.query =
    (getSingle,
    (err, result) => {
      if (err) throw err;
      res.json({
        status: 200,
        user: results,
      });
    });
});

// register
router.post("/users", bodyParser.json(), (req, res) => {
  const body = req.body;
  let email = `
    select * from Users where emailAddress =?
    `;

  let emailA = {
    emailAddress: body.emailAddress,
  };
  con.query(email, emailA, async (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      res.json({
        status: 400,
        msg: "This email already exists",
      });
    } else {
      let generateSalt = await bcrypt.genSalt();
      body.password = await bcrypt.hash(body.password, generateSalt);
      body.dateJoined = new Date().toISOString().slice(0, 10);

      const add = `
            insert into Users(firstName, lastName, img, description,favorite, emailAddress, home, phone_number, password, dateJoined) VALUES(?,?,?,?,?,?,?,?,?,?)
            `;
      con.query(
        add,
        [
          body.firstName,
          body.lastName,
          body.img,
          body.description,
          body.favorite,
          body.emailAddress,
          body.home,
          body.phone_number,
          body.password,
          body.dateJoined,
        ],
        (err, results) => {
          if (err) throw err;
          res.json({
            status: 200,
            msg: "You have successfuly registered",
          });
        }
      );
    }
  });
});

//LOGIN
router.patch("/users", bodyParser.json(), (req, res) => {
  const body = req.body;
  const login = `
        SELECT * FROM Users WHERE ?
    `;

  let email = {
    emailAddress: body.emailAddress,
  };
  con.query(login, email, async (err, results) => {
    if (err) throw err;
    if (results.length === 0) {
      res.json({
        status: 400,
        msg: "Email Not Found",
      });
    } else {
      if ((await bcrypt.compare(body.password, results[0].password)) == false) {
        res.json({
          status: 404,
          msg: "Password is Incorrect",
        });
      } else {
        const payload = {
          user: {
            firstName: results[0].firstname,
            lastName: results[0].lastname,
            img: results[0].img,
            emailAddress: results[0].emailAddress,
            homeAddress: results[0].homeaddress,
            phone_number: results[0].phone_number,
            password: results[0].password,
            dateJoined: results[0].dateJoined,
          },
        };

        jwt.sign(
          payload,
          process.env.DBSECRET,
          { expiresIn: "10d" },
          (err, token) => {
            if (err) throw err;
            res.json({
              status: 200,
              user: results,
              token: token,
            });
          }
        );
      }
    }
  });
});

// update table
router.put("/users/:id", async (req, res) => {
  const body = req.body
  const update = `
    update Users
    firstname = ?, lastname = ?, img = ?, description = ?, favorite = ?, emailAddress = ?, home = ?, phone_number = ?, password = ?
    where userID=${req.params.id}
    `
    let generateSalt = await bcrypt.genSalt()
    body.password = await bcrypt.hash(body.password, generateSalt)
    con.query(edit, [body.firstName, body.lastName, body.img, body.description, body.favorite, body.emailAddress, body.home, body.phone_number, body.password],(err, result)=>{
        if (err) throw err
        res.json({
            status: 204,
            msg: 'This user has been edited successfully'
        })
    })
});

// delete User

router.delete("/Users/:id", bodyParser.json(),async (req, res) => {
  const deleteUser = `delete from Users where userID = ${req.params.id};
    alter table Users auto_increment = 1;
    `;
  con.query(deleteUser, (err, result) => {
    if (err) throw err;
    res.json({
      status: 204,
      msg: "User has been removed from the database",
    });
  });
});
