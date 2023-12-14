const { v4: uuid } = require('uuid');
const mysql = require('mysql');
const connectionProperties = {
  host: 'ulsq0qqx999wqz84.chr7pe7iynqr.eu-west-1.rds.amazonaws.com',
  user: 'g5ec4ljgfr0kwo61',
  password: 'mae6mu11wtk59d7k',
  database: 'de7rtnl9b2hldxvv'
};

const pool  = mysql.createPool({
  connectionLimit : 5,
  host            : 'ulsq0qqx999wqz84.chr7pe7iynqr.eu-west-1.rds.amazonaws.com',
  user            : 'g5ec4ljgfr0kwo61',
  password        : 'mae6mu11wtk59d7k',
  database        : 'de7rtnl9b2hldxvv'
});

class Database {
  constructor(connectionProperties) {
    this.connection = mysql.createConnection(connectionProperties);
  }
  query(sql, params) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, params, (error, result) => {
        if (error) { 
          console.log("encountered error %o", error); 
          reject(error);
        }
        resolve(result);
      });
    });
  }
  queryClose(sql, params) {
    console.log("starting query")
    const ret = this.query(sql, params);
    console.log("finished query\nret: %o\nnow closing", ret)
    this.close();
    console.log("closed")
    return ret;
  }
  close() {
    return new Promise((resolve, reject) => {
      this.connection.end(error => {
        if (error) { reject(error); }
        resolve();
      });
    });
  }
}

let data = [
];

function getAll() {
  return data;
}
function remove(uid) {
  data = data.filter(file => file.uid !== uid);
}
function get(uid) {
  return data.find(file => file.uid === uid);
}

//used to save wochenplaene into DB
async function saveWoche(file) {
  
  // insert wochenplan into DB
  const sql=`
    INSERT INTO wochenplaene(wwochenstartdatum,wuploaddatum,wexcel)
      VALUES (?,?,?)`;
  
  const values=[file.start,file.upload,file.xlsfile];

  // commented because of development purposes
  pool.query(sql, values);
}

async function save(file,date) {

  // DONT DELETE
  // insert all names in the XLS into the DB
  // const sql=`
  // INSERT INTO mitarbeiter(mname,bid)
  //   VALUES ('${file.name}','1')`;
  // pool.query(sql, function(error) {
  //   if (error) {
  //     return console.log(error);
  //   }
  // })

  // insert data into the DB
  // getting wid through startdate
  const sql = `
  SELECT wid 
  FROM wochenplaene
  WHERE wwochenstartdatum = ?`;

const sql1 = `
  SELECT mid
  FROM mitarbeiter
  WHERE mname = ?`;

const sql2 = `
  INSERT INTO arbeiterwochen(wid,mid,awmontag,awdienstag,awmittwoch,awdonnerstag,awfreitag,awsamstag,awsonntag)
  VALUES (?,?,?,?,?,?,?,?,?)`;

const values = [file.montag,file.dienstag,file.mittwoch,file.donnerstag,file.freitag,file.samstag,file.sonntag];

let wid, mid;

// Execute the first query to get wid
const promise1 = new Promise((resolve, reject) => {
  pool.query(sql, [date], (error, results) => {
    if (error) {
      reject(error);
    } else {
      console.log(results);
      wid = results.length > 0 ? results[0].wid : null;
      console.log('wid:', wid);
      resolve(wid);
    }
  });
});

const promise2 = promise1.then((wid) => {
  if (wid === null) {
    // Handle the case where wid is null, e.g., log an error
    // console.error('Error: wid iaskjdbasjdhasjkhs null');
    // console.log(promise1.state)
    // return Promise.reject('wid isnananananananana null');
  }

  return new Promise((resolve, reject) => {
    pool.query(sql1, [file.name], (error, results) => {
      if (error) {
        reject(error);
      } else {
        mid = results.length > 0 ? results[0].mid : null;
        resolve({ wid, mid });
      }
    });
  });
});

Promise.all([promise1, promise2])
  .then(([wid, { mid }]) => {
    if (wid == null || mid ==null) {
      console.error('Error: wid or mid is null');
      return; // Handle the error appropriately
    }

    // Perform the insert query with the obtained values
    pool.query(sql2, [wid, mid, ...values], (error, insertResult) => {
      if (error) {
        console.error('Error executing insert query:', error);
      }
    });
  })
  .catch((error) => {
    console.error('Promise.all Error:', error);
  });

promise1.catch((error) => {
  console.error('Promise 1 Error:', error);
});

promise2.catch((error) => {
  console.error('Promise 2 Error:', error);
});

  



  data.push(file);
}
const crypto = require('crypto');
async function getUser(username, password) {
  if (!username || !password) {
    return Promise.reject('User not set');
  } else {
    try {
      const database = new Database(connectionProperties);
      const sql = `
        SELECT uid, uusername, ufirstname, ulastname, upasswordhash
        FROM users
        WHERE uusername = ? AND upasswordhash = ?;
        `;
      const passwordHash = crypto.createHash('sha256')
        .update(password)
        .digest('hex');
      const result = await database.queryClose(sql, [username, passwordHash]);
      return !result || result.length === 0 ?
        Promise.reject('User not found') : Promise.resolve(result[0]);
    } catch (error) {
      return Promise.reject('Database error');
    }
  }
}
module.exports = { getAll, remove, get, saveWoche, save, getUser };