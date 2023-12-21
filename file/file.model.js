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
  let lastName = "";

  // Find the first uppercase character
  let firstUpperCaseIndex = -1;
  for (var i = 0; i < file.name.length; i++) {
    if (file.name[i] === file.name[i].toUpperCase()) {
      firstUpperCaseIndex = i;
      lastName = file.name[i];
      break;
    }
  }

  // Collect uppercase characters for lastName
  for (var i = firstUpperCaseIndex + 1; i < file.name.length; i++) {
    if (file.name[i] === file.name[i].toUpperCase()) {
      lastName = lastName + file.name[i];
    } else {
      break; // Stop when a lowercase character is encountered
    }
  }

  let firstName = "";
  lastName = lastName.slice(0, lastName.length - 1);

  // Collect lowercase characters for firstName
  for (
    var i = firstUpperCaseIndex + lastName.length;
    i < file.name.length;
    i++
  ) {
    firstName = firstName + file.name[i];
  }

  // console.log("LastName:", lastName);
  // console.log("FirstName:", firstName);

  // DO NOT DELETE!!!!!!!!!!!!!!!!!!!!!!!!
  // const sql = `
  // INSERT INTO mitarbeiter(mname,mfname,bid)
  // VALUES(?,?,?)`
  // pool.query(sql, [firstName,lastName,1], error => {
  //   console.log(error); 
  // });

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
       WHERE mname = ? and mfname = ?`;

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
        pool.query(sql1, [firstName,lastName
        ], (error2, results2) => {
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
  /*NL 
A 
E 
RIP 
B 
W1 (sw)
E/P + PR(RT)
AF
B/Lok/C
D/1
RR
D
D/2
F/M
B/D
RT/Mod.
B/Spezial
A/P
A/P M-RIP
E/M
E/M M-NL
E/M M-RIP
W2 (sw)
W4 (sw)
Fe
B/Planung
A(Sportpl.)
W3(sw)/KURS
AF
E/P + PR
RN
PuC/Vorb.
PuC/Mod.
BF
W2(sw)/KURS
RO/PT
Rom
PS
kein Dienst
F/M
FREI
KURS*
FS/Rai Sport
43*/
  const sql = `
  SELECT
  m.mname AS name, a.mid AS id,
  COUNT(CASE WHEN 'NL' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'NL' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'NL' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'NL' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'NL' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'NL' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'NL' = a.awsonntag THEN 1 END) AS NL,
  
  COUNT(CASE WHEN 'A' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'A' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'A' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'A' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'A' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'A' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'A' = a.awsonntag THEN 1 END) AS A,
  
  COUNT(CASE WHEN 'E' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'E' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'E' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'E' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'E' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'E' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'E' = a.awsonntag THEN 1 END) AS E,
  
  COUNT(CASE WHEN 'RIP' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'RIP' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'RIP' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'RIP' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'RIP' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'RIP' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'RIP' = a.awsonntag THEN 1 END) AS RIP,
  
  COUNT(CASE WHEN 'B' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'B' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'B' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'B' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'B' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'B' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'B' = a.awsonntag THEN 1 END) AS B,
  
  COUNT(CASE WHEN 'W1 (sw)' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'W1 (sw)' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'W1 (sw)' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'W1 (sw)' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'W1 (sw)' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'W1 (sw)' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'W1 (sw)' = a.awsonntag THEN 1 END) AS 'W1_sw',
  
  COUNT(CASE WHEN 'E/P + PR (RT)' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'E/P + PR (RT)' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'E/P + PR (RT)' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'E/P + PR (RT)' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'E/P + PR (RT)' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'E/P + PR (RT)' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'E/P + PR (RT)' = a.awsonntag THEN 1 END) AS 'E_P_PR_RT',
  
  COUNT(CASE WHEN 'AF' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'AF' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'AF' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'AF' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'AF' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'AF' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'AF' = a.awsonntag THEN 1 END) AS AF,
  
  COUNT(CASE WHEN 'B/Lok/C' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'B/Lok/C' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'B/Lok/C' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'B/Lok/C' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'B/Lok/C' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'B/Lok/C' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'B/Lok/C' = a.awsonntag THEN 1 END) AS 'B_Lok_C',
  
  COUNT(CASE WHEN 'D/1' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'D/1' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'D/1' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'D/1' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'D/1' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'D/1' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'D/1' = a.awsonntag THEN 1 END) AS 'D_1',
  
  COUNT(CASE WHEN 'D' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'D' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'D' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'D' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'D' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'D' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'D' = a.awsonntag THEN 1 END) AS D,
  
  COUNT(CASE WHEN 'D/2' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'D/2' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'D/2' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'D/2' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'D/2' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'D/2' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'D/2' = a.awsonntag THEN 1 END) AS 'D_2',
  
  COUNT(CASE WHEN 'F/M' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'F/M' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'F/M' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'F/M' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'F/M' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'F/M' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'F/M' = a.awsonntag THEN 1 END) AS 'F_M',
  
  COUNT(CASE WHEN 'B/D' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'B/D' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'B/D' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'B/D' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'B/D' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'B/D' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'B/D' = a.awsonntag THEN 1 END) AS 'B_D',
  
  COUNT(CASE WHEN 'A/P' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'A/P' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'A/P' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'A/P' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'A/P' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'A/P' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'A/P' = a.awsonntag THEN 1 END) AS 'A_P',
  
  COUNT(CASE WHEN 'A/P M-RIP' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'A/P M-RIP' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'A/P M-RIP' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'A/P M-RIP' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'A/P M-RIP' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'A/P M-RIP' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'A/P M-RIP' = a.awsonntag THEN 1 END) AS 'A_P_M_RIP',
  
  COUNT(CASE WHEN 'E/M' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'E/M' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'E/M' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'E/M' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'E/M' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'E/M' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'E/M' = a.awsonntag THEN 1 END) AS 'E_M',
  
  COUNT(CASE WHEN 'E/M M-NL' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'E/M M-NL' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'E/M M-NL' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'E/M M-NL' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'E/M M-NL' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'E/M M-NL' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'E/M M-NL' = a.awsonntag THEN 1 END) AS 'E_M_M_NL',
  
  COUNT(CASE WHEN 'E/M M-RIP' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'E/M M-RIP' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'E/M M-RIP' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'E/M M-RIP' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'E/M M-RIP' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'E/M M-RIP' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'E/M M-RIP' = a.awsonntag THEN 1 END) AS 'E_M_M_RIP',
  
  COUNT(CASE WHEN 'W2 (sw)' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'W2 (sw)' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'W2 (sw)' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'W2 (sw)' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'W2 (sw)' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'W2 (sw)' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'W2 (sw)' = a.awsonntag THEN 1 END) AS 'W2_sw',
  
  COUNT(CASE WHEN 'W4 (sw)' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'W4 (sw)' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'W4 (sw)' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'W4 (sw)' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'W4 (sw)' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'W4 (sw)' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'W4 (sw)' = a.awsonntag THEN 1 END) AS 'W4_sw',
  
  COUNT(CASE WHEN 'Fe' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'Fe' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'Fe' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'Fe' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'Fe' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'Fe' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'Fe' = a.awsonntag THEN 1 END) AS 'Fe',
  
  COUNT(CASE WHEN 'B/Planung' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'B/Planung' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'B/Planung' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'B/Planung' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'B/Planung' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'B/Planung' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'B/Planung' = a.awsonntag THEN 1 END) AS 'B_Planung',
  
  COUNT(CASE WHEN 'E/P + PR' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'E/P + PR' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'E/P + PR' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'E/P + PR' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'E/P + PR' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'E/P + PR' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'E/P + PR' = a.awsonntag THEN 1 END) AS 'E_P_PR',
  
  COUNT(CASE WHEN 'B/Spezial' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'B/Spezial' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'B/Spezial' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'B/Spezial' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'B/Spezial' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'B/Spezial' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'B/Spezial' = a.awsonntag THEN 1 END) AS 'B_Spezial',
  
  COUNT(CASE WHEN 'PuC/Vorb.' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'PuC/Vorb.' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'PuC/Vorb.' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'PuC/Vorb.' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'PuC/Vorb.' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'PuC/Vorb.' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'PuC/Vorb.' = a.awsonntag THEN 1 END) AS 'PuC_Vorb',
  
  COUNT(CASE WHEN 'PuC/Mod.' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'PuC/Mod.' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'PuC/Mod.' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'PuC/Mod.' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'PuC/Mod.' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'PuC/Mod.' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'PuC/Mod.' = a.awsonntag THEN 1 END) AS 'PuC_Mod',
  
  COUNT(CASE WHEN 'BF' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'BF' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'BF' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'BF' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'BF' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'BF' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'BF' = a.awsonntag THEN 1 END) AS BF,
  
  COUNT(CASE WHEN 'RO/PT' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'RO/PT' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'RO/PT' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'RO/PT' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'RO/PT' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'RO/PT' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'RO/PT' = a.awsonntag THEN 1 END) AS 'RO_PT',
  
  COUNT(CASE WHEN 'Rom' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'Rom' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'Rom' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'Rom' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'Rom' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'Rom' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'Rom' = a.awsonntag THEN 1 END) AS Rom,
  
  COUNT(CASE WHEN 'Ps' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'Ps' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'Ps' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'Ps' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'Ps' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'Ps' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'Ps' = a.awsonntag THEN 1 END) AS Ps,
  
  COUNT(CASE WHEN 'FS/Rai Sport' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'FS/Rai Sport' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'FS/Rai Sport' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'FS/Rai Sport' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'FS/Rai Sport' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'FS/Rai Sport' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'FS/Rai Sport' = a.awsonntag THEN 1 END) AS 'FS_Rai_Sport'
  
FROM
  arbeiterwochen a
JOIN
  mitarbeiter m ON a.mid = m.mid
GROUP BY
  m.mname
ORDER BY
  m.mid;
`;

  pool.query(sql, (error, result) => {
    if (error) {
      console.log("Error in query", error);
      callback("Database error", null);
    } else {
      callback(null, result);
    }
  });

}

function getSpecificList(ID, callback) {
  const sql=`
  SELECT
  m.mname AS name,
  COUNT(CASE WHEN 'NL' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'NL' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'NL' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'NL' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'NL' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'NL' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'NL' = a.awsonntag THEN 1 END) AS NL,
  
  COUNT(CASE WHEN 'A' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'A' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'A' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'A' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'A' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'A' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'A' = a.awsonntag THEN 1 END) AS A,
  
  COUNT(CASE WHEN 'E' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'E' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'E' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'E' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'E' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'E' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'E' = a.awsonntag THEN 1 END) AS E,
  
  COUNT(CASE WHEN 'RIP' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'RIP' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'RIP' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'RIP' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'RIP' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'RIP' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'RIP' = a.awsonntag THEN 1 END) AS RIP,
  
  COUNT(CASE WHEN 'B' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'B' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'B' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'B' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'B' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'B' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'B' = a.awsonntag THEN 1 END) AS B,
  
  COUNT(CASE WHEN 'W1 (sw)' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'W1 (sw)' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'W1 (sw)' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'W1 (sw)' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'W1 (sw)' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'W1 (sw)' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'W1 (sw)' = a.awsonntag THEN 1 END) AS 'W1(sw)',
  
  COUNT(CASE WHEN 'E/P + PR (RT)' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'E/P + PR (RT)' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'E/P + PR (RT)' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'E/P + PR (RT)' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'E/P + PR (RT)' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'E/P + PR (RT)' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'E/P + PR (RT)' = a.awsonntag THEN 1 END) AS 'E/P+PR(RT)',
  
  COUNT(CASE WHEN 'AF' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'AF' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'AF' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'AF' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'AF' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'AF' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'AF' = a.awsonntag THEN 1 END) AS AF,
  
  COUNT(CASE WHEN 'B/Lok/C' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'B/Lok/C' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'B/Lok/C' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'B/Lok/C' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'B/Lok/C' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'B/Lok/C' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'B/Lok/C' = a.awsonntag THEN 1 END) AS 'B/Lok/C',
  
  COUNT(CASE WHEN 'D/1' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'D/1' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'D/1' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'D/1' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'D/1' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'D/1' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'D/1' = a.awsonntag THEN 1 END) AS 'D/1',
  
  COUNT(CASE WHEN 'D' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'D' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'D' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'D' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'D' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'D' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'D' = a.awsonntag THEN 1 END) AS D,
  
  COUNT(CASE WHEN 'D/2' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'D/2' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'D/2' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'D/2' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'D/2' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'D/2' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'D/2' = a.awsonntag THEN 1 END) AS 'D/2',
  
  COUNT(CASE WHEN 'F/M' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'F/M' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'F/M' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'F/M' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'F/M' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'F/M' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'F/M' = a.awsonntag THEN 1 END) AS 'F/M',
  
  COUNT(CASE WHEN 'B/D' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'B/D' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'B/D' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'B/D' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'B/D' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'B/D' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'B/D' = a.awsonntag THEN 1 END) AS 'B/D',
  
  COUNT(CASE WHEN 'A/P' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'A/P' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'A/P' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'A/P' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'A/P' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'A/P' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'A/P' = a.awsonntag THEN 1 END) AS 'A/P',
  
  COUNT(CASE WHEN 'A/P M-RIP' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'A/P M-RIP' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'A/P M-RIP' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'A/P M-RIP' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'A/P M-RIP' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'A/P M-RIP' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'A/P M-RIP' = a.awsonntag THEN 1 END) AS 'A/P M-RIP',
  
  COUNT(CASE WHEN 'E/M' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'E/M' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'E/M' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'E/M' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'E/M' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'E/M' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'E/M' = a.awsonntag THEN 1 END) AS 'E/M',
  
  COUNT(CASE WHEN 'E/M M-NL' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'E/M M-NL' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'E/M M-NL' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'E/M M-NL' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'E/M M-NL' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'E/M M-NL' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'E/M M-NL' = a.awsonntag THEN 1 END) AS 'E/M M-NL',
  
  COUNT(CASE WHEN 'E/M M-RIP' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'E/M M-RIP' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'E/M M-RIP' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'E/M M-RIP' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'E/M M-RIP' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'E/M M-RIP' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'E/M M-RIP' = a.awsonntag THEN 1 END) AS 'E/M M-RIP',
  
  COUNT(CASE WHEN 'W2 (sw)' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'W2 (sw)' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'W2 (sw)' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'W2 (sw)' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'W2 (sw)' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'W2 (sw)' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'W2 (sw)' = a.awsonntag THEN 1 END) AS 'W2 (sw)',
  
  COUNT(CASE WHEN 'W4 (sw)' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'W4 (sw)' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'W4 (sw)' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'W4 (sw)' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'W4 (sw)' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'W4 (sw)' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'W4 (sw)' = a.awsonntag THEN 1 END) AS 'W4 (sw)',
  
  COUNT(CASE WHEN 'Fe' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'Fe' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'Fe' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'Fe' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'Fe' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'Fe' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'Fe' = a.awsonntag THEN 1 END) AS 'Fe',
  
  COUNT(CASE WHEN 'B/Planung' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'B/Planung' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'B/Planung' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'B/Planung' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'B/Planung' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'B/Planung' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'B/Planung' = a.awsonntag THEN 1 END) AS 'B/Planung',
  
  COUNT(CASE WHEN 'E/P + PR' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'E/P + PR' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'E/P + PR' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'E/P + PR' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'E/P + PR' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'E/P + PR' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'E/P + PR' = a.awsonntag THEN 1 END) AS 'E/P + PR',
  
  COUNT(CASE WHEN 'B/Spezial' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'B/Spezial' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'B/Spezial' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'B/Spezial' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'B/Spezial' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'B/Spezial' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'B/Spezial' = a.awsonntag THEN 1 END) AS 'B/Spezial',
  
  COUNT(CASE WHEN 'PuC/Vorb.' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'PuC/Vorb.' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'PuC/Vorb.' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'PuC/Vorb.' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'PuC/Vorb.' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'PuC/Vorb.' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'PuC/Vorb.' = a.awsonntag THEN 1 END) AS 'PuC/Vorb.',
  
  COUNT(CASE WHEN 'PuC/Mod.' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'PuC/Mod.' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'PuC/Mod.' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'PuC/Mod.' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'PuC/Mod.' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'PuC/Mod.' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'PuC/Mod.' = a.awsonntag THEN 1 END) AS 'PuC/Mod.',
  
  COUNT(CASE WHEN 'BF' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'BF' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'BF' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'BF' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'BF' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'BF' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'BF' = a.awsonntag THEN 1 END) AS BF,
  
  COUNT(CASE WHEN 'RO/PT' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'RO/PT' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'RO/PT' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'RO/PT' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'RO/PT' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'RO/PT' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'RO/PT' = a.awsonntag THEN 1 END) AS 'RO/PT',
  
  COUNT(CASE WHEN 'Rom' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'Rom' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'Rom' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'Rom' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'Rom' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'Rom' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'Rom' = a.awsonntag THEN 1 END) AS Rom,
  
  COUNT(CASE WHEN 'Ps' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'Ps' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'Ps' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'Ps' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'Ps' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'Ps' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'Ps' = a.awsonntag THEN 1 END) AS Ps,
  
  COUNT(CASE WHEN 'FS/Rai Sport' = a.awmontag THEN 1 END) +
  COUNT(CASE WHEN 'FS/Rai Sport' = a.awdienstag THEN 1 END) +
  COUNT(CASE WHEN 'FS/Rai Sport' = a.awmittwoch THEN 1 END) +
  COUNT(CASE WHEN 'FS/Rai Sport' = a.awdonnerstag THEN 1 END) +
  COUNT(CASE WHEN 'FS/Rai Sport' = a.awfreitag THEN 1 END) +
  COUNT(CASE WHEN 'FS/Rai Sport' = a.awsamstag THEN 1 END) +
  COUNT(CASE WHEN 'FS/Rai Sport' = a.awsonntag THEN 1 END) AS 'FS/Rai Sport'
  
FROM
  arbeiterwochen a
JOIN
  mitarbeiter m ON a.mid = m.mid AND a.mid = ${ID}
GROUP BY
  m.mname
ORDER BY
  m.mid; 
  `;

  pool.query(sql, (error, result) => {
    if (error) {
      console.log("Error in query", error);
      callback("Database error", null);
    } else {
      callback(null, result);
    }
  });
}

module.exports = { getAll, remove, get, save, getUser, getUserList, getSpecificList };
