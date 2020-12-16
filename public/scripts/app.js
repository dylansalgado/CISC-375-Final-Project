
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
    getJSON('data/StPaulDistrictCouncil.geojson').then((result) => {
        // St. Paul GeoJSON
        $(result.features).each(function(key, value) {
            district_boundary.addData(value);
        });
    }).catch((error) => {
        console.log('Error:', error);
    });

    // Location lookup button
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
    
    // in case of search button click, find first result in st paul and add marker to map
    if (event.type === "click") {   
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

    Promise.all([getJSON(url1), getJSON(url2), getJSON(url3)]).then((result) => {
        var data = result[0];
        var codes = result[1];
        var neighborhoods = result[2];
        var data_complete = data;

        // Neighborhood crime numbers
        var neighborhood_num_crimes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

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
                elementsPerPage: 50,
                ascending: false,
                sortColumn: '',
                rows: data_complete,
            },
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
                },
                "num_pages": function num_pages() {
                    return Math.ceil(this.rows.length / this.elementsPerPage);
                },
                "get_rows": function get_rows() {
                    var start = (this.currentPage-1) * this.elementsPerPage;
                    var end = start + this.elementsPerPage;
                    return this.rows.slice(start, end);
                },
                "change_page": function change_page(page) {
                    this.currentPage = page;
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

function filterUI(neighborhood_list) {
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
        { id: 11, name: "Weapons Discharging", code: [1800, 2619] },
        { id: 12, name: "Narcotics", code: [1810, 1811, 1812, 1813, 1814, 1815, 1820, 1822, 1823, 1824, 1825, 1830, 1835, 1840, 1841, 1842, 1843, 1844, 1845, 1850, 1855, 1860, 1865, 1870, 1880, 1885] },
        { id: 13, name: "Proative Police Visit", code: [9954]},
        { id: 14, name: "Community Engagement", code: [9959]}
    ];

    var filterUI = new Vue({
        el: '#filterUI',
        data: {
            code: {
                entries: codes_dict,
                checkedCodes: []
            },
            neighborhood: {
                checkedNeighborhoods: [],
                neighborhoods: neighborhood_list
            },
            date: {
                start_date: '',
                end_date: ''
            },
            limit: {
                limit_filter: ''
            }
        },
        methods: {
            "OnSubmit": function OnSubmit() {
                var url = 'http://localhost:8000/incidents?'
                var flag = false;

                if(checkedCodes.length != 0) {
                    flag = true;
                    url = url + 'code=' + checkedCodes[0];
                    for(var i = 1; i < checkedCodes.length; i++) {
                        url = url + ',' + checkedCodes[i];
                    }
                }
                if(checkedNeighborhoods.length != 0) {
                    if(flag) {
                        url = url + '&';
                    }
                    flag = true;
                    url = url + 'neighborhood_number=' + checkedNeighborhoods;
                    for(var i = 1; i < checkedNeighborhoods.length; i++) {
                        url = url + ',' + checkedNeighborhoods[i];
                    }
                }
                if(start_date.length != 0) {
                    if(flag) {
                        url = url + '&';
                    }
                    flag = true;
                    url = url + 'start_date=' + start_date;
                }
                if(end_date.length != 0) {
                    if(flag) {
                        url = url + '&';
                    }
                    flag = true;
                    url = url + 'end_date=' + end_date;
                }
                if(limit.length != 0) {
                    if(flag) {
                        url = url + '&';
                    }
                    url = url + 'limit=' + limit_filter;
                }
                return retrieveData(url);
            }
        }
    });
    
}