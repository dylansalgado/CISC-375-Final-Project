
let app;
let map;
let neighborhood_markers = 
[
    {location: [44.942068, -93.020521], marker: null},
    {location: [44.977413, -93.025156], marker: null},
    {location: [44.931244, -93.079578], marker: null},
    {location: [44.956192, -93.060189], marker: null},
    {location: [44.978883, -93.068163], marker: null},
    {location: [44.975766, -93.113887], marker: null},
    {location: [44.959639, -93.121271], marker: null},
    {location: [44.947700, -93.128505], marker: null},
    {location: [44.930276, -93.119911], marker: null},
    {location: [44.982752, -93.147910], marker: null},
    {location: [44.963631, -93.167548], marker: null},
    {location: [44.973971, -93.197965], marker: null},
    {location: [44.949043, -93.178261], marker: null},
    {location: [44.934848, -93.176736], marker: null},
    {location: [44.913106, -93.170779], marker: null},
    {location: [44.937705, -93.136997], marker: null},
    {location: [44.949203, -93.093739], marker: null}
];

function init() {
    let crime_url = 'http://localhost:8000';

    app = new Vue({
        el: '#app',
        data: {
            map: {
                center: {
                    lat: 44.955139,
                    lng: -93.102222,
                    address: ""
                },
                zoom: 12,
                bounds: {
                    nw: {lat: 45.008206, lng: -93.217977},
                    se: {lat: 44.883658, lng: -92.993787}
                }
            }
        }
    });


    map = L.map('leafletmap').setView([app.map.center.lat, app.map.center.lng], app.map.zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        minZoom: 11,
        maxZoom: 18
    }).addTo(map);
    map.setMaxBounds([[44.883658, -93.217977], [45.008206, -92.993787]]);
    
    let district_boundary = new L.geoJson();
    district_boundary.addTo(map);

    getJSON('data/StPaulDistrictCouncil.geojson').then((result) => {
        // St. Paul GeoJSON
        $(result.features).each(function(key, value) {
            district_boundary.addData(value);
        });
    }).catch((error) => {
        console.log('Error:', error);
    });

    var lookup_button = document.getElementById("lookup");
    lookup_button.addEventListener("click", geoLocate, false);

}

function geoLocate(event) {
    // Perform geolocation using the Nominatim API
    //  - get plain text location value from text input 'location'
    //  - build URL for using with API
    let addr = document.getElementById('addr');
    let url = 'https://nominatim.openstreetmap.org/search?q=' + addr.value +
              '&format=json&limit=25&accept-language=en';
    console.log(url);
    
    // TODO: download geolocation data using the API url
    //       should call the `getJSON()` function
    if (event.type === "click") {   
        console.log("CLICK");
        var req1_data;
        var req1 = getJSON(url);
        var req2 = req1.then((data) => {
            req1_data = data;
            return req1_data;
        });
        console.log(req2);
        req2.then((data) => {
            var result = document.getElementById('result');
            result.innerHTML = "";
            console.log(result);
            console.log(data);
            console.log(data.length);
            for (var i = 0; i<data.length; i++){
                var currentItem = data[i].display_name
                if (currentItem.search("Saint Paul") !== -1 && currentItem.search("Minnesota") !== -1 ) {
                    new_li = document.createElement("li");
                    console.log("data[i] ", data[i]);
                    new_li.textContent = data[i].display_name + " (" + data[i].lat + ", " + data[i].lon + ")";
                    console.log(new_li);
                    result.appendChild(new_li);
                }

            }
            console.log(result)
        });
    }

    // TODO: once data is downloaded and available, you should dynamically
    //       build items in the unordered list `result`. Each item should
    //       have the full name of the location (display_name), followed
    //       by the latitude and longitude
    //       Example: location = St. Paul
    //        - Saint Paul, Ramsey County, Minnesota, United States of
    //          America (44.9504037, -93.1015026)
    //        - Saint-Paul, Neufchâteau, Vosges, Grand Est, Metropolitan
    //          France, 88170, France (48.3285226, 5.888596)
    //        - ...
    if (event.type !== "click"){
        console.log("event found ", event);
        var container = document.getElementById("result");
        var new_li;
        for (var i = 0; i<event.length; i++){
            new_li = document.createElement("li");
            console.log("event[i] ", event[i]);
            new_li.textContent = event[i].display_name + " (" + event[i].lat + ", " + event[i].lon + ")";
            container.appendChild(new_li);
        }
    }
    
}


function getJSON(url) {
    return new Promise((resolve, reject) => {
        $.ajax({
            dataType: "json",
            url: url,
            success: function(data) {
                console.log("SUCCESSFUL DATA INCOMING");
                console.log(data);
                resolve(data);
            },
            error: function(status, message) {
                console.log("REJECTED DATA INCOMING");
                console.log(status);
                reject({status: status.status, message: status.statusText});
            }
        });
    });
}

function retrieveData() {
    // Get Incidents

    Promise.all([getJSON('http://localhost:8000/incidents'), getJSON('http://localhost:8000/codes'), getJSON('http://localhost:8000/neighborhoods')]).then((result) => {
        var data = result[0];
        var codes = result[1];
        var neighborhoods = result[2];
        var data_complete = data;

        // Neighborhood crime numbers
        var neighborhood_num_crimes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

        //headers with the database's styling
        var headers = ["case_number", "date", "time", "code", "incident", "police_grid", "neighborhood_number", "block"];
        //How they will show up on the web page
        var header_names = ["Case Number", "Date", "Time", "Incident Type", "Incident", "Police Grid", "Neighborhood Name", "Block"];

        //data
        for(var i = 0; i < data.length; i++){
            var temp_dict = {};
            for(var j = 0; j < headers.length; j++){
                if(headers[j] == "code") {
                    var iterator = 0;
                    for(iterator; iterator < codes.length; iterator++) {
                        if(codes[iterator]["code"] == data[i]["code"]) {
                            //The code is found
                            temp_dict[header_names[j]] = codes[iterator]["incident_type"];
                        }
                    }
                } else if(headers[j] == "neighborhood_number") {
                    neighborhood_num_crimes[data[i]["neighborhood_number"]]++;
                    var iterator = 0;
                    for(iterator; iterator < neighborhoods.length; iterator++) {
                        if(neighborhoods[iterator]["id"] == data[i]["neighborhood_number"]) {
                            //The neighborhood is found
                            temp_dict[header_names[j]] = neighborhoods[iterator]["name"];
                        }
                    }
                } else {
                    temp_dict[header_names[j]] = data[i][headers[j]];
                }

            }
            data_complete[i] = temp_dict;
        }

        // Table
        var table = new Vue({
            el: '#table',
            data: {
                currentPage: 1,
                elementsPerPage: 25,
                ascending: false,
                sortColumn: '',
                rows: [data_complete],
                methods: {
                    "sortTable": function sortTable(col) {
                        if (this.sortColumn === col) {
                            this.ascending = !this.ascending;
                        } else {
                            this.ascending = true;
                            this.sortColumn = col;
                        }
                    
                        var ascending = this.ascending;
                
                        this.rows.sort(function(a, b) {
                            if (a[col] > b[col]) {
                            return ascending ? 1 : -1
                            } else if (a[col] < b[col]) {
                            return ascending ? -1 : 1
                            }
                            return 0;
                        })
                    }
                },
                computed: {
                    "columns": function columns() {
                        if (this.rows.length == 0) {
                            return [];
                        }
                        return Object.keys(this.rows[0])
                    }
                }
            }
        });
        

        // End Making the table


        console.log(data_complete);
        // Markers
        for(var i = 0; i < 17; i++) {
            // This is to initalize the marker
            neighborhood_markers[i]["marker"] = L.marker(neighborhood_markers[i]["location"]).addTo(map); 
            // Pop Up
            neighborhood_markers[i]["marker"].bindPopup("There were " + neighborhood_num_crimes[i] + " incidents committed<br>in this neighborhood.").openPopup();
        }
    }).catch((error) => {
        console.log('Error:', error);
    });
}
