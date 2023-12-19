const mysql = require("mysql");

const pool = mysql.createPool({
  connectionLimit: 5,
  host: "ulsq0qqx999wqz84.chr7pe7iynqr.eu-west-1.rds.amazonaws.com",
  user: "g5ec4ljgfr0kwo61",
  password: "mae6mu11wtk59d7k",
  database: "de7rtnl9b2hldxvv",
});

let data = [];

function getAll() {
  return data;
}
function remove(uid) {
  data = data.filter((file) => file.uid !== uid);
}
function get(uid) {
  return data.find((file) => file.uid === uid);
}

async function save(file, plan) {
  try {
    // sql Query to insert Wochenplan into DB
    const sqlWeek = `
      INSERT INTO wochenplaene(wwochenstartdatum,wuploaddatum,wexcel)
      VALUES (?,?,?)`;

    // sql Query to get wid from DB
    const sql = `      
      SELECT wid 
      FROM wochenplaene
      WHERE wwochenstartdatum = '${plan.start}'`;

    // sql Query to get mid from DB
    const sql1 = `
      SELECT mid
      FROM mitarbeiter
      WHERE mname = ?`;

    // sql Query to insert data into DB
    const sql2 = `
      INSERT INTO arbeiterwochen(wid, mid, awmontag, awdienstag, awmittwoch, awdonnerstag, awfreitag, awsamstag, awsonntag)
      VALUES (?,?,?,?,?,?,?,?,?)`;

    // Values used to insert Wochenplan
    const valuesWeek = [plan.start, plan.upload, plan.xlsfile];

    // Values used to insert data
    const values = [
      file.montag,
      file.dienstag,
      file.mittwoch,
      file.donnerstag,
      file.freitag,
      file.samstag,
      file.sonntag,
    ];

    let wid = null;
    let mid = null;

    // Execute the first query to get wid
    pool.query(sqlWeek, valuesWeek, (errorWeek) => {
      pool.query(sql, (error1, results1) => {
        if (error1) {
          console.error("Error executing query 1:", error1);
          return;
        }

        wid = results1.length > 0 ? results1[0].wid : null;

        // Execute the second query to get mid
        pool.query(sql1, [file.name], (error2, results2) => {
          if (error2) {
            console.error("Error executing query 2:", error2);
            return;
          }

          mid = results2.length > 0 ? results2[0].mid : null;

          // Perform the insert query with the obtained values
          pool.query(sql2, [wid, mid, ...values], (error3) => {
            if (error3) {
              console.error("Error executing insert query:", error3);
              return;
            }

            // If execution reaches here, the insert was successful
          });
        });
      });
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

const crypto = require("crypto");
async function getUser(username, password) {
  if (!username || !password) {
    return Promise.reject("User not set");
  } else {
    const passwordHash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");
    const sql = `
        SELECT uid, uusername, ufirstname, ulastname, upasswordhash
        FROM users
        WHERE uusername = ? AND upasswordhash = ?
        `;

    return new Promise((resolve, reject) => {
      pool.query(sql, [username, passwordHash], (error, result) => {
        if (error) {
          console.log("Error in query:", error);
          reject("Database error");
          return;
        }

        if (!result || result.length === 0) {
          reject("User not found");
        } else {
          resolve(result[0]);
        }
      });
    });
  }
}

function getUserList(callback) {
  const sql = `
    SELECT a.mid, a.awmontag, a.awdienstag, a.awmittwoch, a.awdonnerstag, a.awfreitag, a.awsamstag, a.awsonntag, m.mname
    FROM arbeiterwochen a
    JOIN mitarbeiter m ON a.mid = m.mid
    ORDER BY m.mid`;

  pool.query(sql, (error, result) => {
    if (error) {
      console.log("Error in query", error);
      callback("Database error", null);
    } else {
      callback(null, result);
    }
  });
}


module.exports = { getAll, remove, get, save, getUser, getUserList };
