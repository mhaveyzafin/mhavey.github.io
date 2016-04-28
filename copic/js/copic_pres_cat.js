//
//cat Div presentation logic
//	
function init_catDiv() {
	// reload cat and recipes - just in case
	presa_loadAll();

	// clear existing rows in cat table - will be reloading it
	var table = document.getElementById("catTable");
	pres_clearTable(table, true);

	// build the new table
	var cols = 10;
	var currIdx = 0;
	var colorSpec = new Object();
	colorSpec.showDesc = true;
	// colorSpec.showFlyout = true; // For now dont show this
	colorSpec.showInv = true;
	colorSpec.invChangeHandler = "init_catDiv();";

	for (code in copicCatalog) {
		if ((currIdx % cols) == 0) {
			row = table.insertRow(-1);
		}
		var cell = row.insertCell(-1);
		cell.innerHTML = pres_showColor(code, colorSpec);
		cell.style.verticalAlign="top";
		currIdx++;
	}
}
