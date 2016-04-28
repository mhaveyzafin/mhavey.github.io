//
//Tab navigation
//
var tabs = [ "builderDiv", "faveDiv", "catDiv", "adminDiv" ];

var supportsLocalStorage = 'localStorage' in window
		&& window['localStorage'] !== null;

function pres_initApp() {
	if (supportsLocalStorage == false) {
		alert("Your browser does not support local storage and therefore will not work. Please try a recent version of Chrome or Firefox.");
		return;
	}
	presa_loadAll();
	pres_tabTo(tabs[0]);
}

function pres_tabTo(name) {
	for ( var i = 0; i < tabs.length; i++) {
		if (tabs[i] == name) {
			continue;
		}
		pres_showPane(tabs[i], false);
	}
	pres_showPane(name, true);
	var initFn = "init_" + name + "();";
	eval(initFn);
}

//
// 6. General presentation logic
//

// show color as HTML
// code = which color to show
// colorSpec = details about how to show the color
function pres_showColor(code, colorSpec) {
	// get the details from the catalog: code, desc, rgb color
	// representation
	var details = copicCatalog[code];
	if (details === undefined) {
		throw "Color not in catalog " + code;
	}
	var rgb = details[0];
	var textColor = details[2];

	var xcat = cpx_getXCat(code);

	// 
	// drag/drop
	//
	var drag = "";
	var drop = "";
	if (colorSpec.draggable !== undefined && colorSpec.draggable == true) {
		drag = 'draggable="true" ondragStart="presb_dragColorToRecipe(event,\''
				+ code + '\',\'' + colorSpec.dragSource + '\');"';
	}
	if (colorSpec.droppable !== undefined && colorSpec.droppable == true) {
		drop = 'ondrop="presb_dropColorToRecipe(event)" ondragover="presb_allowDrop(event)"';
	}

	//
	// build the text part of the color
	//

	var text = code;
	var textHeight = 1;
	if (colorSpec.showDesc !== undefined && colorSpec.showDesc == true) {
		text += " (" + details[1] + ")";
		textHeight ++;
	}
	if (colorSpec.strength !== undefined && colorSpec.reason !== undefined) {
		text += "<p>" + colorSpec.strength + " " + colorSpec.reason;
		textHeight +=2;
	}
	var sHeight = textHeight + "em";

	// time to build the buttons
	var sbuttons = "";

	// show in summary view the current exclusions; allow me to remove the
	// exclusion too
	if (colorSpec.showFlyout !== undefined && colorSpec.showFlyout == true) {
		var buttonID = pres_nextID();
		sbuttons += '<input type="button" id="' + buttonID
				+ '" value="Details.." onclick="pres_showFlyout(\'' + code
				+ '\',\'' + buttonID + '\');"';
	}

	if (colorSpec.showInv !== undefined && colorSpec.showInv == true) {
		var checked = "";
		var invFlag = true;

		sbuttons += "<p>";
		if (xcat.hasMarker == true) {
			checked = "checked";
			invFlag = false;
		}
		var buttonHandler = "cpx_setMarkerInventory('" + code + "'," + invFlag
				+ ",true);" + colorSpec.invChangeHandler;
		var cellID = pres_nextID();
		sbuttons += '<label for="' + cellID
				+ '" style="vertical-align:text-bottom"><input id="' + cellID
				+ '" type="checkbox" ' + checked + ' onchange="'
				+ buttonHandler + '">Marker</label>';

		checked = "";
		invFlag = true;
		if (xcat.hasRefill == true) {
			checked = "checked";
			invFlag = false;
		}
		var buttonHandler = "cpx_setRefillInventory('" + code + "'," + invFlag
				+ ",true);" + colorSpec.invChangeHandler;
		cellID = pres_nextID();
		sbuttons += '<label for="' + cellID
				+ '" style="vertical-align:text-bottom"><input id="' + cellID
				+ '" type="checkbox" ' + checked + ' onchange="'
				+ buttonHandler + '">Refill</label>';
	}
	if (colorSpec.showExclusion !== undefined
			&& colorSpec.showExclusion == true) {
		var checkedFlag = "";
		var isEx = "true";
		if (cpx_hasExclusion(colorSpec.source, code)) {
			checkedFlag = "checked";
			isEx = "false";
		}
		var buttonHandler = "cpx_setExclusion(\'" + colorSpec.source + "'	,'"
				+ code + '\',' + isEx + ',true);'
				+ colorSpec.excludeChangeHandler;
		var cellID = pres_nextID();
		sbuttons += '<p><label for="' + cellID
				+ '" style="vertical-align:text-bottom"><input id="' + cellID
				+ '" type="checkbox" ' + checkedFlag + ' onchange="'
				+ buttonHandler + '">Bad match</label>';
	}
	// add is just like a drop
	if (colorSpec.showAdd !== undefined && colorSpec.showAdd == true
			&& presb_builderHasColor(code) == false) {
		sbuttons += '<p><input type="button" value="Add To Recipe" onclick="presb_appendColorToRecipe(\''
				+ code + '\');presb_copicSearch();"/>';
	}
	if (colorSpec.showRemove != undefined && colorSpec.showRemove == true) {
		sbuttons += '<p><input type="button" value="Remove" onclick="presb_removeColorFromRecipe(\''
				+ code + '\');presb_copicSearch();"/>';
	}
	// here she is; isn't she pretty?
	return '<div ' + drag + " " + drop + '><div style="height:' + sHeight
			+ ';background-color:#' + rgb + '; color:' + textColor + ';">'
			+ text + '</div><p>' + sbuttons + '</div>';
}

function pres_showFlyout(code, sourceElemID) {
	var details = copicCatalog[code];
	if (details === undefined) {
		throw "Color not in catalog " + code;
	}
	var xcat = cpx_getXCat(code);

	var text = "<h2>Details of " + code + "<h3>";
	text += "The color is " + pres_showColor(code, {});
	text += "<h3>Exclusions</h3><p>";
	var cols = 5;
	var currIdx = 0;
	var exTableDiv = document.createElement("DIV");
	var exTable = document.createElement("TABLE");
	exTableDiv.appendChild(exTable);
	var colorSpec = new Object();
	colorSpec.showExclusion = true;
	colorSpec.source = code;
	colorSpec.excludeChangeHandler = "";
	for ( var i = 0; i < xcat.exclusions.length; i++) {
		if ((currIdx % cols) == 0) {
			row = exTable.insertRow(-1);
		}
		var cell = row.insertCell(-1);
		cell.innerHTML = pres_showColor(xcat.exclusions[i], colorSpec);
		currIdx++;
	}
	if (currIdx > 0) {
		text += exTableDiv.innerHTML;
	}
	text += "<h3>Recipes</h3><p>";
	var favesForColor = cpr_getRecipesForCode(code);
	if (favesForColor.length > 0) {
		text += favesForColor.join(",");
	}
	text += '<p><input type="button" value="Close" onclick="document.getElementById(\'catFlyoutDiv\').style.display=\'none\';init_catDiv();"/>';

	var sourceElem = document.getElementById(sourceElemID);
	var x = pres_findPosX(sourceElem) + "px";
	var y = pres_findPosY(sourceElem) + "px";
	var divElement = document.getElementById("catFlyoutDiv");
	divElement.innerHTML = text;
	divElement.style.left = x;
	divElement.style.top = y;
	// console.log(x + " " + y + " " + window.innerWidth + " " +
	// window.innerHeight);
	divElement.style.display = "block";
}

function pres_findPosX(obj) {
	var curleft = 0;
	if (obj.offsetParent)
		while (1) {
			curleft += obj.offsetLeft;
			if (!obj.offsetParent)
				break;
			obj = obj.offsetParent;
		}
	else if (obj.x)
		curleft += obj.x;
	return curleft;
}

function pres_findPosY(obj) {
	var curtop = 0;
	if (obj.offsetParent)
		while (1) {
			curtop += obj.offsetTop;
			if (!obj.offsetParent)
				break;
			obj = obj.offsetParent;
		}
	else if (obj.y)
		curtop += obj.y;
	return curtop;
}

// helper function to clear a table
function pres_clearTable(table, skipHeader) {
	var first = 1;
	if (skipHeader == true) {
		first = 0;
	}
	for ( var i = table.rows.length - 1; i >= first; i--) {
		table.deleteRow(i);
	}
}

// helper function to show/hide an element
function pres_showElement(id, show, display) {
	var vis = "hidden";
	if (show == true) {
		vis = "visible";
	}
	else {
		display = "none";
	}
	document.getElementById(id).style.visibility = vis;
	document.getElementById(id).style.display = display;
}

//helper function to show/hide an element
function pres_showPane(id, show) {
	pres_showElement(id, show, "block");
}

//helper function to show/hide an element
function pres_showWidget(id, show) {
	pres_showElement(id, show, "inline");
}

// give me a unique ID for an element
var lastID = 0;
function pres_nextID() {
	lastID++;
	return "cell" + lastID;
}

// finds the x position of the specified object
function pres_findPosX(obj) {
	var curleft = 0;
	if (obj.offsetParent)
		while (1) {
			curleft += obj.offsetLeft;
			if (!obj.offsetParent)
				break;
			obj = obj.offsetParent;
		}
	else if (obj.x)
		curleft += obj.x;
	return curleft;
}

//finds the y position of the specified object
function pres_findPosY(obj) {
	var curtop = 0;
	if (obj.offsetParent)
		while (1) {
			curtop += obj.offsetTop;
			if (!obj.offsetParent)
				break;
			obj = obj.offsetParent;
		}
	else if (obj.y)
		curtop += obj.y;
	return curtop;
}
