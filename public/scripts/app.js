
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

let neighborhood_corners =
[
    {
        northEast: [44.963051477060176, -93.00432023434075],
        southWest: [44.89074131936859, -93.05689358311416]
    }, // Conway / Battlecreek / Highwood
    {
        northEast: [44.99199669949226, -93.0050502494359],
        southWest: [44.96303599843238, -93.04595305852973]
    }, // Greater East Side
    {
        northEast: [44.94758833373148, -93.04946201922425],
        southWest: [44.91949112043027, -93.12862859386367]
    }, // West Side
    {
        northEast: [44.97502524669413, -93.03629458095209],
        southWest: [44.942636933617976, -93.09137142305904]
    }, // Dayton's Bluff
    {
        northEast: [44.9920075027649, -93.04487789034481],
        southWest: [44.95574154716504, -93.09139843304911]
    }, // Payne / Phalen
    {
        northEast: [44.991858489918506, -93.08868206981091],
        southWest: [44.96305276688401, -93.12628722942853]
    }, // North End
    {
        northEast: [44.96746110429428, -93.09085886089726],
        southWest: [44.95488459389262, -93.14660818572733]
    }, // Thomas / Dale (Frogtown)
    {
        northEast: [44.9557742427239, -93.10566061047254],
        southWest: [44.941320733198545, -93.14661459368291]
    }, // Summit / University
    {
        northEast: [44.94656202969599, -93.08986498644425],
        southWest: [44.90389521144594, -93.15565804565087]
    }, // West Seventh
    {
        northEast: [44.991967046558564, -93.1261001783012],
        southWest: [44.965789553373995, -93.17210629231126]
    }, // Como
    {
        northEast: [44.97235945683258, -93.14658756101126],
        southWest: [44.9556411646288, -93.18736333038666]
    }, // Hamline / Midway
    {
        northEast: [44.988077357724514, -93.1670377771624],
        southWest: [44.95437119617621, -93.20777481826674]
    }, // St. Anthony
    {
        northEast: [44.959960803815875, -93.14660818572733],
        southWest: [44.941396531811804, -93.20777042679448]
    }, // Union Park
    {
        northEast: [44.94149547557926, -93.14392221267398],
        southWest: [44.92692332165782, -93.20079053834702]
    }, // Macalester-Groveland
    {
        northEast: [44.92703665813345, -93.13859200715778],
        southWest: [44.88743039225853, -93.20155587834456]
    }, // Highland
    {
        northEast: [44.94144201275586, -93.11229492879083],
        southWest: [44.92865832257884, -93.15293699653286] 
    }, // Summit Hill
    {
        northEast: [44.95786335307879, -93.07928496583061],
        southWest: [44.94130490014756, -93.11795853286192]
    } // Capitol River
]
var codes_dict = [
    { id: 1, name: "Murder", code: [110, 120] },
    { id: 2, name: "Rape", code: [210, 220] },
    { id: 3, name: "Robery", code: [300, 311, 312, 313, 314, 321, 322, 323, 324, 331, 333, 334, 341, 342, 343, 351, 352, 353, 354, 361, 363, 371, 372, 373, 374] },
    { id: 4, name: "Aggravated Assault", code: [400, 410, 411, 412, 420, 421, 422, 430, 431, 432, 440, 441, 442, 450, 451, 452, 453] },
    { id: 5, name: "Burglary", code: [5653, 500, 510, 513, 515, 516, 520, 521, 523, 525, 526, 530, 531, 533, 535, 536, 540, 541, 543, 545, 546, 550, 551, 553, 555, 556, 560, 561, 565, 566] },
    { id: 6, name: "Theft", code: [600, 603, 611, 612, 613, 614, 621, 622, 623, 630, 631, 632, 633, 640, 641, 642, 643, 651, 652, 653, 661, 662, 663, 671, 672, 673, 681, 682, 683, 691, 692, 693] },
    { id: 7, name: "Moto Vehicle Theft", code: [700, 710, 711, 712, 720, 721, 722] },
    { id: 8, name: "Assault", code: [810, 861, 862, 863]},
    { id: 9, name: "Arson", code: [900, 901, 903, 905, 911, 913, 915, 921, 923, 931, 933, 941, 942, 951, 961, 971, 972, 981, 982] },
    { id: 10, name: "Graffiti", code: [1400, 1401, 1410, 1415, 1416, 1420, 1425, 1426, 1430, 1435, 1436] },
    { id: 11, name: "Weapons Discharging", code: [2619] },
    { id: 12, name: "Narcotics", code: [1800, 1810, 1811, 1812, 1813, 1814, 1815, 1820, 1822, 1823, 1824, 1825, 1830, 1835, 1840, 1841, 1842, 1843, 1844, 1845, 1850, 1855, 1860, 1865, 1870, 1880, 1885] },
    { id: 13, name: "Proative Police Visit", code: [9954]},
    { id: 14, name: "Community Engagement", code: [9959]}
];

var violent_crimes = [
    codes_dict[0],
    codes_dict[1],
    codes_dict[3],
    codes_dict[7]
];

var property_crimes = [
    codes_dict[2],
    codes_dict[4],
    codes_dict[5],
    codes_dict[6],
    codes_dict[8],
    codes_dict[9],

];

var other_incidents = [
    codes_dict[10],
    codes_dict[11],
    codes_dict[12],
    codes_dict[13],
];

var table;
var checkedCodes = [];
var checkedNeighborhoods = [];
var start_date = '';
var end_date = '';
var limit_filter = '';
var start_time;
var end_time;
var access_data_complete;

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
            },
            table: {
                currentPage: 1,
                elementsPerPage: 50,
                ascending: false,
                sortColumn: '',
                rows: []
            },
            filterUI: {
                checkedCodes: [],
                checkedNeighborhoods: [],
                start_date: '',
                end_date: '',
                limit_filter: '',
                start_time: '',
                end_time: ''
            },
        },
        methods: {
            "OnSubmit": function OnSubmit() {
                var url = 'http://localhost:8000/incidents?'
                var flag = false;

                if(this.filterUI.checkedCodes.length != 0) {
                    flag = true;
                    
                    var codes_list_to_add = []
                    for(var i = 0; i < this.filterUI.checkedCodes.length; i++) {
                        var temp = codes_dict[this.filterUI.checkedCodes[i]-1]["code"];
                        for(var j = 0; j < temp.length; j++) {
                            codes_list_to_add.push(temp[j]);
                        }
                    }

                    url = url + 'code=' + codes_list_to_add[0];

                    for(var i = 1; i < codes_list_to_add.length; i++) {
                        url = url + "," + codes_list_to_add[i];
                    }
                }
                if(this.filterUI.checkedNeighborhoods.length != 0) {
                    if(flag) {
                        url = url + '&';
                    }
                    flag = true;
                    url = url + 'neighborhood_number=' + this.filterUI.checkedNeighborhoods[0];
                    for(var i = 1; i < this.filterUI.checkedNeighborhoods.length; i++) {
                        url = url + ',' + this.filterUI.checkedNeighborhoods[i];
                    }
                }

                if(this.filterUI.start_date.length != 0) {
                    if(flag) {
                        url = url + '&';
                    }
                    flag = true;
                    url = url + 'start_date=' + this.filterUI.start_date;
                }

                if(this.filterUI.end_date.length != 0) {
                    if(flag) {
                        url = url + '&';
                    }
                    flag = true;
                    url = url + 'end_date=' + this.filterUI.end_date;
                }

                if(this.filterUI.start_time.length != 0) {
                    if(flag) {
                        url = url + '&';
                    }
                    flag = true;
                    url = url + 'start_time=' + this.filterUI.start_time + ':00.000';
                }

                if(this.filterUI.end_time.length != 0) {
                    if(flag) {
                        url = url + '&';
                    }
                    flag = true;
                    url = url + 'end_time=' + this.filterUIend_time + ':00.000';
                }

                if(this.filterUI.limit_filter.length != 0) {
                    if(flag) {
                        url = url + '&';
                    }
                    url = url + 'limit=' + this.filterUI.limit_filter;
                }

                retrieveData(url);
                crimeMarkers(this.table.rows);
            },
            
            "sortTable": function sortTable(col) {
                if (this.table.sortColumn === col) {
                    this.table.ascending = !this.table.ascending;
                } else {
                    this.table.ascending = true;
                    this.table.sortColumn = col;
                }
                
                var ascending = this.table.ascending;
            
                this.table.rows.sort(function(a, b) {
                    if (a[col] > b[col]) {
                        return ascending ? 1 : -1
                    } else if (a[col] < b[col]) {
                        return ascending ? -1 : 1
                    }
                        return 0;
                })
            },
            "num_pages": function num_pages() {
                return Math.ceil(this.table.rows.length / this.table.elementsPerPage);
            },
            "get_rows": function get_rows() {
                var start = (this.table.currentPage-1) * this.table.elementsPerPage;
                var end = start + this.table.elementsPerPage;
                return this.table.rows.slice(start, end);
            },
            "change_page": function change_page(page) {
                this.table.currentPage = page;
            }
        },
        computed: {
            "columns": function columns() {
                if (this.table.rows.length == 0) {
                    return [];
                }
                return Object.keys(this.table.rows[0])
            }
        }
    });

    // WHEN UPDATING TABLE, JUST CHANGE APP.TABLE.ROWS
    // create map
    map = L.map('leafletmap').setView([app.map.center.lat, app.map.center.lng], app.map.zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        minZoom: 11,
        maxZoom: 18
    }).addTo(map);

    // set max bounds
    map.setMaxBounds([[44.883658, -93.217977], [45.008206, -92.993787]]);

    // SET CURRENT BOUNDS FOR INCIDENT SEARCH WITHIN MAP AREA
    let currentBounds = ([[44.883658, -93.217977], [45.008206, -92.993787]]);
    let currentWidth = map.getBounds().getEast() - map.getBounds().getWest();
    let currentHeight = map.getBounds().getNorth() - map.getBounds().getSouth();

    // Change corner coords on drag
    map.on('dragend', function onDragEnd(){
        currentWidth = map.getBounds().getEast() - map.getBounds().getWest();
        currentHeight = map.getBounds().getNorth() - map.getBounds().getSouth();

        currentBounds = (
            [
                [map.getBounds().getNorth(), map.getBounds().getWest()], 
                [map.getBounds().getSouth(), map.getBounds().getEast()]
            ]
        );
        
        mapChangeTable(currentBounds);

        console.log(
            'center: ' + map.getCenter() +'\n'+
            'currentWidth: ' + currentWidth +'\n'+
            'currentHeight: ' + currentHeight +'\n'+
            'currentBounds: ' + currentBounds + '\n'
        );

        
        
    });

    // Change corner coords on zoom
    map.on('zoomend', function onZoomChange(){
        currentWidth = map.getBounds().getEast() - map.getBounds().getWest();
        currentHeight = map.getBounds().getNorth() - map.getBounds().getSouth();

        currentBounds = (
            [
                [map.getBounds().getNorth(), map.getBounds().getWest()], 
                [map.getBounds().getSouth(), map.getBounds().getEast()]
            ]
        );
        
        mapChangeTable(currentBounds);

        console.log(
            'center: ' + map.getCenter() +'\n'+
            'currentWidth: ' + currentWidth +'\n'+
            'currentHeight: ' + currentHeight +'\n'+
            'currentBounds: ' + currentBounds + '\n'
        );
    });

    // District bounds
    let district_boundary = new L.geoJson();
    district_boundary.addTo(map);
    console.log(district_boundary);
    getJSON('data/StPaulDistrictCouncil.geojson').then((result) => {
        // St. Paul GeoJSON
        $(result.features).each(function(key, value) {
            district_boundary.addData(value);
        });
    }).catch((error) => {
        console.log('Error:', error);
    });
    console.log(district_boundary);
    // Location lookup button
    var lookup_button = document.getElementById("lookup");
    var UI_button = document.getElementById("submit");
    lookup_button.addEventListener("click", geoLocate, false);
    UI_button.addEventListener("click", filterUI, false)

}

function geoLocate(event) {
    // Perform geolocation using the Nominatim API
    //  - get plain text location value from text input 'location'
    //  - build URL for using with API
    let addr = document.getElementById('addr');
    let url = 'https://nominatim.openstreetmap.org/search?q=' + addr.value +
              '&format=json&limit=25&accept-language=en';
    
    // in case of search button click, find first result in st paul and add marker to map
    if (event.type === "click") {   
        var req1_data;
        var req1 = getJSON(url);
        console.log(req1);
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
            var breakTag = 0;
            var newBounds;
            for (var i = 0; i<data.length; i++){
                var currentItem = data[i].display_name;
                if (currentItem.search("Saint Paul") !== -1 && currentItem.search("Minnesota") !== -1 && breakTag !== 1) {
                    // NEW MARKER AND OPTIONS HERE
                    var newMarker;
                    var markerOptions = { 
                        title: data[i].display_name
                    }
                    breakTag = 1;
                    newBounds = data[i].boundingbox;
                    new_li = document.createElement("li");
                    console.log("data[i] ", data[i]);
                    new_li.textContent = data[i].display_name + " (" + data[i].lat + ", " + data[i].lon + ")";
                    newMarker = L.marker([data[i].lat, data[i].lon], markerOptions).addTo(map);
                    result.appendChild(new_li);            
                    map.zoomIn(10);
                    map.flyTo(newMarker.getLatLng());
                    map.removeLayer(newMarker);
                    console.log(map.get);
                    console.log(newBounds);
                }    
            }
            // console.log(result.)
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


function retrieveData(url) {
    // Get Incidents
    var url1 = url;
    var url2 = 'http://localhost:8000/codes';
    var url3 = 'http://localhost:8000/neighborhoods';
    if(url1.includes("neighborhood_number=")) {
        neighborhood_codes = url1.split("neighborhood_number=")[1];
        //String should look like this: 1,2,3
        //Or like this: 1,2,3&start_date
        if(neighborhood_codes.includes("&")) {
            neighrborhood_codes = neighborhood_codes.split("&")[0];
            //String should look like this: 1,2,3
        }
        url3 = url3 + "?neighborhood_number=" + neighborhood_codes;
        
    }
    if(url1.includes("code=")) {
        code_codes = url1.split("code=")[1];
        //String should look like this: 1,2,3
        //Or like this: 1,2,3&start_date
        if(code_codes.includes("&")) {
            code_codes = code_codes.split("&")[0];
            //String should look like this: 1,2,3
        }
        url2 = url2 + "?code=" + code_codes;
        
    }

    console.log(url1);
    console.log(url2);
    console.log(url3);

    Promise.all([getJSON(url1), getJSON(url2), getJSON(url3)]).then((result) => {
        var data = result[0];
        var codes = result[1];
        var neighborhoods = result[2];
        var data_complete = data;

        // Neighborhood crime numbers
        var neighborhood_num_crimes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];


        //headers with the database's styling
        var headers = ["case_number", "date_time", "code", "incident", "police_grid", "neighborhood_number", "block"];
        //How they will show up on the web page
        var header_names = ["Case Number", "Date / Time", "Incident Type", "Incident", "Police Grid", "Neighborhood Name", "Block"];

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
                    neighborhood_num_crimes[data[i]["neighborhood_number"] - 1]++;
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
        app.table.rows = data_complete;
        // End Making the table
        access_data_complete = data_complete;



        // Markers
        for(var i = 0; i < 17; i++) {
            var name;
            for(var j = 0; j < 17; j++) {
                if(neighborhoods[j]["id"] == (i+1)) {
                    name = neighborhoods[j]["name"];
                }
            }
            // This is to initalize the marker
            neighborhood_markers[i]["marker"] = L.marker(neighborhood_markers[i]["location"]).addTo(map); 
            // Pop Up
            neighborhood_markers[i]["marker"].bindPopup("There were " + neighborhood_num_crimes[i] + " incidents committed<br>in " + name + ".");
        }
    }).catch((error) => {
        console.log('Error:', error);
    });
}

function crimeMarkers(data_input) {
    var url;
    var temp_block;
    var output = [];
    var crime_markers = [];
    var temp_block_string;
    for(var i = 0; i < data_input.length; i++) {
        //Convert block into coordinates
        if(data_input[i]["Block"] != NaN) {
            /*if(data_input[i]["Block"].includes('X')) {
                var first_char = data_input[i]["Block"].split(' ')[0][0];
                if((first_char == 'X') || (parseInt(first_char))) {
                    var length = data_input[i]["Block"].split(' ').length;
                    temp_block = data_input[i]["Block"].split(' ')[0].replaceAll("X", "0");
                    temp_block = temp_block + data_input[i]["Block"].split(' ').slice(1, length);
                }
            } else {
                temp_block = data_input[i]["Block"];
            }*/
            temp_block = data_input[i]["Block"].replaceAll("X", "0");
            temp_block_string = "On " + data_input[i]["Date / Time"].split("T")[0] + " at " + data_input[i]["Date / Time"].split("T")[1] + " a " + data_input[i]["Incident"] + " occured.  ";

            url = 'https://nominatim.openstreetmap.org/search?q=' + temp_block +
                '&format=json&limit=25&accept-language=en';
            var req1_data;
            var req1 = getJSON(url);
            var req2 = req1.then((data) => {
                req1_data = data;
                var breakTag = 0;
                var good_data;
                for (var j = 0; j<data.length; j++){
                    var currentItem = data[j].display_name;
                    if (currentItem.search("Saint Paul") !== -1 && currentItem.search("Minnesota") !== -1 && breakTag !== 1) {
                        breakTag = 1;
                        good_data = data[j];
                    }
                }

                if(good_data) {
                    var redIcon = new L.Icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                        shadowURL: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    })
                    var mp = L.marker([good_data["lat"], good_data["lon"]], {icon: redIcon});
                    let text_marker = document.createElement("div");
                    text_marker.textContent = temp_block_string;
                    
                    let delete_marker = document.createElement("button");
                    delete_marker.type = "button";

				    delete_marker.textContent = "Delete";
				    
				    text_marker.appendChild(delete_marker);
				
				    mp.bindPopup(text_marker);
				    map.addLayer(mp);
				
				    delete_marker.onclick = function(){
					    map.removeLayer(mp);
				    }
                    //crime_markers[crime_markers.length-1].bindPopup(marker.bindPopup("Hello").openPopup());
                }
                
            }).catch((error) => {
                console.log(error);
            });

            
        }
    }

    app.table.rows = output;
}

function mapChangeTable(currentBounds) {
    var n = currentBounds[0][0]; //north
    var e = currentBounds[1][1]; //east
    var s = currentBounds[1][0]; //south
    var w = currentBounds[0][1]; //west
    var neighborhoods_in = [];
    for(var i = 0; i < neighborhood_corners.length; i++) {
        var north = neighborhood_corners[i]["northEast"][0];
        var east = neighborhood_corners[i]["northEast"][1];
        var south = neighborhood_corners[i]["southWest"][0];
        var west = neighborhood_corners[i]["southWest"][1]
        if( (north > s) && (north < n) && ( ((west < w) && (east > e)) || ((west > w) && (west < e) || ((east > w) && (east < e)) ) ) ) {
            neighborhoods_in.push(i + 1);
        } else if( (south > s) && (south < n) && ( ((west < w) && (east > e)) || ((west > w) && (west < e) || ((east > w) && (east < e)) ) ) ) {
            neighborhoods_in.push(i + 1);
        } else if ( (east < e) && (east > w) && ( ((north > n) && (south < s)) || ((north < n) && (north > s) || ((south > s) && (south < n)) ) ) ) {
            neighborhoods_in.push(i + 1);
        } else if ( (west < e) && (west > w) && ( ((north > n) && (south < s)) || ((north < n) && (north > s) || ((south > s) && (south < n)) ) ) ) {
            neighborhoods_in.push(i + 1);
        } else if ((north > n) && (south < s) && (east > e) && (west < w) ) {
            neighborhoods_in.push(i + 1);
            console.log(i+1);
        }
    }
    var url = 'http://localhost:8000/incidents?neighborhood_number=' + neighborhoods_in[0];
    for(var i = 1; i < neighborhoods_in.length; i++) {
        url = url + ',' + neighborhoods_in[i];
    }
    if(neighborhoods_in.length == 17) {
        retrieveData('http://localhost:8000/incidents');
    } else {
        retrieveData(url);
    }
}