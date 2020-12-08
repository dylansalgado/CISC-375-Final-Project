// Built-in Node.js modules
let path = require('path');

// NPM modules
let express = require('express');
let sqlite3 = require('sqlite3');


let app = express();
let port = 8000;

let public_dir = path.join(__dirname, 'public');
let template_dir = path.join(__dirname, 'templates');
let db_filename = path.join(__dirname, 'db', 'stpaul_crime.sqlite3'); 

// open stpaul_crime.sqlite3 database
// data source: https://information.stpaul.gov/Public-Safety/Crime-Incident-Report-Dataset/gppb-g9cg
let db = new sqlite3.Database(db_filename, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.log('Error opening ' + db_filename);
    }
    else {
        console.log('Now connected to ' + db_filename);
    }
});

app.use(express.static(public_dir));


// REST API: GET /codes
// Respond with list of codes and their corresponding incident type
app.get('/codes', (req, res) => {
    let url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
    // db.all("SELECT * FROM Codes")
    db.all("SELECT * FROM Codes", req, (err, rows) => {
        if(err) {
            res.status(404).type("txt");
            res.write("Error executing SQL query");
            res.end();
        }
        else {
            console.log("Successfully read query");
            res.status(200).type('json');
            code = 0;
            type = "";
        }
    });
    res.status(200).type('json').send({});
});

// REST API: GET /neighborhoods
// Respond with list of neighborhood ids and their corresponding neighborhood name
app.get('/neighborhoods', (req, res) => {
    let url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
    // db.all("SELECT * from Neighborhoods")
    res.status(200).type('json').send({});
});

// REST API: GET/incidents
// Respond with list of crime incidents
app.get('/incidents', (req, res) => {
    let url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
    db.all("SELECT * from Incidents", req, (err, rows) => {
        if(err) {
            res.status(404).type("txt");
            res.write("Error executing SQL query");
            res.end();
        }
        else {
            console.log("Successfully read query");
            // Make JSON object
            /* EXAMPLE
              {
                "case_number": "19245020",
                "date": "2019-10-30",
                "time": "23:57:08", (if time includes date: 2019-05-009T05:00)
                "code": 9954,
                "incident": "Proactive Police Visit",
                "police_grid": 87,
                "neighborhood_number": 7,
                "block": "THOMAS AV  & VICTORIA"
              }
            */

            // split on T, will have to loop through the json
            if(incidents_json["time"].includes("T")) {
                //split on T
                time_temp = incidents_json["time"].split("T");
                incidents_json["time"] = time_temp[1];
            }
            res.status(200).type();
            let 
        }
    }
    );
    res.status(200).type('json').send({});
});

// REST API: PUT /new-incident
// Respond with 'success' or 'error'
app.put('/new-incident', (req, res) => {
    let url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
    db.all("SELECT case_number FROM Incidents WHERE case_number = ?", req, (err, rows) => {
        if(rows.length == 0) {
            //This case number is not in the database

        }
    
        res.status(200).type('txt').send('success');
    }
});


// Create Promise for SQLite3 database SELECT query 
function databaseSelect(query, params) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(rows);
            }
        })
    })
}

// Create Promise for SQLite3 database INSERT query
function databaseInsert(query, params) {
    return new Promise((resolve, reject) => {
        db.run(query, params, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    })
}


// Start server
app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
