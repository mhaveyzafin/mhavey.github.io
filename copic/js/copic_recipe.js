// This JS file is responsible for mainintaing favorite recipes

var favePrefix = "_copicfav_";
var favePrefixLen = favePrefix.length;
var faves = new Object();	

// get recipe with given name
function cpr_getRecipe(name, failIfNotFound) {
	if (faves[name] === undefined) {
		if (failIfNotFound == true) {
			throw "Recipe not found *" + name + "*";
		} else {
			faves[name] = new Object();
		}
	}
	return faves[name];
};

// save copic recipe to local storage
function cpr_saveRecipe(name) {
	localStorage.setItem(favePrefix + name, JSON.stringify(faves[name]));
};

// for given code, save in memory changes to the recipe
function cpr_modifyRecipe(name, tags, colors, modTags, modColors, saveNow) {
	var recipe = cpr_getRecipe(name, false);
	if (modTags == true) {
		recipe.tags = JSON.parse(JSON.stringify(tags));
	}
	if (modColors == true) {
		recipe.colors = JSON.parse(JSON.stringify(colors));
	}
	recipe.lastModified = new Date();
	if (saveNow) {
		cpr_saveRecipe(name);
	}
}

// remove recipe from memory and stoage
function cpr_removeRecipe(name) {
	if (faves[name] === undefined) {
		throw "Receipe not found *" + name + "*";
	}
	delete faves[name];
	localStorage.removeItem(favePrefix + name);
}

// return list of recipe names for the given copic color code
function cpr_getRecipesForCode(code) {
	var recipes = new Array();
	for (name in faves) {
		if (faves[name].colors.indexOf(code) > 0) {
			recipes.push(name);
		}
	}
	return recipes;
}

//
// Admin functions
//

// clear all recipes in memory
function cpr_clearAllRecipes() {
	faves = new Array();
}

// load recipe into memory
function cpr_loadRecipe(name, obj) {
	if (name.indexOf(favePrefix) == 0) {
		faves[name.substring(favePrefixLen)] = obj;
	}
	return false;
}

// delete specified recipe
function cpr_deleteRecipe(name) {
	if (name.indexOf(favePrefix) == 0) {
		localStorage.removeItem(name);
		return true;
	}
	return false;
}

// export recipe for specified item
function cpr_exportRecipe(item) {
	if (item.indexOf(favePrefix) == 0) {
		return {
			type : "recipe",
			name : item.substring(favePrefixLen),
			obj : JSON.parse(localStorage[item])
		};
	} else {
		return null;
	}
}

// import recipe from specified obj
function cpr_importRecipe(obj) {
	if (obj.type == "recipe") {
		var name = obj.name;
		var val = obj.obj;
		localStorage.setItem(favePrefix + name, JSON.stringify(val));
		faves[name] = val;
		return true;
	}
	return false;
}
