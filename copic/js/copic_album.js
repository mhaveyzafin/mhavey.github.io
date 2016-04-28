// This JS file is responsible for maintaining album

var pagePrefix = "_copicpage_";
var pagePrefixLen = pagePrefix.length;
var albumPages = new Object();

// get recipe with given name
function cpp_getPage(name) {
	if (albumPages[name] === undefined) {
		throw "Page not found *" + name + "*";
	}

	return albumPages[name];
}

// save copic recipe to local storage and memory
function cpp_savePage(title, text, markers, recipes) {
	if (albumPages[title] === undefined) {
		albumPages[title] = new Object();
	}
	albumPages[title].content = text;
	albumPages[title].markers = JSON.parse(JSON.stringify(markers));
	albumPages[title].recipes = JSON.parse(JSON.stringify(recipes));

	localStorage.setItem(pagePrefix + title, JSON.stringify(albumPages[title]));
};

// remove recipe from memory and stoage
function cpp_removePage(name, failIfNotFound) {
	if (albumPages[name] === undefined) {
		if (failIfNotFound == true) {
			throw "Page not found *" + name + "*";
		} else {
			console.log("Unable to remove page *" + name + "*");
		}
	}

	delete albumPages[name];
	localStorage.removeItem(pagePrefix + name);
}

//
// Admin functions
//

// clear all recipes in memory
function cpp_clearAllPages() {
	albumsPages = new Object();
}

// load recipe into memory
function cpp_loadPage(name, obj) {
	if (name.indexOf(pagePrefix) == 0) {
		albumPages[name.substring(pagePrefixLen)] = obj;
	}
	return false;
}

// delete specified recipe
function cpp_deletePage(name) {
	if (name.indexOf(pagePrefix) == 0) {
		localStorage.removeItem(name);
		return true;
	}
	return false;
}

// export recipe for specified item
function cpp_exportPage(item) {
	if (item.indexOf(pagePrefix) == 0) {
		return {
			type : "page",
			name : item.substring(pagePrefixLen),
			obj : JSON.parse(localStorage[item])
		};
	} else {
		return null;
	}
}

// import recipe from specified obj
function cpp_importPage(obj) {
	if (obj.type == "page") {
		var name = obj.name;
		var val = obj.obj;
		localStorage.setItem(pagePrefix + name, JSON.stringify(val));
		albumPages[name] = val;
		return true;
	}
	return false;
}
