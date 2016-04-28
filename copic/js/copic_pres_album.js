//
//Album Div presentation logic
//

// create the rich-text editor
var albumEditor;
KindEditor.ready(function(K) {
	albumEditor = K.create('textarea[name="albumRichContent"]', {
		resizeType : 1,
		allowPreviewEmoticons : false,
		allowImageUpload : false,
		width : '700px',
		height : '600px',
		items : [ 'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor',
				'bold', 'italic', 'underline', 'removeformat', '|',
				'justifyleft', 'justifycenter', 'justifyright',
				'insertorderedlist', 'insertunorderedlist', '|', 'emoticons',
				'image', 'link' ]
	});
});

// store unsolved page in memory here
var isDirty = false;
var firstTimeIn = true;
var markerEditorCreated = false;
var arrLinkedRecipes = [];
var lastSelection = "";

// on init;
function init_albumDiv() {
	// we do stuff only the first time tabbed in
	if (firstTimeIn == true) {
		// present a new page for edit
		presl_new();

		// show the table of contents of pages
		presl_showTOC();

		firstTimeIn = false;

	}
}

// create new page;
// triggers: tabbing here for the first time, clicking the new button
function presl_new() {

	if (presl_saveWarning() == false) {
		return;
	}

	pres_showPane("albumPageEditDiv", true);
	pres_showPane("albumPageViewDiv", false);
	pres_showPane("albumLinkToMarkersFlyoutDiv", false);
	pres_showPane("albumLinkToRecipesFlyoutDiv", false);
	pres_showWidget("albumPreviewButton", true);
	pres_showWidget("albumEditButton", false);
	document.getElementById("albumTitleText").value = "";
	albumEditor.html("");
	document.getElementById("albumLinkedMarkers").value = "[]";
	document.getElementById("albumLinkedRecipes").value = "[]";

	presl_showTOC();
}

// show the content in preview mode
// trigger: clicking the preview button
function presl_preview() {
	pres_showPane("albumPageEditDiv", false);
	pres_showPane("albumPageViewDiv", true);
	pres_showPane("albumLinkToMarkersFlyoutDiv", false);
	pres_showPane("albumLinkToRecipesFlyoutDiv", false);
	pres_showWidget("albumPreviewButton", false);
	pres_showWidget("albumEditButton", true);

	var text = "<p>Showing page with title <b>"
			+ document.getElementById("albumTitleText").value + "</b><p>";
	text += albumEditor.html();
	document.getElementById("albumPageViewDiv").innerHTML = text;
}

// show page in edit mode
// trigger: clicking the edit button
function presl_edit() {
	pres_showPane("albumPageEditDiv", true);
	pres_showPane("albumPageViewDiv", false);
	pres_showPane("albumLinkToMarkersFlyoutDiv", false);
	pres_showPane("albumLinkToRecipesFlyoutDiv", false);
	pres_showWidget("albumPreviewButton", true);
	pres_showWidget("albumEditButton", false);
}

// remove current item
// trigger: clicking the remove button
function presl_remove() {

	if (presl_saveWarning() == false) {
		return;
	}

	cpp_removePage(document.getElementById("albumTitleText").value, false);

	// just go to new page, but to prevent dirty warning again, blank out the
	// album editor
	albumEditor.html("");
	presl_new();
}

// save current item
// trigger: clicking the save button
function presl_save() {

	var title = document.getElementById("albumTitleText").value;
	var content = albumEditor.html();
	var markers = JSON
			.parse(document.getElementById("albumLinkedMarkers").value);
	var recipes = JSON
			.parse(document.getElementById("albumLinkedRecipes").value);

	cpp_savePage(title, content, markers, recipes);
	presl_showTOC();
	isDirty = false;
}

// show page table of contents
// trigger: tabbed to this page, save/remove performed
function presl_showTOC() {

	var selector = document.getElementById("albumPageTOC");

	// clear the select
	while (selector.firstChild) {
		selector.removeChild(selector.firstChild);
	}

	// build the selector list based on what's in the DB
	var nameInTitle = document.getElementById("albumTitleText").value;
	var idx = 0;
	var madeSelection = false;
	for (name in albumPages) {
		var thisOption = document.createElement("OPTION");
		thisOption.text = name;
		thisOption.value = name;
		selector.appendChild(thisOption);
		if (name == nameInTitle) {
			madeSelection = true;
			lastSelection = name;
			selector.selectedIndex = idx;
		}
		idx++;
	}
	if (madeSelection == false) {
		lastSelection = "";
		selector.selectedIndex = -1;
	}

	// show the selector if it has any items
	pres_showWidget("albumPageTOC", idx > 0);
}

// show selected page for viewing
// trigger: TOC option change
function presl_selectPage() {
	if (presl_saveWarning() == false) {
		presl_showTOC(); // this will move me back to where I was.
		return;
	}

	// what was selected?
	var selector = document.getElementById("albumPageTOC");
	var selectedName = selector.options[selector.selectedIndex].value;
	var currentObject = cpp_getPage(selectedName);

	// populate the edit div
	document.getElementById("albumTitleText").value = selectedName;
	albumEditor.html(currentObject.content);
	document.getElementById("albumLinkedMarkers").value = JSON
			.stringify(currentObject.markers);
	document.getElementById("albumLinkedRecipes").value = JSON
			.stringify(currentObject.recipes);

	// show in edit mode
	presl_edit();
}

// trigger: link markers button
function presl_linkToMarkers() {
	var sourceElem = document.getElementById("albumLinkToMarkersButton");
	var x = pres_findPosX(sourceElem) + "px";
	var y = pres_findPosY(sourceElem) + "px";
	var divElement = document.getElementById("albumLinkToMarkersFlyoutDiv");
	divElement.style.left = x;
	divElement.style.top = y;
	pres_showPane("albumLinkToMarkersFlyoutDiv", true);

	// load the tag editor
	if (markerEditorCreated == true) {
		$('#albumMarkersText').tagEditor('destroy');
	}
	markerEditorCreated = true;
	var existingTags = JSON
			.parse(document.getElementById("albumLinkedMarkers").value);

	$(function() {
		$('#albumMarkersText').tagEditor({
			placeholder : 'Enter tags ...',
			initialTags : existingTags,
			onChange : function(elem, b, lcTags) {
				presl_linkedMarkerChange(lcTags);
			}
		});
	});
	presl_linkedMarkerChange(existingTags);
}

// called when linked marker change is made
function presl_linkedMarkerChange(lcTags) {
	// convert tags to upper case; filter out the
	// ones not in catalog
	var tags = [];
	for ( var i = 0; i < lcTags.length; i++) {
		var tag = lcTags[i].toUpperCase();
		if (copicCatalog[tag] !== undefined) {
			tags[tags.length] = tag;
		}
	}

	// save the good tags back to the hidden element
	document.getElementById("albumLinkedMarkers").value = JSON.stringify(tags);

	// build the table showing the colors
	var table = document.getElementById("albumLinkedMarkersTable");
	pres_clearTable(table, true);
	var row = null;
	var cols = 6;
	var colorSpec = new Object();
	colorSpec.showDesc = true;
	for ( var i = 0; i < tags.length; i++) {
		if ((i % cols) == 0) {
			row = table.insertRow(-1);
		}
		var cell = row.insertCell(-1);
		cell.innerHTML = pres_showColor(tags[i].toUpperCase(), colorSpec);
		cell.style.verticalAlign = "top";
	}
	presl_setDirty();
}

// show link to recipes flyout
// trigger: link button
function presl_linkToRecipes() {
	var sourceElem = document.getElementById("albumLinkToRecipesButton");
	var x = pres_findPosX(sourceElem) + "px";
	var y = pres_findPosY(sourceElem) + "px";
	var divElement = document.getElementById("albumLinkToRecipesFlyoutDiv");
	divElement.style.left = x;
	divElement.style.top = y;
	pres_showPane("albumLinkToRecipesFlyoutDiv", true);

	var existingRecipes = JSON.parse(document
			.getElementById("albumLinkedRecipes").value);

	var rtable = document.getElementById("albumLinkedRecipesTable");
	pres_clearTable(rtable, false);
	var colorSpec = new Object();
	var cols = 10;
	arrLinkedRecipes = [];
	for (name in faves) {
		var row = rtable.insertRow(-1);
		row.insertCell(-1).innerHTML = name;
		row.insertCell(-1).innerHTML = faves[name].tags.join(",");

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

		row.insertCell(-1).appendChild(colorTable);

		var checkFlag = "";
		if (existingRecipes.indexOf(name) >= 0) {
			checkFlag = "checked";
		}
		row.insertCell(-1).innerHTML = '<input type="checkbox"' + checkFlag
				+ ' onclick="presl_recipeToggle(\'' + name + '\');"/>';
		arrLinkedRecipes.push({
			"index" : arrLinkedRecipes.length,
			"name" : name,
			"tags" : faves[name].tags.join(" "),
			"row" : row.innerHTML
		});
	}
}

// add/remove recipe from list of linked recipes
// trigger: checking box in recipe flyout
function presl_recipeToggle(recipe) {
	var existingRecipes = JSON.parse(document
			.getElementById("albumLinkedRecipes").value);
	var pos = existingRecipes.indexOf(recipe);
	if (pos < 0) {
		existingRecipes.push(recipe);
	} else {
		existingRecipes.splice(pos, 1);
	}
	document.getElementById("albumLinkedRecipes").value = JSON
			.stringify(existingRecipes);
	presl_setDirty();
}

// filter the recipes shown in the recipes flyout
// trigger: filter change
function presl_filterRecipes() {
	var searchText = document.getElementById("albumRecipeFilterText").value
			.trim();
	if (searchText.length == 0) {
		presl_linkToRecipes();
		return;
	}
	var table = document.getElementById("albumLinkedRecipesTable");
	pres_clearTable(table, false);
	var options = {
		id : [ "index" ],
		keys : [ "name", "tags" ]
	};
	var fuse = new Fuse(arrLinkedRecipes, options);
	var filter = fuse.search(searchText);

	var betterFilter = [];

	for ( var i = 0; i < filter.length; i++) {
		if (filter[i] !== undefined) {
			var idx = parseInt(filter[i]);
			betterFilter.push(idx);
			var row = table.insertRow(-1);
			row.innerHTML = arrLinkedRecipes[idx].row;
		}
	}
}

// set the dirty flag; various onchange handlers call this
function presl_setDirty() {
	isDirty = true;
}

// local function to do the following:
// 1. if the page is dirty, warn the user and ask if they want to continue or
// stay. If they
// want to continue, clear the dirty flag.
// 2. return true if it is OK to continue;
function presl_saveWarning() {
	if (isDirty == true || albumEditor.isDirty() == true) {
		var yes = confirm("You are unsaved content. You will lose it if you click Yes. Click No to stay here.");
		if (yes == true) {
			isDirty = false;
		}
		return yes;
	}
	return true;
}