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
let codetypearr = [];
app.get('/codes', (req, res) => {
    let url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
    // db.all("SELECT * FROM Codes")
    if(req.originalUrl.includes("?code=")) {
        //If want a specific code, something along these lines
        //This gets everything after ?code=
        var url_flags = req.originalUrl.split('=')[1];
        var list_of_codes = [];

        //If there are multiple codes, get all the codes
        if(url_flags.includes(",")) {
            list_of_codes = url_flags.split(",");
            console.log(list_of_codes);
        } else {
            list_of_codes = url_flags;
        }
        var query = "SELECT * FROM Codes WHERE code = ?";

        var i = 1;
        for(i; i < list_of_codes.length; i++) {
            query = query + "OR code = ?";
        }

        db.all(query, list_of_codes, (err, rows) => {
            if(err) {
                res.status(404).type("txt");
                res.write("Error executing SQL query");
                res.end();
            }
            else {
                console.log("Successfully read query");
                
                for(var i in rows){
                    var item = rows[i];
                    codetypearr.push(item);
                }
                res.status(200).type('json');
                res.status(200).type('json').send(codetypearr);
            }
        });
    } else {
        db.all("SELECT * FROM Codes", req.params, (err, rows) => {
            if(err) {
                res.status(404).type("txt");
                res.write("Error executing SQL query");
                res.end();
            }
            else {
                console.log("Successfully read query");
                
                for(var i in rows){
                    var item = rows[i];
                    codetypearr.push(item);
                }
                res.status(200).type('json');
                res.status(200).type('json').send(codetypearr);
            }
        });
    }
});

// REST API: GET /neighborhoods
// Respond with list of neighborhood ids and their corresponding neighborhood name
var neighborhoodobj = [];
app.get('/neighborhoods', (req, res) => {
    let url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
    // db.all("SELECT * from Neighborhoods")
    db.all("SELECT * FROM Neighborhoods ORDER BY neighborhood_name ASC", req.params, (err, rows) => {
        if(err) {
            res.status(404).type("txt");
            res.write("Error executing SQL query");
            res.end();
        }
        else {
            console.log("Successfully read query");
            var addedNums = [] 
            for(var i in rows){
                var item = rows[i];
                var splitNeighborhood = String(item.neighborhood_name).split(" - ").pop();
                var check = addedNums.includes(item.neighborhood_number);

                if(check == false){
                    var insert = {
                        "id" : item.neighborhood_number,
                        "name" : splitNeighborhood
                    }
                    neighborhoodobj.push(insert);
                }
                addedNums.push(item.neighborhood_number);
                
            }
            
            res.status(200).type('json');
            res.status(200).type('json').send(neighborhoodobj);
        }
    });
});

// REST API: GET/incidents
// Respond with list of crime incidents
var incidents_json = [];
app.get('/incidents', (req, res) => {
    let url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
    db.all("SELECT * FROM Incidents", req.params, (err, rows) => {
        if(err) {
            res.status(404).type("Error");
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
            incidents_json = rows;
            // split on T, will have to loop through the json
            var i = 0;
            for(i; i < incidents_json.length; i++) {
                if(String(incidents_json[i]["time"]).includes("T")){
                    //split on T
                    time_temp = String(incidents_json[i]["time"].split("T"));
                    incidents_json[i]["time"] = time_temp[1];
                }
            }

            res.status(200).type('json');
            res.status(200).type('json').send(incidents_json);
        }
    });
    
});

// REST API: PUT /new-incident
// Respond with 'success' or 'error'
app.put('/new-incident', (req, res) => {
    let url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
    let case_number_add = req.params.case_number;
    db.all("SELECT case_number FROM Incidents WHERE case_number = ?", [case_number_add], (err, rows) => {
        if(err) {
            res.status(404).type("Error");
            res.write("Error executing SQL query");
            res.end();
        } else {
            if(rows.length == 0) {
                //This case number is not in the database
                var case_number_add = req.params.case_number;
                var date_add = req.params.date;
                var time_add = req.params.time;
                var code_add = req.params.code;
                var incident_add = req.params.incident;
                var police_grid_add = req.params.police_grid;
                var neighborhood_num = req.params.neighborhood_number;
                var block_add = req.params.block;
                
                db.collection.insert(
                    {
                        "case_number": case_number_add,
                        "date": date_add,
                        "time": time_add,
                        "code": code_add,
                        "incident": incident_add,
                        "police_grid": police_grid_add,
                        "neighborhood_number": neighborhood_num,
                        "block": block_add
                    });
                    res.write("Successfully added!");
                    res.end();
            } else {
                res.write("Case number already exists");
                res.end();
            }
    
            res.status(200).type('json');
            res.status(200).type('json').send(case_add);
        }
    });
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
