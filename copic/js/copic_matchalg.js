// some utilities used by matching algorithm

// two markers in the same color family (e.g., B) and same blending group (e.g.
// 1)
// for example, B11 and B12 are in same family group
// console.log(sameFamilyGroup("0", "B00"));
// console.log(sameFamilyGroup("B01", "T2"));
// console.log(sameFamilyGroup("T1", "T2"));
// console.log(sameFamilyGroup("C10", "C1"));
// console.log(sameFamilyGroup("FB2", "FBG2"));
// console.log(sameFamilyGroup("FB2", "B00"));
// console.log(sameFamilyGroup("BG0000", "BG000"));
// console.log(sameFamilyGroup("BG0000", "BG00"));
// console.log(sameFamilyGroup("BG0000", "BG01"));
// console.log(sameFamilyGroup("BG0000", "B01"));
// console.log(sameFamilyGroup("B11", "B01"));
// console.log(sameFamilyGroup("B11", "B14"));
function cpl_sameFamilyGroup(code1, code2) {

	// exclude white, black, gray, fluorescent
	if (code1.indexOf("C") == 0 || code1.indexOf("F") == 0
			|| code1.indexOf("T") == 0 || code1 == "0" || code1 == "100"
			|| code1 == "110") {
		return false;
	}
	if (code2.indexOf("C") == 0 || code2.indexOf("F") == 0
			|| code2.indexOf("T") == 0 || code2 == "0" || code2 == "100"
			|| code2 == "110") {
		return false;
	}

	var toks1 = code1.split(/([A-Z]+)([0-9])([0-9]+)/);
	var toks2 = code2.split(/([A-Z]+)([0-9])([0-9]+)/);
	return (toks1[1] == toks2[1] && toks1[2] == toks2[2]);
}

// euc distance based on RGB
function cpl_rgbDist(code1, code2) {
	var det1 = copicCatalog[code1];
	var det2 = copicCatalog[code2];
	return Math.sqrt(Math.pow(det2[3] - det1[3], 2)
			+ Math.pow(det2[4] - det1[4], 2) + Math.pow(det2[5] - det1[5], 2));
}

// deltaE algorithm to compare CIE-LAB values for two colors
// see http://www.easyrgb.com/index.php?X=DELT&H=04#text4
function cpl_deltaE(code1, code2) {
	// weights - depends on app, default = 1
	var whtL = 1.0;
	var whtC = 1.0;
	var whtH = 1.0;

	// get CIE-LAB values for each code
	var det1 = copicCatalog[code1];
	var det2 = copicCatalog[code2];
	var cieL1 = det1[6], cieL2 = det2[6];
	var cieA1 = det1[7], cieA2 = det2[7];
	var cieB1 = det1[8], cieB2 = det2[8];

	var xC1 = Math.sqrt(Math.pow(cieA1, 2) + Math.pow(cieB1, 2));
	var xC2 = Math.sqrt(Math.pow(cieA2, 2) + Math.pow(cieB2, 2));
	var xDL = cieL2 - cieL1;
	var xDC = xC2 - xC1;
	var xDE = Math.sqrt(Math.pow(cieL1 - cieL2, 2) + Math.pow(cieA1 - cieA2, 2)
			+ Math.pow(cieB1 - cieB2, 2));
	var xDH = 0.0;
	if (Math.sqrt(xDE) > (Math.sqrt(Math.abs(xDL)) + Math.sqrt(Math.abs(xDC)))) {
		xDH = Math.sqrt((xDE * xDE) - (xDL * xDL) - (xDC * xDC));
	}
	var xSC = 1 + (0.045 * xC1);
	var xSH = 1 + (0.015 * xC1);
	xDL = xDL / whtL;
	xDC = xDC / (whtC * xSC);
	xDH = xDH / (whtH * xSH);

	var deltaE94 = Math.sqrt(Math.pow(xDL, 2) + Math.pow(xDC, 2)
			+ Math.pow(xDH, 2));
	return deltaE94;
}

