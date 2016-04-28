//
//Fave div presentation logic
//

// show favorites table; render each row
var arrFaves = [];
function init_faveDiv() {
	var table = document.getElementById("faveTable");
	pres_clearTable(table, false);
	arrFaves = [];

	// decide whether to display inv check
	var colorSpec = new Object();
	colorSpec.showInv = document.getElementById("showFaveInvCheck").checked;
	var cols = 6;
	if (colorSpec.showInv == true) {
		colorSpec.invChangeHandler = "init_faveDiv();";
	} else {
		cols += 4;
	}

	// decide whether to show tag
	var numCells = 4;
	var nameIdx = 0;
	var tagsIdx = 1;
	var colorIdx = 2;
	var buttonIdx = 3;
	var showTags = document.getElementById("showFaveTagsCheck").checked;
	if (showTags == true) {
		// might have to re-add the column header
		if (table.rows[0].cells.length == 3) {
			table.rows[0].insertCell(1).innerHTML = "Tags";
		}
	} else {
		cols += 5;
		numCells = 3;
		colorIdx = 1;
		buttonIdx = 2;
		// might have to remove the colum header
		if (table.rows[0].cells.length == 4) {
			table.rows[0].deleteCell(1);
		}
	}

	var hasAFave = false;
	for (name in faves) {
		hasAFave = true;
		var row = table.insertRow(-1);
		var cells = [];
		for ( var i = 0; i < numCells; i++) {
			cells.push(row.insertCell(-1));
		}
		var index = arrFaves.length;
		var colorTable = document.createElement("TABLE");
		var colorRow = null;
		var colorCount = 0;
		for ( var i = 0; i < faves[name].colors.length; i++) {
			if ((colorCount % cols) == 0) {
				colorRow = colorTable.insertRow(-1);
			}
			colorCount++;
			var cell = colorRow.insertCell(-1);
			cell.innerHTML = pres_showColor(faves[name].colors[i], colorSpec);
			cell.style.verticalAlign = "top";
		}
		cells[nameIdx].innerHTML = name;
		if (showTags == true) {
			cells[tagsIdx].innerHTML = '<textarea rows="2" cols="30" id="tagsInlineText_'
					+ index + '"></textarea>';
			$(function() {
				$('#tagsInlineText_' + index).tagEditor({
					placeholder : 'Enter tags ...',
					initialTags : faves[name].tags,
					onChange : function(elem, b, tags) {
						var index = parseInt(elem.attr('id').split('_')[1]);
						var name = arrFaves[index].name;
						cpr_modifyRecipe(name, tags, null, true, false, true);
					}
				});
			});
		}

		cells[colorIdx].appendChild(colorTable);
		cells[buttonIdx].innerHTML = '<input type="button" value="Edit" onclick="presb_loadRecipe(\''
				+ name
				+ '\');">'
				+ '<input type="button" value="Remove" onclick="cpr_removeRecipe(\''
				+ name
				+ '\'); presb_clearRecipe(\''
				+ name
				+ '\'); init_faveDiv();"/>';
		arrFaves.push({
			name : name,
			tags : faves[name].tags,
			index : index,
			row : row.innerHTML
		});
	}

	if (hasAFave) {
		pres_showPane("faveTableDiv", true);
		pres_showPane("noFave", false);
		if (document.getElementById("faveFilterText").value.trim().length > 0) {
			presf_filterFaves();
		}
		else {
			presf_showOrderList(null);
		}
	} else {
		pres_showPane("faveTableDiv", false);
		pres_showPane("noFave", true);
	}
}

// do fuzzy search for recipe
function presf_filterFaves() {
	var searchText = document.getElementById("faveFilterText").value.trim();
	if (searchText.length == 0) {
		init_faveDiv();
		return;
	}
	var showTags = document.getElementById("showFaveTagsCheck").checked;
	var keys = [ 'name', 'tags' ];
	if (showTags == false) {
		keys = [ 'name' ];
	}
	var table = document.getElementById("faveTable");
	pres_clearTable(table, false);
	var options = {
		id : [ "index" ],
		keys : keys
	};
	var fuse = new Fuse(arrFaves, options);
	var filter = fuse.search(searchText);

	var betterFilter = [];

	for ( var i = 0; i < filter.length; i++) {
		if (filter[i] !== undefined) {
			var idx = parseInt(filter[i]);
			betterFilter.push(idx);
			var row = table.insertRow(-1);
			row.innerHTML = arrFaves[idx].row;
		}
	}

	presf_showOrderList(betterFilter);
}

// show list of markers/refills to order
var orderListKey = "_copicorder";
function presf_showOrderList(filter) {
	var markers = [];
	var refills = [];
	var cols = 10;

	var mTable = document.getElementById("orderMarkerTable");
	var rTable = document.getElementById("orderRefillTable");
	pres_clearTable(mTable, true);
	pres_clearTable(rTable, true);
	var mRow = null;
	var rRow = null;
	var mCount = 0;
	var rCount = 0;
	var colorSpec = new Object();
	colorSpec.showInv = true;
	colorSpec.invChangeHandler = "init_faveDiv();";

	// build the order list
	for ( var i = 0; i < arrFaves.length; i++) {
		if (filter != null && filter.indexOf(i) < 0) {
			continue;
		}
		var colors = faves[arrFaves[i].name].colors;
		for ( var j = 0; j < colors.length; j++) {
			if (markers.indexOf(colors[j]) < 0
					&& cpx_getXCat(colors[j]).hasMarker == false) {
				markers.push(colors[j]);
				if ((mCount % cols) == 0) {
					mRow = mTable.insertRow(-1);
				}
				mCount++;
				var cell = mRow.insertCell(-1);
				cell.style.verticalAlign = "top";
				cell.innerHTML = pres_showColor(colors[j], colorSpec);
			}
			if (refills.indexOf(colors[j]) < 0
					&& cpx_getXCat(colors[j]).hasRefill == false) {
				refills.push(colors[j]);
				if ((rCount % cols) == 0) {
					rRow = rTable.insertRow(-1);
				}
				rCount++;
				var cell = rRow.insertCell(-1);
				cell.style.verticalAlign = "top";
				cell.innerHTML = pres_showColor(colors[j], colorSpec);
			}
		}
	}

	pres_showPane("orderMarkerTable", (mCount != 0));
	pres_showPane("orderRefillTable", (rCount != 0));

	var orderList = {
		"marker" : markers,
		"refill" : refills
	};
	localStorage[orderListKey] = JSON.stringify(orderList);
}

function presf_displayOrderPage() {
	var sorderList = localStorage[orderListKey];
	if (sorderList === undefined) {
		alert("Order List NOT FOUND!!!");
		return;
	}
	var orderList = JSON.parse(sorderList);
	if (orderList.marker === undefined || orderList.refill === undefined) {
		alert("Order List MALFORMED!!!");
		return;
	}

	var perLine = 15;

	var markers = "none";
	if (orderList.marker.length > 0) {
		markers = "";
		for ( var i = 0; i < orderList.marker.length; i++) {
			if (i > 0 && (i % perLine) == 0) {
				markers += "<p>";
			}
			markers += orderList.marker[i] + "  ";
		}
	}

	var refills = "none";
	if (orderList.refill.length > 0) {
		refills = "";
		for ( var i = 0; i < orderList.refill.length; i++) {
			if (i > 0 && (i % perLine) == 0) {
				refills += "<p>";
			}
			refills += orderList.refill[i] + "  ";
		}
	}
	document.getElementById("orderMarkers").innerHTML = markers;
	document.getElementById("orderRefills").innerHTML = refills;
	window.print();
}