const express = require('express');
const nodemailer = require("nodemailer");
//const auth = require('./auth');
const path = require("path");
const multer = require('multer');
const exphbs = require('express-handlebars');
let Client = require('ssh2-sftp-client');
const https = require('https');
const fs = require('fs');
var bodyParser = require('body-parser');
var session = require('express-session');
var sftpStorage = require('multer-sftp-linux');
require('dotenv').config(); // For environment variables

// Includes
const DB = require('./db_connect');
var urlencodedParser = bodyParser.urlencoded({ extended: false });


var profileImageStorage = multer.diskStorage({
    destination: "profilePics",
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});


var upload = multer({ storage: profileImageStorage });

// PROJECT UPLOAD page
const mediaForProject = multer.diskStorage({
    destination: "project/temp/",
    filename: (req, file, callback) => {
        callback(null, file.originalname);
    }
});
var uploadContribute = multer({ storage: mediaForProject });

var uploadVideo = multer({ storage: mediaForProject });

var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "studentworks10",
        pass: "prj666_182a07"
    }
});


// MIDDLE WARE
const app = express();
app.use(express.static('public'));
app.use(express.static('profilePics'));
app.use(express.static('project'));
app.use(session({ // used to generate session tokens
    secret: "keyboard warriors",
    name: "session",
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: 600000 } //cookies expire in 10 minutes
}));
app.use(function (req, res, next) { // No-Cache
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});
app.engine('.hbs', exphbs({ extname: '.hbs' }));
app.set('view engine', '.hbs');


// --------------------------- PAGES :: GET -------------------//

app.get("/", (req, res) => {
    res.status(200).render('main', {
        authenticate: req.session.authenticate,
        userID: req.session.userID,
        userType: req.session.userType
    });
});

app.get('/projectPage', (req, res) => {
    res.status(200).render('project', {
        authenticate: req.session.authenticate,
        userID: req.session.userID,
        userType: req.session.userType
    });
});

app.get('/profile', (req, res) => {
    if (req.session.authenticate) {
        res.status(200).render('profile', {
            authenticate: req.session.authenticate,
            userID: req.session.userID,
            userType: req.session.userType
        });
    } else {
        res.status(200).redirect("/login");
    }
});

app.get('/contribute', (req, res) => {
    if (req.session.authenticate) {
        res.status(200).render('contribute', {
            authenticate: req.session.authenticate,
            userID: req.session.userID,
            userType: req.session.userType,
            videoFile: req.query.video
        });
    } else {
        res.status(200).redirect("/login");
    }
});

app.get('/recording', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/recording/recording.html'));
});

app.get('/adminPage', ensureLogin, (req, res) => {
    res.status(200).render('admin', {
        authenticate: req.session.authenticate,
        userID: req.session.userID,
        userType: req.session.userType
    });
});

app.get('/login', function (req, res) {
    if (req.session.msg) {
        res.render('login', { serverMsg: req.session.msg });
        req.session.msg = ""; // resets the msg after sending it to client        
    } else {
        res.render('login');
    }
});

// FORGOT PASSWORD PAGE
app.get("/login/forgotpass", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'public/login/forgot.html'));
});

// --------------------------- PAGES :: POST -------------------//
// PROJECT UPLOAD page
app.post('/profile', upload.single("img-input"), function (req, res) {
    console.log("Profile:POST");
    if (!req.body)
        return res.sendStatus(400).redirect('/profile');

    var user = {
        userID: req.body.userID,
        userName: req.body.username,
        firstName: req.body.fname,
        lastName: req.body.lname,
        email: req.body.email,
        program: req.body.program,
        description: req.body.description,
        fileName: (req.file == null) ? null : req.file.filename
    }

    DB.updateProfile(user, (err, data) => {
        if (err) {
            console.log("Serverj.js: erro with updating profile. Error: " + err);
            res.send(err);
        } else {
            res.send("success");
        }
    });
})

// PROJECT UPLOAD page
app.post("/upload-project", uploadContribute.array("media", 2), (req, res) => {

    var project = {
        userID : req.body.userID,
        title : req.body.title,
        language : req.body.language,
        framework : req.body.framework,
        platform : req.body.platform,
        color: req.body.color,
        category : req.body.category,
        developers : req.body.developers,
        description : req.body.desc,
        picName : req.body.photo,
        videoName : req.body.video
    }

    DB.createProject(project, (err, data) => {
        if (err) {
            console.log("Server.js: error creating a project: " + err)
            res.send("Apologies, we cannot upload your project at the moment.");
        } else {
            res.status(200).send('Your project is uploaded successfully! Thank you.');
        }
    });

});

app.post('/upload-video', uploadVideo.single('video-blob'), (req, res, next) => {
    var file = req.file.path;
    //turn video path into readable path on VM
    var changed = file.replace(/\\/g, '/');
    //send back the video path
    res.status(200).send(changed);

});

//this is for handling the POST data from login webform
app.post('/login', urlencodedParser, function (req, res) {
    DB.connect();
    if (!req.body) {
        return res.sendStatus(400);
    }
    var username = req.body.username1;
    var password = req.body.pass;
    //console.log(username, password);
    if (!username || !password) {
        // Render 'missing credentials'
        req.session.msg = "Missing credentials.";
        return res.status(401).redirect('/login');
    }
    var results = DB.getOneUserByUsername(username, function (err, data) {
        if (err) {
            console.log(err); throw err;
        } else {
            //validate the data here!!
            var jsonResult = JSON.parse(JSON.stringify(data));
            if (jsonResult.length < 1) {
                //case of username not found
                req.session.msg = "Invalid Username/Password. Login Failed.";
                res.status(401).redirect('/login');
            } else {
                if (jsonResult[0].password === req.body.pass && jsonResult[0].registrationStatus == true) {
                    //set your session information here                    
                    req.session.authenticate = true;
                    req.session.userName = username;
                    req.session.userID = jsonResult[0].userID;
                    req.session.userType = jsonResult[0].userType;
                    //redirect back to main page
                    res.status(200).redirect('/');
                } else {
                    if (jsonResult[0].registrationStatus == false) {
                        req.session.msg = "Login failed, please verify your email.";
                    } else {
                        req.session.msg = "Invalid Username/Password. Login Failed.";
                    }
                    res.status(401).redirect('/login');
                }
            }
        }
    });
    DB.end();
});

//Finish the password resetting (can be used apart from 'Forgetting a password')
app.post('/complete', urlencodedParser, function (req, res) {
    console.log('got to /complete');
    DB.connect();
    var password;
    function checkUser() {
        return new Promise(function (resolve, reject) {
            DB.connect();
            DB.getOneUserByUsername(req.body.username, function (err, data) {
                if (err) {
                    console.log(err); throw err;
                } else {
                    //validate the data here!!
                    var jsonResult = JSON.parse(JSON.stringify(data));
                    if (jsonResult.length < 1) {
                        //case of username not found
                        req.session.msg = "Invalid Username/Password. Failed to update password.";
                        res.status(401).redirect('/login');
                    } else {
                        if (jsonResult[0].password === req.body.oldpassword && jsonResult[0].registrationStatus == true) {
                            resolve("passwords match!");
                        } else {
                            if (jsonResult[0].registrationStatus == false) {
                                req.session.msg = "Password entry failed, please verify your email.";
                            } else {
                                req.session.msg = "Invalid Username/Password.Failed to update password.";
                            }
                            res.status(401).redirect('/login');
                            reject();
                        }
                    }
                }
            });
        });
    }
    function getUser() {
        return new Promise(function (resolve, reject) {

            DB.getOneUserByUsername(req.body.username, function (err, data) {
                if (err) {
                    console.log(err); throw err;
                } else {
                    //validate the data here!!
                    var user = JSON.parse(JSON.stringify(data));
                    if (user.length < 1) {
                        //case of username not found
                        req.session.msg = "Invalid Username/Password. Login Failed.";
                        res.status(401).redirect('/login');
                    } else {
                        if (user[0].password === req.body.oldpassword && user[0].registrationStatus == true) {
                            //Set user password to new password
                            var password = req.body.password1;
                            resolve();
                        }
                        else {
                            req.session.msg = "Passwords did not match.";
                            reject("Password did not match.");
                        }
                    }
                }
                DB.end();
            });
        });
    };

    function updatePassord() {
        return new Promise(function (resolve, reject) {
            DB.connect();
            DB.updatePasswordByUsername(req.body.username, req.body.password1, function (err, data) {
                if (err) {
                    console.log("could not update password");
                    reject();
                }
                else {
                    req.session.authenticate = true;
                    resolve(res.redirect('/'));
                }
            });
            DB.end();
        });
    };
    checkUser()
        .then(getUser, null)
        .then(updatePassord, null)
        .catch(function (rejectMsg) {
            console.log('rejectMsg: ', rejectMsg);
            req.session.msg = rejectMsg;
            res.status(401).redirect('/register');
        });

});

// ------------------ LOGIN / REGISTER HELPERS-------------------//
//Registration page
app.get('/register', function (req, res) {
    if (req.session.msg) {
        res.render('register', { serverMsg: req.session.msg });
        req.session.msg = "";
    } else {
        res.render('register', { serverMsg: req.session.msg });
    }
});

app.get('/complete', function (req, res) {
    res.sendFile(path.join(__dirname, 'public/registration/complete.html'));
});

var rand, mailOptions, host, link;
app.post('/send', urlencodedParser, function (req, res) {

    if (!req.body) {
        return res.sendStatus(400).redirect('/register');
    }

    if (!req.body.name || !req.body.password1 || !req.body.email) {
        req.session.msg = "Missing credentials.";
        return res.status(401).redirect('/register');
    }

    //check if user is already created within the database
    var userExist = false;
    function getUserExistence() {
        DB.connect();
        DB.getUserExist(req.body.name, function (err, data) {
            if (err) { throw err; }
            else {
                userExist = data[0].userExist;
            }
        });
        DB.end();
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                if (userExist === 0) {
                    resolve(userExist);
                } else {
                    reject(`Username "${req.body.name}" is already taken by another user. Please try again.`);
                }
            }, 1000);
        })
    }

    function sendMail() {
        rand = Math.floor((Math.random() * 100000) + 54);
        host = req.get('host');
        link = "https://" + req.get('host') + "/verify?id=" + rand + "&name=" + req.body.name;;
        mailOptions = {
            to: req.body.email,
            subject: "Please confirm your Email account",
            html: `Hello ${req.body.name}, following your recent registration with StudentWorks 
                    Please Click on the link to verify your email.<br>
                    <a href="${link}">Click here to verify</a>
                    <input type="hidden" value=${req.body.name} name="userName"/>`
        }
        smtpTransport.sendMail(mailOptions, function (error, response) {
            if (error) {
                console.log("Server.js: " + error);
                res.end(`We appologize, we cannot create a user at this time. <br>
                    For submission you can use a general user: <b>student</b> password: <b>student<b>`);
            } else {
                req.session.msg = "Please check your email for a verification link.";
                return res.status(401).redirect('/register');
            }
        });
        return new Promise(function (resolve, reject) {
            resolve('sendMail resolved');
        })
    }

    /* this will create a new user into the database based on the 3 fields supplied in login webform
        The user created user will be initially be a contriubtor, without a firstName, lastName or affiliated program
        The registrationCode will be the random value created when the email was sent
    */
    function addUsertoDb() {
        DB.connect();
        var user = {
            firstName: 'NULL',
            lastName: 'NULL',
            email: req.body.email,
            password: req.body.password1,
            username: req.body.name,
            userType: 'Contributor',
            program: 'NULL',
            registrationStatus: 'FALSE',
            registrationCode: rand
        };
        var errorMsg = "";
        try {
            DB.createUser(user);
        } catch (err) {
            errorMsg = err.message;
        }
        DB.end();
        return new Promise(function (resolve, reject) {
            if (errorMsg !== "") {
                reject(errorMsg);
            } else {
                resolve('addUserDb() resolved');
            }
        })
    }

    //executing checking user existence, send mail, adding new user to database in synchronous order
    getUserExistence()
        .then(sendMail, null)
        .then(addUsertoDb, null)
        .catch(function (rejectMsg) {
            //console.log('rejectMsg: ', rejectMsg);
            req.session.msg = rejectMsg;
            res.status(401).redirect('/register');
        });
});

app.get('/verify', function (req, res) {
    console.log(req.protocol + "://" + req.get('host'));
    var regCodeExist = false;

    function getRegCodeExistence() {
        DB.connect();
        DB.getRegCodeExist(req.query.id, function (err, data) {
            if (err) {
                throw err;
            } else {
                regCodeExist = data[0].regCodeExist;
            }
        })
        DB.end();
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                if (regCodeExist == 1) {
                    resolve(req.query.id, regCodeExist);
                } else {
                    reject(`regCode ${req.query.id} was not found in database`);
                }
            }, 1000);
        });
    }

    function validateRegistration(regCode, regCodeExist) {
        console.log("inside validate registration");
        //Update emailRegistration status in database
        DB.connect();
        DB.validateRegistration(regCode);
        DB.end();
        req.session.msg = "Email successfully verified.";
        res.status(200).redirect('/login');
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve("Email successfully verified");
            }, 1000);
        });
    }

    //if((req.protocol+"://"+req.get('host'))==("http://"+host)) {
    if (req.query.id) {
        console.log("Domain is matched. Information is from Authentic email");
        getRegCodeExistence()
            .then(validateRegistration, null)
            .catch(function (rejectMsg) {
                console.log("email is not verified");
                console.log(rejectMsg);
                res.end(`<h1>Bad Request</h1>`);
            });
    } else {
        //console.log("from bad request:", req.protocol+"://"+req.get('host'));
        //console.log("from bad request:","http://"+host);        
        res.send("<h1>Request is from unknown source</h1>");
    }
});

app.post("/login/forgotpassword", urlencodedParser, (req, res) => {
    var tempPass = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 12);
    var userExist = false;
    function getUserExistence() {
        DB.connect();
        DB.getUserExist(req.body.username1, function (err, data) {
            if (err) { throw err; }
            else {
                console.log(data[0].userExist);
                userExist = data[0].userExist;
            }
        });
        DB.end();
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                if (userExist === 0) {
                    reject(`Username "${req.body.username1}" is not in our system!`);
                } else {
                    resolve(userExist);
                }
            }, 1000);
        })
    }

    function getUser() {
        return new Promise(function (resolve, reject) {
            DB.connect();
            DB.getOneUserByUsername(req.body.username1, function (err, data) {
                if (err) {
                    //need to update the page to say no user is found
                    reject();
                }
                //we have a user, go at it...
                else {
                    //grab user data
                    var user = JSON.parse(JSON.stringify(data));
                    //send an e-mail for user to access new password.
                    var passlink = "https://myvmlab.senecacollege.ca:6193/forgotpass/complete";
                    var newMailOptions = {
                        to: user[0].email,
                        subject: "StudentWorks Password Recovery",
                        html: `Hello  ${req.body.name} ,<br> A request has been made to change your password. <br> Your temporary password is: ` + tempPass + ` <br><a href=` + passlink + `>Click here to change your password</a>`
                    }
                    smtpTransport.sendMail(newMailOptions, function (error, response) {
                        console.log('got into /sendMail');
                        if (error) {
                            console.log(error);
                            res.end("error");
                            reject();
                        } else {
                            res.status(200).redirect('/check-email');
                            resolve();
                        }
                    });

                }
            });
        });
        DB.end();
    }

    function updatePassword() {
        return new Promise(function (resolve, reject) {
            DB.connect();
            DB.updatePasswordByUsername(req.body.username1, tempPass, function (err, data) {
                if (err) {
                    console.log("could not update password");
                    reject();
                }
                else {
                    resolve();
                }
            });
            DB.end();
        });
    };
    getUserExistence()
        .then(getUser, null)
        .then(updatePassword, null)
        .catch(function (rejectMsg) {
            console.log('rejectMsg: ', rejectMsg);
            req.session.msg = rejectMsg;
            res.status(401).redirect('/login');
        });

});

app.get("/check-email", (req, res) => {
    res.render('email');
});

app.get("/forgotpass/complete", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'public/registration/complete.html'));
});


// ------------------ APIs ------------------//

//LOGGER
app.get('/logger/:log', (req, res) => {
    if (req.params.log != "") {
        let log = "./logger '" + req.params.log + "'";

        const { exec } = require('child_process');
        exec(log, (err, stdout, stderr) => {
            if (err) {
                res.send(stderr);
            } else {
                res.send(stdout);
            }
        });
    } else {
        console.log("empty string was passed");
    }
});

app.get('/api/getAllUsers', function (req, res) {
    DB.getAllUsers(function (err, data) {
        if (err) {
            console.log("Server.js, error: ", err);
        } else {
            res.writeHead(200, { "Content-type": "application/json" });
            res.end(JSON.stringify(data));
        }
    });
});

app.get('/api/getUserByID/id/:id', function (req, res) {
    var userID = req.params.id;
    if (req.params.id && !isNaN(req.params.id)) {
        DB.connect();
        var results = DB.getOneUserByID(userID, function (err, data) {
            if (err) {
                console.log("Error at getUserByID: ", err);
                throw err;
            } else {
                res.writeHead(200, { "Content-type": "application/json" });
                res.end(JSON.stringify(data));
            }
        });
        DB.end();
    } else {
        res.status(400).end('Bad request, invalid userId');
    }

})

app.get('/api/getAllProjects', function (req, res) {
    try {
        DB.connect();
        var results = DB.getAllProjects(function (err, data) {
            if (err) {
                console.log("ERROR: ", err);
                throw err;
            } else {
                res.writeHead(200, { "Content-type": "application/json" });
                res.end(JSON.stringify(data));
            }
        });
        DB.end();
    } catch (err) {
        console.log("getAllProjects query unsuccessful: Error" + err);
    }
});

app.get('/api/getAllProjectsAdmin', function (req, res) {
    try {
        DB.connect();

        var results = DB.getAllProjectsAdmin(function (err, data) {
            if (err) {
                console.log("ERROR: ", err);
                throw err;
            } else {
                res.writeHead(200, { "Content-type": "application/json" });
                res.end(JSON.stringify(data));
            }
        });
        DB.end();
    } catch (err) {
        console.log("getAllProjectsAdmin query unsuccessful");
    }

});

app.get('/api/getProjectsByUser/userID/:userID', function (req, res) {
    var userID = req.params.userID;
    if (isNaN(userID) || (userID < 0)) {
        res.send('Invalid userID provided');
    } else {
        DB.connect();
        var results = DB.getProjectsByUser(userID, function (err, data) {
            if (err) {
                console.log("ERROR", err);
                throw err;
            } else {
                res.writeHead(200, { "Content-type": "application/json" });
                res.end(JSON.stringify(data));
            }
        });
        DB.end();
    }
});

app.get('/api/getOneProject/id/:id', function (req, res) {
    var projectID = req.params.id;
    if (projectID != null && !isNaN(projectID)) {
        DB.connect();
        var results = DB.getOneProject(projectID, function (err, data) {
            if (err) {
                console.log("ERROR: ", err);
                throw err;
            } else if (data) {
                res.writeHead(200, { "Content-type": "application/json" });
                res.end(JSON.stringify(data));
            }
        })
    } else {
        res.status(400).end('Invalid project id provided');
    }
});

app.get('/api/approveProject/:prjID', function (req, res) {
    var projectID = req.params.prjID;
    if (isNaN(projectID) || (projectID < 0)) {
        res.send('Invalid projectID provided');
    } else {
        DB.connect();
        var results = DB.approveProject(projectID, function (err, data) {
            if (err) {
                res.status(400).send('invalid');
            } else {
                res.status(200).send('changed');
            }
        });
        DB.end();
    }
});

app.get('/api/takedownProject/:prjID', function (req, res) {
    var projectID = req.params.prjID;
    if (isNaN(projectID) || (projectID < 0)) {
        res.send('Invalid projectID provided');
    } else {
        DB.connect();
        var results = DB.takedownProject(projectID, function (err, data) {
            if (err) {
                res.status(400).send('invalid');
            } else {
                res.status(200).send('changed');
            }
        });
        DB.end();
    }
});

app.get('/api/setAdmin/:userID', function (req, res) {
    var userID = req.params.userID;
    if (isNaN(userID) || (userID < 0)) {
        res.send('Invalid userID provided');
    } else {
        DB.connect();
        var results = DB.setAdmin(userID, function (err, data) {
            if (err) {
                res.status(400).send('invalid');
            } else {
                res.status(200).send('changed');
            }
        });
        DB.end();
    }
});

app.get('/api/unsetAdmin/:userID', function (req, res) {
    var userID = req.params.userID;
    if (isNaN(userID) || (userID < 0)) {
        res.send('Invalid userID provided');
    } else {
        DB.connect();
        var results = DB.unsetAdmin(userID, function (err, data) {
            if (err) {
                res.status(400).send('invalid');
            } else {
                res.status(200).send('changed');
            }
        });
        DB.end();
    }
});

app.get('/api/deleteUser/:userID', function (req, res) {
    var userID = req.params.userID;
    if (isNaN(userID) || (userID < 0)) {
        res.send('Invalid userID provided');
    } else {
        DB.connect();
        var results = DB.deleteUser(userID, function (err, data) {
            if (err) {
                res.status(400).send('invalid');
            } else {
                res.status(200).send('changed');
            }
        });
        DB.end();
    }
});

app.get('/api/serverInfo', function (req, res) {
    let reply;
    const { exec } = require('child_process');

    // Way to get ip address of a request
    //console.log("remote address: " + req.connection.remoteAddress);

    exec("du -sh project", (err, stdout, stderr) => {
        if (err) {
            res.status(400).send('N/A');
            console.log("output err: " + stderr);
            reply = stderr;
        } else {
            reply = stdout;

            exec("git status | head -1", (err2, stdout2, stderr2) => {
                if (err2) {
                    res.status(400).send('N/A');
                    console.log("output err: " + stderr);
                } else {
                    reply += stdout2;
                    exec("echo $DBname", (err3, stdout3, stderr3) => {
                        if (err3) {
                            res.status(400).send('N/A');
                            console.log("output err: " + stderr);
                        } else {
                            reply += stdout3;
                            res.status(200).send(reply);
                        }
                    });
                }
            });
        }
    });
});

app.get('/term/:cmd', (req, res) => {
    var cmd = req.params.cmd;
    console.log("Command received: [" + cmd + "]");
    String.prototype.replaceAll = function (search, replacement) {
        var target = this;
        return target.replace(new RegExp(search, 'g'), replacement);
    };

    // SAFE Commands that are allowed to be run on Admin page
    /*
    let safeCommands = ["git", "npm", "cat", "less", "ls", "ps", "echo", "w", "ipconfig", "traceroute", "ping"];
    let command = cmd.split(" ")[0];

    if (safeCommands.indexOf(command) == -1) {
        res.send("Command is not in the list of allowed ones<br/>");
        return;
    }
    */
    // Running a command as a child process
    if (cmd != "") {
        const { exec } = require('child_process');
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                res.send(stderr + "<br>");
            } else {
                stdout = stdout.replaceAll(" ", '&nbsp;');
                stdout = stdout.replaceAll("\n", "<br>");
                res.send(stdout);
            }
        });

    } else {
        console.log("empty string was passed");
    }
})

//GET ADMIN LOG
app.get('/api/getAdminLog', (req, res) => {
    const { exec } = require('child_process');
    exec("./logger read", (err, stdout, stderr) => {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(stdout.split("\n"));
    });
});

// --------------- HELPERS ----------------------- //
function ensureLogin(req, res, next) {
    if (!req.session.authenticate) {
        res.redirect("/login");
    } else {
        next();
    }
};

//logout route - 
app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/');
})

// CATCH-ALL
app.use(function (req, res) {
    res.status(404);
    // res.status(200).render('main', {
    //     authenticate: req.session.authenticate,
    //     userID: req.session.userID,
    //     userType: req.session.userType
    // });
});



// GOING LIVE - LISTEN (set up for local testing as well)
let IP = process.env.IP;
let HTTP_PORT = process.env.HTTP_PORT;
let HTTPS_PORT = process.env.HTTPS_PORT;

console.log("Hostname is: " + process.env.HOSTNAME);
console.log("Listening on " + IP + ":" + HTTP_PORT);

let sslOptions = {
    key: fs.readFileSync('./SSL/studentworks.key'),
    cert: fs.readFileSync('./SSL/studentworks.crt')
}
// Secure server
https.createServer(sslOptions, app).listen(HTTPS_PORT, IP, () => {
    console.log("Listening on " + IP + ":" + HTTPS_PORT);
});

// HTTP Redirect
var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" +IP + req.url });
    res.end();
}).listen(HTTP_PORT, IP);


