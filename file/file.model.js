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
async function save(file) {
  const sql=`
  INSERT INTO mitarbeiter(mname,bid)
    VALUES ('${file.name}','1')`;
  pool.query(sql, function(error) {
    if (error) {
      return console.log(error);
    }
  })
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
module.exports = { getAll, remove, get, save, getUser };