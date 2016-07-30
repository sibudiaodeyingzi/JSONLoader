/*
 * Contains helper functions used for selective loading
 */

/**
 * Checks if value matches values in conditionArgs. conditionArgs can be an array or a single value. Can be used for any data type
 */
function _matchValue(value, conditionValues){
	conditionValues = toArray(conditionValues);
	var conditionLen = conditionValues.length;
	for(var i = 0; i < conditionLen; i++){
		if(value === conditionValues[i]){
			return true;
		}
	}
	return false;
};
function loadDataSelectiveMatch(setName, loadName, excludeNames, conditionDataName, conditionArgs,  loadIdentifier){
	var func = _matchValue;
	loadDataSelective(setName, loadName, excludeNames, conditionDataName, func, conditionArgs,  loadIdentifier);
}

/**
 * Checks if Strings in conditionArgs contain the value. conditionArgs can be an array or a single value. Used for String only
 */
function _containValue(value, conditionValues){
	var conditionValues = toArray(conditionValues);
	var conditionLen = conditionValues.length;
	for(var i = 0; i < conditionLen; i++){
		if(value.indexOf(conditionValues[i]) > -1){
			return true;
		}
	}
	return false;
};
function loadDataSelectiveContain(setName, loadName, excludeNames, conditionDataName, conditionArgs,  loadIdentifier){
	var func = _containValue;
	loadDataSelective(setName, loadName, excludeNames, conditionDataName, func, conditionArgs,  loadIdentifier);
}

/**
 * Checks if Strings in conditionArgs contain the value. conditionArgs can be an array or a single value. Used for String only
 */
function _containCaseInsensitiveValue(value, conditionValues){
	var conditionValues = toArray(conditionValues);
	var conditionLen = conditionValues.length;
	value = value.toLowerCase();
	for(var i = 0; i < conditionLen; i++){
		if(value.indexOf(conditionValues[i].toLowerCase()) > -1){
			return true;
		}
	}
	return false;
};
function loadDataSelectiveContainCaseInsensitive(setName, loadName, excludeNames, conditionDataName, conditionArgs,  loadIdentifier){
	var func = _containCaseInsensitiveValue;
	loadDataSelective(setName, loadName, excludeNames, conditionDataName, func, conditionArgs,  loadIdentifier);
}

/**
 * Checks if value is between the specified 2 numbers in conditionArgs inclusive. conditionArgs is an array of length 2. Used for numbers only.
 */
function _valueBetweenInclusive(value, conditionValues){
	if(value >= conditionValues[0] && value <= conditionValues[1]){
		return true;
	} else {
		return false;
	}
};
function loadDataSelectiveBetweenInclusive(setName, loadName, excludeNames, conditionDataName, conditionArgs,  loadIdentifier){
	if(conditionArgs.length < 2){
		return;
	}
	var func = _valueBetweenInclusive;
	loadDataSelective(setName, loadName, excludeNames, conditionDataName, func, conditionArgs,  loadIdentifier);
}

/**
 * Checks if value is between the specified 2 numbers in conditionArgs. conditionArgs is an array of length 2. Used for numbers only.
 */
function _valueBetween(value, conditionValues){
	if(value > conditionValues[0] && value < conditionValues[1]){
		return true;
	} else {
		return false;
	}
};
function loadDataSelectiveBetween(setName, loadName, excludeNames, conditionDataName, conditionArgs,  loadIdentifier){
	if(conditionArgs.length < 2){
		return;
	}
	var func = _valueBetween;
	loadDataSelective(setName, loadName, excludeNames, conditionDataName, func, conditionArgs,  loadIdentifier);
}

/**
 * Checks if value is less than the value specified in conditionArgs. conditionArgs is a single value. Used for numbers only.
 */
function _valueLessThan(value, conditionValues){
	conditionValues = toArray(conditionValues);
	if(value < conditionValues[0]){
		return true;
	} else {
		return false;
	}
};
function loadDataSelectiveLessThan(setName, loadName, excludeNames, conditionDataName, conditionArgs,  loadIdentifier){
	var func = _valueLessThan;
	loadDataSelective(setName, loadName, excludeNames, conditionDataName, func, conditionArgs,  loadIdentifier);
}

/**
 * Checks if value is greater than the value specified in conditionArgs. conditionArgs is a single value. Used for numbers only.
 */
function _valueGreaterThan(value, conditionValues){
	conditionValues = toArray(conditionValues);
	if(value > conditionValues[0]){
		return true;
	} else {
		return false;
	}
};
function loadDataSelectiveGreaterThan(setName, loadName, excludeNames, conditionDataName, conditionArgs,  loadIdentifier){
	var func = _valueGreaterThan;
	loadDataSelective(setName, loadName, excludeNames, conditionDataName, func, conditionArgs,  loadIdentifier);
}