//
// Builder Div presentation logic
//

var builderState = new Object();

function init_builderDiv() {
	pres_showPane("matchedSourceTable", false);
	pres_showPane("matchResultsTable", false);
	pres_showPane("noMatch", true);

	// if we're tabbing here, redo the last search
	if (builderState.source !== undefined) {
		presb_copicSearch();
	}

	// one-time initialization of the tag editor
	if (builderState.tagInit === undefined) {
		$(function() {
			$('#recipeTagsText').tagEditor({
				placeholder : 'Enter tags ...'
			});
		});
		builderState.tagInit = true;
	}
	presb_refreshRecipe();
}

// load recipe in builder; this is called from the faves tab
function presb_loadRecipe(name) {
	pres_tabTo("builderDiv");
	var recipe = cpr_getRecipe(name, true);
	var currName = document.getElementById("recipeNameText").value.trim();

	var builderIsEmpty = false;
	if (currName == "") {
		if (presb_getColorsInBuilder().length == 0
				&& presb_getTagsInBuilder().length == 0) {
			builderIsEmpty = true;
		}
	}

	if (currName != name && builderIsEmpty == false) {
		if (currName == "") {
			currName = "unnamed";
		}
		if (confirm("You have a different recipe (" + currName
				+ ") open for edit. Do you want to clear it and start editing "
				+ name + "?") == false) {
			return;
		}
	}

	presb_clearRecipe(null);
	document.getElementById("recipeNameText").value = name;
	$('#recipeTagsText').tagEditor('destroy');
	$('#recipeTagsText').tagEditor({
		placeholder : 'Enter tags ...',
		initialTags : recipe.tags
	});
	for ( var i = 0; i < recipe.colors.length; i++) {
		presb_appendColorToRecipe(recipe.colors[i]);
	}
}

// refresh the recipe colors in the builder; this is called when an attribute of
// the color has changed
function presb_refreshRecipe() {
	var row = document.getElementById("recipeTable").rows[0];
	var colors = presb_getColorsInBuilder();

	// delete all cells except the signpost, which is the last cell
	for ( var i = row.cells.length - 2; i >= 0; i--) {
		row.deleteCell(i);
	}
	for ( var i = 0; i < colors.length; i++) {
		presb_appendColorToRecipe(colors[i]);
	}
}

// commit recipe in builder
function presb_commitRecipe() {
	var name = document.getElementById("recipeNameText").value.trim();
	var tags = $('#recipeTagsText').tagEditor('getTags')[0].tags;
	if (name.length == 0) {
		alert("You must enter a name");
		return;
	}
	var colors = presb_getColorsInBuilder();
	cpr_modifyRecipe(name, tags, colors, true, true, true);
	alert("Recipe saved");
}

// clear recipe in builder
function presb_clearRecipe(name) {
	var currName = document.getElementById("recipeNameText").value.trim();

	if (name != null && currName == name) {
		if (confirm("You have this recipe open currently. Do you want to delete it?") == false) {
			return;
		}
	}

	var row = document.getElementById("recipeTable").rows[0];

	// delete all cells except the signpost, which is the last cell
	for ( var i = row.cells.length - 2; i >= 0; i--) {
		row.deleteCell(i);
	}

	// clear the name and tags
	document.getElementById("recipeNameText").value = "";
	$('#recipeTagsText').tagEditor('destroy');
	$('#recipeTagsText').tagEditor({
		placeholder : 'Enter tags ...',
		initialTags: ['']
	});
}

// remove specified color from recipe
function presb_removeColorFromRecipe(color) {
	var row = document.getElementById("recipeTable").rows[0];
	// the last cell is the signpost, so don't consider that one
	for ( var i = 0; i < row.cells.length - 1; i++) {
		// the color is in the hidden field that is the first child
		if (row.cells[i].firstChild.value == color) {
			row.deleteCell(i);
			return;
		}
	}
	throw "Color not found *" + color + "*";
}

// identify color to be dragged into recipe
function presb_dragColorToRecipe(ev, colorID, dragSource) {
	// replace source with parent id
	if (dragSource == "recipe") {
		if (ev.target.parentElement.nodeName != "TD") {
			throw "Unable to determine recipe drag source for color *"
					+ colorID + "* parent is *"
					+ ev.target.parentElement.nodeName;
		}
		dragSource = ev.target.parentElement.id;
	}

	var sourceObj = {
		color : colorID,
		source : dragSource
	};
	ev.dataTransfer.setData("text", JSON.stringify(sourceObj));
}

// drop a color onto recipe builder, either from the search matches or a swap
// from another color in the builder
function presb_dropColorToRecipe(ev) {
	ev.preventDefault();
	var row = document.getElementById("recipeTable").rows[0];
	var sourceObj = JSON.parse(ev.dataTransfer.getData("text"));
	if (sourceObj.source == "match") {
		// match source means add a new color, either at the end, or just before
		// the target
		if (ev.currentTarget.id !== undefined
				&& ev.currentTarget.id == "recipeDropSign") {
			// dropping to the sign; means append
			presb_appendColorToRecipe(sourceObj.color);
		} else {
			if (presb_builderHasColor(sourceObj.color)) {
				throw "Drop from match rejected because builder has color *"
						+ sourceObj.color + "*";
			}

			// drop one behind the target; first need to determine the position
			// of the target
			var target = presb_findTargetCell(ev.currentTarget);
			var pos = -1;
			for ( var i = 0; i < row.cells.length; i++) {
				if (row.cells[i].id == target.id) {
					pos = i;
					break;
				}
			}
			if (pos < 0) {
				throw "Drop position not found " + target.id;
			}
			presb_createBuilderCell(row, pos, sourceObj.color);

		}
		// refresh the search
		presb_copicSearch();
	} else {
		if (ev.currentTarget.id !== undefined
				&& ev.currentTarget.id == "recipeDropSign") {
			presb_removeColorFromRecipe(sourceObj.color);
			var numCells = row.cells.length;
			presb_createBuilderCell(row, numCells - 1, sourceObj.color);
		} else {
			// it is from another cell; we're just going to do a content swap
			var sourceCell = document.getElementById(sourceObj.source);
			var destCell = presb_findTargetCell(ev.currentTarget);
			var temp = sourceCell.innerHTML;
			sourceCell.innerHTML = destCell.innerHTML;
			destCell.innerHTML = temp;
		}
	}
}

// add a color to the row at the specified position
function presb_createBuilderCell(recipeRow, pos, colorID) {
	var cellID = pres_nextID();
	var colorSpec = new Object();
	colorSpec.draggable = true;
	colorSpec.droppable = true;
	colorSpec.dragSource = "recipe"; // at "drag" time, this will be replaced
	// with actual ID
	colorSpec.showInv = true;
	colorSpec.invChangeHandler = "presb_copicSearch();presb_refreshRecipe();";
	colorSpec.showRemove = true;
	var cell = recipeRow.insertCell(pos);
	cell.id = cellID;
	cell.innerHTML = '<input type="hidden" value="' + colorID + '"/>'
			+ pres_showColor(colorID, colorSpec);
}

// add a color at the end of the recipe
function presb_appendColorToRecipe(colorID) {

	if (presb_builderHasColor(colorID)) {
		throw "Append rejected because builder has color *" + colorID + "*";
	}

	var recipeRow = document.getElementById("recipeTable").rows[0];
	var numCells = recipeRow.cells.length;
	presb_createBuilderCell(recipeRow, numCells - 1, colorID);
}

function presb_getTagsInBuilder() {
	return $('#recipeTagsText').tagEditor('getTags')[0].tags;
}

// return an array of color codes based on what is in the builder
function presb_getColorsInBuilder() {
	var colors = new Array();
	var row = document.getElementById("recipeTable").rows[0];
	// the last cell is the signpost, so don't consider that one
	for ( var i = 0; i < row.cells.length - 1; i++) {
		// the color is in the hidden field that is the first child
		colors.push(row.cells[i].firstChild.value);
	}
	return colors;
}

// return true if color is in the builder
function presb_builderHasColor(color) {
	var row = document.getElementById("recipeTable").rows[0];
	// the last cell is the signpost, so don't consider that one
	for ( var i = 0; i < row.cells.length - 1; i++) {
		// the color is in the hidden field that is the first child
		if (row.cells[i].firstChild.value == color) {
			return true;
		}
	}
	return false;
}

function presb_findTargetCell(dropTarget) {
	if (dropTarget.nodeName == "TD") {
		return dropTarget;
	} else if (dropTarget.parentElement.nodeName == "TD") {
		return dropTarget.parentElement;
	} else {
		throw "Unable to classify drop target " + dropTarget;
	}
}

// perform copic search
function presb_copicSearch() {
	var source = document.getElementById("copicSourceText").value;
	source = source.trim();
	if (source.length == 0) {
		return;
	}
	builderState.source = source.toUpperCase();

	// show the color to be matched
	var colorSpec = new Object();
	colorSpec.showDesc = true;
	colorSpec.showInv = true;
	colorSpec.invChangeHandler = "presb_copicSearch();presb_refreshRecipe()";
	colorSpec.draggable = true;
	colorSpec.dragSource = "match";
	colorSpec.showAdd = true;
	document.getElementById("matchedSourceTable").rows[0].cells[0].innerHTML = pres_showColor(
			builderState.source, colorSpec);

	var alg = document.getElementById("copicAlgSelect").value.trim();
	var incFamily = document.getElementById("incFamilyCheck").checked;
	var incInv = document.getElementById("excNoInv").checked;
	var incExc = document.getElementById("showExclusionCheck").checked;
	
	builderState.matches = new Array();

	// build a list and sort by strength of match; keep track of exclusions
	for (code in copicCatalog) {

		// skip if it's the source color
		if (code == builderState.source) {
			continue;
		}

		var item = new Object();
		item.code = code;
		item.dist = 0.0;
		item.myDist = 0.0;
		item.reason = "match";

		// track if it is exclusion, no inv, or regular match
		if (cpx_hasExclusion(builderState.source, code) == true && incExc == false) {
			continue;
		}
		if (incInv == true && cpx_getXCat(code).hasMarker == false) {
			continue;
		}
		
		if (alg == "rgb") {
			item.dist = cpl_rgbDist(builderState.source, code);
		} else if (alg == "cie") {
			item.dist = cpl_deltaE(builderState.source, code);
		} else {
			throw ("Illegal algorithm " + alg);
		}

		item.myDist = item.dist;
		if (incFamily == true
				&& cpl_sameFamilyGroup(builderState.source, code)) {
			item.myDist = 0.01;
			item.reason = "family";
		}
		builderState.matches.push(item);
	}
	builderState.matches.sort(presb_distCmp);
	presb_showMatches();
}

// refresh match display
function presb_showMatches() {
	pres_showPane("matchedSourceTable", true);
	pres_showPane("matchResultsTable", (builderState.matches.length > 0));
	pres_showPane("noMatch", (builderState.matches.length == 0));
	var table = document.getElementById("matchResultsTable");
	pres_clearTable(table, true);
	var numMatchesShown = 0;
	var currentRow = null;

	// show the matches
	var matchLimit = parseInt(document.getElementById("numMatchesText").value);
	var cols = 10;
	var colorSpec = new Object();
	colorSpec.showDesc = true;
	colorSpec.showInv = true;
	colorSpec.showExclusion = true;
	colorSpec.source = builderState.source;
	colorSpec.invChangeHandler = "presb_copicSearch();presb_refreshRecipe();";
	colorSpec.excludeChangeHandler = "presb_copicSearch();";
	colorSpec.draggable = true;
	colorSpec.dragSource = "match";
	colorSpec.showAdd = true;
	for ( var i = 0; i < builderState.matches.length; i++) {
		var item = builderState.matches[i];

		// don't show more than the specified limit
		if (numMatchesShown == matchLimit) {
			continue;
		}
		// start new row
		if ((numMatchesShown % cols) == 0) {
			currentRow = table.insertRow(-1);
		}

		colorSpec.strength = item.dist.toFixed(2);
		colorSpec.reason = item.reason;
		var cell = currentRow.insertCell(-1);
		cell.style.verticalAlign = "top";
		cell.innerHTML = pres_showColor(item.code, colorSpec);
		cell.style.verticalAlign = "top";
		numMatchesShown++;
	}
}

// sort function; we want to sort by distance
function presb_distCmp(a, b) {
	if (a.myDist < b.myDist) {
		return -1;
	}
	if (b.myDist < a.myDist) {
		return 1;
	}
	return 0;
}

// helper to enable drop
function presb_allowDrop(ev) {
	ev.preventDefault();
}
