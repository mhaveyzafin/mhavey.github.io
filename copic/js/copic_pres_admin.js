//
//Admin Div presentation logic
//

function init_adminDiv() {
	// nothing to do
}

function presa_loadAll() {
	for (name in localStorage) {
		try {
			var obj = JSON.parse(localStorage[name]);
			if (cpx_loadXCat(name, obj) == false) {
				if (cpr_loadRecipe(name, obj) == false) {
					//cpp_loadPage(name, obj);
				}
			}
		} catch (e) {
			// console.log("Ignore *" + name + "*");
		}
	}
}

// delete all settings;
function presa_deleteAll() {
	cpx_clearAllXCat();
	cpr_clearAllRecipes();
	for (name in localStorage) {
		if (cpx_deleteXCat(name) == false) {
			if (cpr_deleteRecipe(name) == false) {
				//cpp_deletePage(name);
			}
		}
	}
	alert("Settings deleted successfully!");
}

// import settings to text area
function presa_importAll() {
	var text = document.getElementById("dumpText").value;
	var lines = text.split(/\r?\n/);
	for ( var i = 0; i < lines.length; i++) {
		var thisLine = lines[i].trim();
		if (thisLine == "") {
			continue;
		}
		try {
			var obj = JSON.parse(thisLine);
			if (cpx_importXCat(obj) == false) {
				if (cpr_importRecipe(obj) == false) {
					//cpp_importPage(obj);
				}
			}
		} catch (e) {
			console.log("error parsing line *" + thisLine + "*" + e);
		}
	}
	alert("Settings imported successfully!");
}

// export all settings to text area
function presa_exportAll() {
	var text = "";
	for (item in localStorage) {
		var obj = cpr_exportRecipe(item);
		if (obj == null) {
			obj = cpx_exportXCat(item);
		}
		if (obj == null) {
			//obj = cpp_exportPage(item);
		}
		if (obj != null) {
			text += JSON.stringify(obj) + "\n";
		}
	}
	document.getElementById("dumpText").value = text;
}
