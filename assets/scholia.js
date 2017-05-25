/**
 * This code has mainly been copied from from Scholia.
 */

// http://stackoverflow.com/questions/1026069/
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

var wdLinkPrefix = 'https://tools.wmflabs.org/reasonator/?q=';

function convertDataTableData(data, columns) {
    // Handle 'Label' columns.
    var convertedData = [];
    var convertedColumns = [];
    for (var i = 0 ; i < columns.length ; i++) {
	column = columns[i];
	if (column.substr(-5) == 'Label') {
	    // pass
	} else {
	    convertedColumns.push(column);
	}
    }
    for (var i = 0 ; i < data.length ; i++) {
	var convertedRow = {};
	for (var key in data[i]) {
	    if (key + 'Label' in data[i]) {
		    convertedRow[key] = '<a href="' + wdLinkPrefix
                + data[i][key].substr(31)
		        + '">' + data[i][key + 'Label'] + '</a>';
	    } else if (key.substr(-5) == 'Label') {
		// pass
	    } else if (key == 'orcid') {
		// Add link to ORCID website
		convertedRow[key] = '<a href="https://orcid.org/' +
		    data[i][key] + '">' + 
		    data[i][key] + '</a>';
	    } else {
		convertedRow[key] = data[i][key];
	    }
	}
	convertedData.push(convertedRow);
    }
    return {data: convertedData, columns: convertedColumns}
}


function sparqlDataToSimpleData(response) {
    // Convert long JSON data from from SPARQL endpoint to short form
    let data = response.results.bindings;
    let columns = response.head.vars
    var convertedData = [];
    for (var i = 0 ; i < data.length ; i++) {
	var convertedRow = {};
	for (var key in data[i]) {
	    convertedRow[key] = data[i][key]['value'];
	}
	convertedData.push(convertedRow);
    }
    return {data: convertedData, columns: columns};
}


function sparqlToDataTable(sparql, element) {
    element = $(element);
    if (!element.length) {
        return;
    }

    var url = "https://query.wikidata.org/bigdata/namespace/wdq/sparql?query=" + 
	encodeURIComponent(sparql) + '&format=json';

    $.getJSON(url, function(response) {
	var simpleData = sparqlDataToSimpleData(response);

	convertedData = convertDataTableData(simpleData.data, simpleData.columns)
	columns = [];
	for ( i = 0 ; i < convertedData.columns.length ; i++ ) {
	    var column = {
		data: convertedData.columns[i],
		title: capitalizeFirstLetter(convertedData.columns[i]).replace("_", "&nbsp;"),
		defaultContent: "",
	    }
	    columns.push(column)
	}

	table = element.DataTable({ 
	    data: convertedData.data,
	    columns: columns,
	    lengthMenu: [[10, 25, 100, -1], [10, 25, 100, "All"]],
	    order: [[ 0, "desc" ]],
	    paging: (convertedData.data.length > 10),
	});

	element.append(
	    '<caption><a href="https://query.wikidata.org/#' + 
		encodeURIComponent(sparql) +	
		'">Edit on query.wikidata.org</a></caption>');
    });
}
