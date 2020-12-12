// Built-in Node.js modules
let path = require('path');

// NPM modules
let express = require('express');
let sqlite3 = require('sqlite3');
const { start } = require('repl');


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

        let i = 1;
        for(i; i < list_of_codes.length; i++) {
            query = query + "OR code = ?";
        }

        //clear the json out
        codetypearr = [];
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
        //clear the json out
        codetypearr = [];
        //Default query
        db.all("SELECT * FROM Codes ORDER BY code ASC", req.params, (err, rows) => {
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
    if(req.originalUrl.includes("?id=")) {
        //If want a specific code, something along these lines
        //This gets everything after ?code=
        var url_flags = req.originalUrl.split('=')[1];
        var list_of_ids = [];

        //If there are multiple codes, get all the codes
        if(url_flags.includes(",")) {
            list_of_ids = url_flags.split(",");
            console.log(list_of_ids);
        } else {
            list_of_ids = url_flags;
        }
        var query = "SELECT * FROM Neighborhoods WHERE neighborhood_number = ?";

        var i = 1;
        for(i; i < list_of_ids.length; i++) {
            query = query + "OR neighborhood_number = ?";
        }

        query = query +  "ORDER BY neighborhood_name ASC";

        //Clear the json out
        neighborhoodobj = [];
        db.all(query, list_of_ids, (err, rows) => {
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

    } else {
        //Clear the json out
        neighborhoodobj = [];
        //Default query
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
    }
});

// REST API: GET/incidents
// Respond with list of crime incidents
var incidents_json = [];
app.get('/incidents', (req, res) => {
    let url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
    if(req.originalUrl.includes("?")) {
        //Handle the different params
        //This will have everything after the ?
        let params = req.originalUrl.split("?")[1];

        //Different param options
        let start_date;
        let end_date;
        let code; //This could be a list
        let grid; //This could be a list
        let neighborhood; //This could be a list
        let limit = 1000;
        
        //This will split the different params
        let list_of_params = [];
        if(params.includes("&")) {
            //There are multiple parameters
            list_of_params = params.split("&");
        } else {
            list_of_params = [params];
        }

        let i = 0;
        for(i; i < list_of_params.length; i++) {
            //split params into their categories
            if(list_of_params[i].split("=")[0] == "start_date") {
                start_date = list_of_params[i].split("=")[1];

            } else if(list_of_params[i].split("=")[0] == "end_date") {
                end_date = list_of_params[i].split("=")[1];

            } else if(list_of_params[i].split("=")[0] == "code") {
                code = list_of_params[i].split("=")[1];

            } else if(list_of_params[i].split("=")[0] == "police_grid") {
                grid = list_of_params[i].split("=")[1];

            } else if(list_of_params[i].split("=")[0] == "neighborhood_number") {
                neighborhood = list_of_params[i].split("=")[1];

            } else if(list_of_params[i].split("=")[0] == "limit") {
                limit = list_of_params[i].split("=")[1];
            }
        }

        //Check to see if there are multiple inputs for certain categories
        if(code) {
            if(code.includes(",")) {
                code = code.split(",");
            } else {
                //Must be an array for later
                code = [code];
            }
        }
        if(grid) {
            if(grid.includes(",")) {
                grid = grid.split(",");
            } else {
                //Must be an array for later
                grid = [grid];
            }
        }
        if(neighborhood) {
            if(neighborhood.includes(",")) {
                neighborhood = neighborhood.split(",");
            } else {
                //Must be an array for later
                neighborhood = [neighborhood];
            }
        }

        //Forming the query and params, if the thing is present, it adds to the query and parameters
        let query = "SELECT * FROM Incidents WHERE";
        let params_list = [];
        if(start_date) {
            if(end_date) {
                query = query + " (";
            }
            query = query + " date >= ?";
            params_list.push(start_date);
        }

        if(end_date) {
            if(params_list.length == 0) {
                query = query + " date <= ?";
            } else {
                query = query + " AND date <= ? )";
            }
            params_list.push(end_date);
        }

        if(code) {
            if(params_list.length == 0) {
                let i = 1;
                
                if(code.length > 1) {
                    query = query + " (code = ?";
                } else {
                    query = query + " code = ?";
                }

                for(i; i < code.length; i++) {
                    query = query + " OR code = ?)";
                }
            } else {
                let i = 1;
                if(code.length > 1) {
                    query = query + "AND (code = ?";
                } else {
                    query = query + "AND code = ?";
                }

                for(i; i < code.length; i++) {
                    query = query + " OR code = ?)";
                }
            }
            let i = 0;
            for(i; i < code.length; i++) {
                params_list.push(code[i]);
            }
        }

        if(grid) {
            if(params_list.length == 0) {
                let i = 1;
                if(grid.length > 1) {
                    query = query + " (police_grid = ?";
                } else {
                    query = query + " police_grid = ?";
                }
                for(i; i < grid.length; i++) {
                    query = query + " OR police_grid = ?)";
                }
            } else {
                let i = 1;
                if(grid.length > 1) {
                    query = query + " AND (police_grid = ?";
                } else {
                    query = query + " AND police_grid = ?";
                }
                for(i; i < grid.length; i++) {
                    query = query + " OR police_grid = ?)";
                }
            }
            let i = 0;
            for(i; i < grid.length; i++) {
                params_list.push(grid[i]);
            }
        }

        if(neighborhood) {
            if(params_list.length == 0) {
                let i = 1;
                if(neighborhood.length == 1) {
                    query = query + " neighborhood_number = ?";
                } else {
                    query = query + " (neighborhood_number = ?";
                }
                for(i; i < neighborhood.length; i++) {
                    query = query + " OR neighborhood_number = ?)";
                }
            } else {
                let i = 1;
                if(neighborhood.length > 1) {
                    query = query + " AND (neighborhood_number = ?";
                } else {
                    query = query + " AND neighborhood_number = ?";
                }

                for(i; i < neighborhood.length; i++) {
                    query = query + " OR neighborhood_number = ?)";
                }
            }
            let i = 0;
            for(i; i < neighborhood.length; i++) {
                params_list.push(neighborhood[i]);
            }
        }

        if(limit) {
            query = query + " ORDER BY date DESC LIMIT " + limit;
        }
        
        console.log(query);
        console.log(params_list);
        //Clear the json
        incidents_json = [];
        db.all(query, params_list, (err, rows) => {
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
        
    } else {
        //Clear the json
        incidents_json = [];
        //Default query
        db.all("SELECT * FROM Incidents ORDER BY date DESC LIMIT 1000", req.params, (err, rows) => {
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
    }
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
                var case_number_add;
                var date_add;
                var time_add;
                var code_add;
                var incident_add;
                var police_grid_add;
                var neighborhood_number_add;
                var block_add;

                //Split the params off
                let params;
                if(req.originalUrl.includes("?")) {
                    params = req.originalUrl.split("?")[1];
                } else {
                    res.write("Error: Must include inputs");
                    res.end();
                }
                
                if(params.includes("&")) {
                    params = params.split("&");
                } else {
                    res.write("Error: Must include all inputs");
                    res.end();
                }

                if(params.length != 8) {
                    res.write("Error: Must include all inputs");
                    res.end();
                }

                let i = 0;
                for(i; i < params.length; i++) {
                    if(params[i].split("=")[0] == "case_number") {
                        case_number_add = params[i].split("=")[1];
                    } else if(params[i].split("=")[0] == "date") {
                        date_add = params[i].split("=")[1];
                    } else if(params[i].split("=")[0] == "time") {
                        time_add = params[i].split("=")[1];
                    } else if(params[i].split("=")[0] == "code") {
                        code_add = params[i].split("=")[1];
                    } else if(params[i].split("=")[0] == "incident") {
                        incident_add = params[i].split("=")[1];
                    } else if(params[i].split("=")[0] == "police_grid") {
                        police_grid_add = params[i].split("=")[1];
                    } else if(params[i].split("=")[0] == "neighborhood_number") {
                        neighborhood_number_add = params[i].split("=")[1];
                    } else if(params[i].split("=")[0] == "block") {
                        block_add = params[i].split("=")[1];
                    } else {
                        res.write("Invalid Input");
                        res.end();
                    }
                }
                
                db.collection.insert(
                    {
                        "case_number": case_number_add,
                        "date": date_add,
                        "time": time_add,
                        "code": code_add,
                        "incident": incident_add,
                        "police_grid": police_grid_add,
                        "neighborhood_number": neighborhood_nuber_add,
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
