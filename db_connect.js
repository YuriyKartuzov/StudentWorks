var mysql = require('mysql');
const fs = require('fs');

// Setting up DB metadata
const DBname = process.env.DBname || "sw";
console.log("Database used: " + DBname);

// CONNECTION
module.exports.connect = function (err) {
    connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "Newhome1!",
        database: DBname,
        port: 3306
    });
};

module.exports.end = function () {
    connection.end();
};

makeDBconnection = function () {
    conn = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "Newhome1!",
        database: DBname,
        port: 3306
    });
};

//---------------- USERS ----------------
module.exports.getAllUsers = function (cb) {
    var sql = 'SELECT userID, firstName, lastName, email, userName, program,' +
        'registrationDate, userType FROM user';

    makeDBconnection();
    conn.query(sql, (err, result) => {
        if (err)
            cb(err, null);
        else
            cb(null, result);
    });
    conn.end();
};

module.exports.getOneUserByUsername = function (username, callback) {
    var sql = `SELECT * FROM user WHERE userName = '${username}';`;
    runQuery(sql, callback);
};

module.exports.getOneUserByID = function (userID, callback) {
    var sql = `SELECT * FROM user WHERE userID = ${userID}`;
    runQuery(sql, callback);
};

module.exports.createUser = function (user) {
    //console.log("Inside createUser():");
    var sql = `INSERT INTO user (firstName, lastName, password, email, userName, userType, program, registrationStatus, registrationDate, registrationCode) \
    VALUES ('${user.firstName}', '${user.lastName}', '${user.password}', '${user.email}', '${user.username}', '${user.userType}', '${user.program}', ${user.registrationStatus}, now(), ${user.registrationCode})`;
    connection.query(sql, (err, result) => {
        if (err) {
            console.log("Failed SQL:", sql);
            throw err;
        } else {
            console.log(`${user.username} is added to database`);
        }
    });
};

module.exports.getUserExist = function (userName, callback) {
    // returns 1 if found 0 otherwise
    var sql = `SELECT EXISTS(SELECT * FROM user WHERE userName = '${userName}') AS userExist 
                FROM user LIMIT 1;`
    runQuery(sql, callback);
};

module.exports.updateProfile = function (user, cb) {
    var sql = `UPDATE user
                SET firstName = '${user.firstName}',
                    lastName = '${user.lastName}',
                    email = '${user.email}',
                    program = '${user.program}',\n`;
    if (user.fileName != null) {
        sql += `    imagePath = '${user.fileName}',`;
    }
    sql += `        userDescription = '${user.description}'                    
                    WHERE userName = '${user.userName}'; `;

    makeDBconnection();
    var query = conn.query(sql, (err, result) => {
        if (err)
            cb(err, null);
        else
            cb(null, result);
    });
    conn.end();
};

module.exports.updateUserProfile = function (user, callback) {
    var sql = `UPDATE user
                SET firstName = '${user.firstName}',
                    lastName  = '${user.lastName}',
                    email     = '${user.email}',
                    program   = '${user.program}',\n`;

    if (user.imagePath != null)
        sql += `    imagePath = '${user.imagePath}',`;

    sql += ` userDescription = '${user.description}'                    
                WHERE userName = '${user.userName}'; `;
    //console.log ("uUP: ",sql);
    runQuery(sql, callback);
};

module.exports.setAdmin = function (userID, callback) {
    var sql = `UPDATE user 
                SET userType='Admin'
                WHERE userID = ${userID}`;
    runQuery(sql, callback);
};

module.exports.unsetAdmin = function (userID, callback) {
    var sql = `UPDATE user 
                SET userType='Contributor'
                WHERE userID = ${userID}`;
    runQuery(sql, callback);
};

module.exports.deleteUser = function (userID, callback) {
    var sql = `DELETE FROM user
                WHERE userID = ${userID}`;
    runQuery(sql, callback);
}

//-----------PROJECTS -------------------
module.exports.getOneProject = function (id, callback) {
    var sql = `SELECT * FROM project WHERE projectID=${id}`;
    runQuery(sql, callback);
};

module.exports.getAllProjects = function (callback) {
    var sql = `SELECT * FROM project WHERE status = 'approved';`;
    runQuery(sql, callback);
};

module.exports.getAllProjectsAdmin = function (callback) {
    var sql = `SELECT * FROM project;`;
    runQuery(sql, callback);
};

module.exports.approveProject = function (projectID, callback) {
    var sql = `UPDATE project 
                SET status='approved'
                WHERE projectID = ${projectID}`;
    runQuery(sql, callback);
};

module.exports.takedownProject = function (projectID, callback) {
    var sql = `UPDATE project 
                SET status='pending'
                WHERE projectID = ${projectID}`;
    runQuery(sql, callback);
};

module.exports.getProjectsByUser = function (userID, callback) {
    var sql = ` SELECT proj.* FROM project proj
                    JOIN userProject b on proj.projectID = b.projectID
                    JOIN user u on b.userID = u.userID
                WHERE u.userID = ${userID};`;
    runQuery(sql, callback);
};

module.exports.createProject = function (prj, callback) {
    let prjID;
    let userID = prj.userID;

    let sql = "INSERT INTO project " +
        `VALUES(NULL, '${prj.title}', '${prj.description}', now(), '${prj.language}',` +
        `'${prj.framework}', '${prj.category}', '${prj.picName}', '${prj.videoName}', 'pending',` +
        `'${prj.platform}', '${prj.color}', NULL, '${prj.developers}');`;

    let sql2 = `SELECT projectID FROM project WHERE imageFilePath="${prj.picName}" AND videoFilePath="${prj.videoName}";`;

    makeDBconnection();

    // DB.  Add row to Project table
    conn.query(sql, (err, res) => {
        if (err) callback("Adding project: " + err, null);

        // DB.  Get projectID and move files
        conn.query(sql2, (err, res) => {
            if (err) callback("get project ID : " + err, null);

            prjID = res[0].projectID;

            fs.mkdir("./project/" + prjID, 0744, function (err) {
                if (err) callback("make directories query" + err, null);

                var imageTemp = "./project/temp/" + prj.picName;
                var imageNew = "./project/" + prjID + "/" + prj.picName;
                var videoTemp = "./project/temp/" + prj.videoName;
                var videoNew = "./project/" + prjID + "/" + prj.videoName;

                fs.rename(imageTemp, imageNew, (err) => { if (err) callback("moving image" + err, null); });
                fs.rename(videoTemp, videoNew, (err) => { if (err) callback("moving video" + err, null); });
            });


            // DB.  Bride between userID and prjID
            var sql3 = `INSERT INTO userProject (userID, projectID) VALUES(${userID}, ${prjID});`;
            conn.query(sql3, (err, res) => {
                if (err) callback(err, null);

                callback(null, res);
            });

            conn.end();
        });
    });
};

//--------- REGISTRATION --------------
module.exports.validateRegistration = function (registrationCode) {
    var sql = ` UPDATE user
                SET registrationStatus = TRUE
                WHERE registrationCode = ${registrationCode};`
    connection.query(sql, (err, result) => {
        if (err) {
            console.log("Failed SQL:", sql);
            throw err;
        } else {
            console.log(`registration code ${registrationCode} is updated to database`);
        }
    });
};

module.exports.updatePasswordByUsername = function (userName, password, callback) {
    var sql = ` UPDATE user
                SET password = '${password}'
                WHERE userName = '${userName}';`;
    runQuery(sql, callback);
};

//returns 0 if registration code does not exist in database, and 1 if it is found
module.exports.getRegCodeExist = function (registrationCode, callback) {
    var sql = `SELECT EXISTS(SELECT * FROM user WHERE registrationCode = ${registrationCode}) AS regCodeExist 
                FROM user LIMIT 1;`;
    runQuery(sql, callback);
};

function runQuery(sql, callback) {
    connection.query(sql, (err, result) => {
        if (err) {
            console.log("Failed query: ", sql);
            throw err;
        } else {
            callback(null, result);
        }
    });
};

// function to encode file data to base64 encoded string
function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

// function to create file from base64 encoded string
function base64_decode(base64str, file) {
    // create buffer object from base64 encoded string, it is important to tell the constructor that the string is base64 encoded
    var bitmap = new Buffer(base64str, 'base64');
    // write buffer to file
    fs.writeFileSync(file, bitmap);
    console.log('******** File created from base64 encoded string ********');
}

// convert image to base64 encoded string
// var base64str = base64_encode('kitten.jpg');
// console.log(base64str);
// // convert base64 string back to image 
// base64_decode(base64str, 'copy.jpg');




// module.exports.createProjectFromContribute = function (project, callback) {
//     var sql = `INSERT INTO project (title, description, creationDate, language, framework, category, ImageFilePath, VideoFilePath, status)  \
//                 VALUES ('${project.title}','${project.desc}', now(),'${project.language}','${project.framework}','${project.category}','${project.imageFilePath}',\
//                 '${project.videoFilePath}', 'pending');\
//                 `;
//     connection.query(sql, (err, result) => {
//         if (err) {
//             console.log("Failed SQL:", sql);
//             throw err;
//         } else {
//             callback(err, result);
//             console.log(`${project.title} is added to database`);
//         }
//     });
// };

// module.exports.associateUserToProject = function (project, projectId, callback) {
//     var sql = `INSERT INTO userProject (userID, projectID) \
//                 VALUES (${project.userID}, ${projectId});`;
//     runQuery(sql, callback);
// };



