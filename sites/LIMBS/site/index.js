/**
 * Makes a request to perform a SQL query and calls the given function with the returned data (as the first argument)
 * @param {string} query - The SQL query to execute
 * @param {function} func - The function to call with the data
 * @param {...*} funcArgs - The rest of the arguments for the function
 */
function exec_query(query, func, ...funcArgs) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
            if (this.getResponseHeader("Content-Type") === 'application/json') {
                func(JSON.parse(this.responseText), funcArgs);
            }
            else {
                console.log("Server data request failed: " + this.statusText);
            }
        }
    };
    xhttp.open("GET", window.location.protocol + '//' + window.location.host + "/query?query=" + encodeURIComponent(query));
    xhttp.send();
}

/**
 * Builds an html table given an array of objects and puts it on the page at the given <div>
 * @param {Array.<Object>} objs - The data to put on the table
 * @param {string} id - The id of the <div>
 */
function build_table(objs, id) {
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

window.onload = () => {exec_query("SELECT first_name, last_name FROM sakila.actor", build_table, "item_tbl")};