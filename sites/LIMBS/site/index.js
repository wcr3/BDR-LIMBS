/**
 * Retreives data from the database at the given table and calls the given function with it (as the first argument)
 * @param {string} table - The name of the table
 * @param {function} func - The function to call with the data
 * @param {...*} funcArgs - The rest of the arguments for the function
 */
function get_data(table, func, ...funcArgs) {
    console.log("Called get_data()");
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
            func(JSON.parse(xhttp.responseText), funcArgs);
        }
    };
    console.log(window.location.protocol + '//' + window.location.host + "/retrieve/" + table);
    xhttp.open("GET", window.location.protocol + '//' + window.location.host + "/retrieve/" + table);
    xhttp.send();
}

/**
 * Builds an html table given an array of objects and puts it on the page at the given <div>
 * @param {Array.<Object>} objs - The data to put on the table
 * @param {string} id - The id of the <div>
 */
function build_table(objs, id) {
    var keys = Object.keys(objs[0]);
    //console.log(objs[0].yeet);
    //document.getElementById(id).innerHTML = "<p>Ran Function build_table()</p>"
    var tbl_str = "<table style='width:100%'><tr>";
    Object.keys(objs[0]).forEach((el) => {
        tbl_str += "<th>" + el + "</th>";
    });
    tbl_str += "</tr>";
    objs.forEach((obj) => {
        tbl_str += "<tr>";
        Object.values(obj).forEach((el) => {
            tbl_str += "<td>" + el + "</td>";
        });
        tbl_str += "</tr>";
    });
    tbl_str += "</table>";
    document.getElementById(id).innerHTML = tbl_str;
}