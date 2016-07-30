// Data sets
var elemData = {};
var dataSet = {};

// Internal Constants
var IDENTIFIER_ALLDATA = 'alldata';

var ELEM_PATH = 'path';
var ELEM_NAME = 'name';
var ELEM_CHILD = 'child';
var ELEM_ACTIONTYPE = 'type';
var ELEM_PARENTS = 'parents';
var ELEM_DATANAME = 'dataname';

var CUSTATTR_LOADED_TEXT_TAG = 'ltexttag';
var CUSTATTR_LOADED_ATTR_TAG = 'lattrtag';
var CUSTATTR_LOADED_VAL_TAG = 'lvaltag';
var CUSTATTR_LOADED_CLONE_TAG = 'lclonetag';
var CUSTATTR_LOADED_GROUP_TAG = 'lgrouptag';

// Configurable Constants
var VARIABLE_PARENTHESIS = '^';

// Internal/External Constants
var TYPE_TEXT = 'text';
var TYPE_ATTR = 'attr';
var TYPE_VAL = 'val';
var TYPE_CLONE = 'clone';
var TYPE_GROUP = 'group';

// Unpack settings
var DEF_UNPACKARR_APPEND = 0;
var DEF_UNPACKARR_REPLACE = 1;
// Sorting
var DEF_SORT_ASC = 0;
var DEF_SORT_DESC = 1;
// LoadDef
var DEF_ORDER_RANGE = 0;
var DEF_ORDER_SORT = 1;
var DEF_ORDER_SELECT = 2;
/*
 * Configurable methods
 */
function setVariableParenthesis(parenthesis){
	VARIABLE_PARENTHESIS = parenthesis;
}

function changeActionType(setName, fullName, actionType){
	var elem = getLastElem(setName, fullName);
	if(elem == null){
		console.error("changeActionType - Elem not found. setName " + setName + " fullName " + fullName);
		return;
	}
	elem[ELEM_ACTIONTYPE] = toArray(actionType);
}

/*
 * Mapping methods
 */
function mapTextElementToNames(setName, name, elementPath, dataName, parentNames){
	mapElementToNames(setName, name, elementPath, TYPE_TEXT, dataName, parentNames);
}

function mapValueElementToNames(setName, name, elementPath, dataName, parentNames){
	mapElementToNames(setName, name, elementPath, TYPE_VAL, dataName, parentNames);
}

function mapAttrElementToNames(setName, name, elementPath, dataName, parentNames){
	mapElementToNames(setName, name, elementPath, TYPE_ATTR, dataName, parentNames);
}

function mapCloneElementToNames(setName, name, elementPath, dataName, parentNames){
	mapElementToNames(setName, name, elementPath, TYPE_CLONE, dataName, parentNames);
}

function mapGroupElementToNames(setName, name, elementPath, dataName, parentNames){
	mapElementToNames(setName, name, elementPath, TYPE_GROUP, dataName, parentNames);
}
/**
 * Adds an entry to the load element table
 * @param setName Required. A key/name to identify the set of data
 * @param name Required. Name of elem
 * @param elementPath Required. A jquery string specifying an element in the web page.
 * @param actionType Required. Valid values: TYPE_*. See documentation for more info
 * @param dataName Required. Name of unpacked data to use. For actionType with TYPE_CLONE, the amount to clone will be based
 * 					on this argument to prevent index overflow errors.
 * @param parentNames Optional. Names of parents before it delimited by a whitespace.
 * @return void
 */
function mapElementToNames(setName, name, elementPath, actionType, dataName, parentNames){
	if(arguments.length < 5){
		console.error("mapElementToNames - Not enough parameters");
		return;
	}
	// Convert to array if not already converted
	actionType = toArray(actionType);
	dataName = toArray(dataName);
	
	if(actionType.length != dataName.length){
		console.error("mapElementToNames - actionType and dataName lengths do not match. setName - " + setName + " name - " + name +
				" actionType - " + actionType.length + " dataName - " + dataName.length);
		return;
	}
	
	if(!(setName in elemData)){
		elemData[setName] = {};
	}
	var newElem;
	if(parentNames == null || parentNames === ""){// No parents, create the elem at the top level
		newElem = elemData[setName][name] = {};
	} else { // Has a parent
		var parentObj = getLastElem(setName, parentNames);
		if(parentObj == null){// Invalid elem path in parent
			console.error("mapElementToNames - Unable to find parent. setName - " + setName + " parentNames " + parentNames);
			return;
		}
		if(!(ELEM_CHILD in parentObj)){// Create a child elem attribute if not created yet
			parentObj[ELEM_CHILD] = {};
		}
		
		newElem = parentObj[ELEM_CHILD][name] = {};
	}
	newElem[ELEM_PATH] = elementPath;
	newElem[ELEM_NAME] = name;
	newElem[ELEM_PARENTS] = parentNames;
	newElem[ELEM_DATANAME] = dataName;
	newElem[ELEM_ACTIONTYPE] = actionType;
}

/*
 * Unpacking methods
 */
/**
 * Unpacks a JSON formatted string found in the <'data-' + IDENTIFIER_ALLDATA> attribute from a web element
 * @param setName Required. A key/name to identify the set of data
 * @param elemName Required. A jquery string specifying the element where the attribute is found in
 * @param unpackArrType Optional. Valid values: DEF_UNPACKARR_APPEND (default) or DEF_UNPACKARR_REPLACE. Specifies
 * 				whether to append or replace an array if an existing entry is found.
 * @return void
 */
function unpackData(setName, elemName, unpackArrType){
	if(arguments.length < 2){
		console.error("unpackData - Not enough parameters");
		return;
	} else if (arguments.length == 2 || (unpackArrType !== DEF_UNPACKARR_APPEND && unpackArrType !== DEF_UNPACKARR_REPLACE)){
		unpackArrType = DEF_UNPACKARR_APPEND;
	}
	if($(elemName).length < 1 || $(elemName).data(IDENTIFIER_ALLDATA) == null){
		console.error("unpackData - Unable to find element. elemName - " + elemName);
		return;
	}
	
	if(!(setName in dataSet)){ // Create the data set if it's not created yet
		dataSet[setName] = {};
	}
	
	var allData = $.parseJSON(JSON.stringify($(elemName).data(IDENTIFIER_ALLDATA))); // Convert from JSON String to JS object
	var dataMap = dataSet[setName];
	for(var aData in allData){
		
		if(aData in dataMap){ // Entry already exists
			if(dataMap[aData] instanceof Array){
				if(unpackArrType == DEF_UNPACKARR_APPEND){ // Append to the back
					$.merge(dataMap[aData], allData[aData]);
				}
				else if (unpackArrType == DEF_UNPACKARR_REPLACE){ // Replace
					dataMap[aData] = allData[aData];
				}
			} else { // Not an array. Just replace
				dataMap[aData] = allData[aData];
			}
			
		} else { // New entry
			dataMap[aData] = allData[aData];
		}
	}

	// Remove the data attr to save space
	$(elemName).data(IDENTIFIER_ALLDATA, null);
	$(elemName).attr("data-" + IDENTIFIER_ALLDATA , '');
}

/**
 * Add data into the data table manually
 * @param setName Required. The name identifying the set to add data to
 * @param key Required. The key name of the data to add to
 * @param newData Required. The data to add
 * @param unpackArrType Optional. Valid values: DEF_UNPACKARR_APPEND (default) or DEF_UNPACKARR_REPLACE. Specifies
 * 				whether to append or replace an array if an existing entry is found.
 * @return
 */
function putDataIntoSet(setName, key, newData, unpackArrType){
	if(arguments.length < 3){
		console.error("putDataIntoSet - Not enough parameters");
		return;
	}
	if(unpackArrType == null || (unpackArrType !== DEF_UNPACKARR_APPEND && unpackArrType !== DEF_UNPACKARR_REPLACE)){// Append array by default
		unpackArrType = DEF_UNPACKARR_APPEND;
	}
	if(!(setName in dataSet)){// Create the data set if not created yet
		dataSet[setName] = {};
	}
	
	if(!(key in dataSet) || !(dataSet[setName][key] instanceof Array) || unpackArrType == DEF_UNPACKARR_REPLACE){// Replace the data
		dataSet[setName][key] = newData;
	} else {// Append the array
		$.merge(dataSet[setName][key], newData);
	}
}

/*
 * Loader methods
 */
/**
 * Loads a set of data manually into a list of given elements
 * @param setName Required. The name of data set to use
 * @param dataName Required. Key name of data to use
 * @param loadElements Required. An array of web elements to load data into
 * @param actionType Required. Valid values: TYPE_*. Specifies how the data will be loaded into the web elements
 * @param offset Required. The offset for data to load
 * @param count Required. Number of elements to load. Should be less than loadElements.length
 * @param replaceStr Required. The string to replace for elements containing VARIABLE_PARENTHESIS. null if not applicable
 * @param loadIdentifier Optional. A name given to web elements to indicate that an element has been loaded
 * @return Array of loaded elements
 */
function loadDataManual(setName, dataName, loadElements, actionType, offset, count, replaceStr, loadIdentifier){
	// Prepare arguments
	if(arguments.length < 7){
		console.error("loadDataManual - Not enough parameters");
		return null;
	} else if (arguments.length == 7 || loadIdentifier == null){
		loadIdentifier = '';
	}
	loadElements = toArray(loadElements);
	offset = parseInt(offset);
	count = parseInt(count);
	
	if(dataSet[setName] == null || dataSet[setName][dataName] == null){
		console.error("loadDataManual - Unable to find setName or dataName. setName - " + setName + " dataName - " + dataName);
		return null;
	}
	
	var loadDataSet = dataSet[setName][dataName];
	count = loadElements.length < count ? loadElements.length : count;
	var endIndex = offset + count > loadDataSet.length ? loadDataSet.length : offset + count; // Prevent overflow
	
	for(var i = 0, ii = offset; ii < endIndex; i++, ii++){
		var modifiedElement = loadElements[i];
		var loadVal = (loadDataSet instanceof Array) ? loadDataSet[ii] : loadDataSet;
		loadDataIntoElem(modifiedElement, loadVal, actionType, replaceStr, loadIdentifier);
	}
	return loadElements;
}

function loadDataSortAscending(setName, loadName, excludeNames, sortDataName, loadIdentifier){
	loadDataSort(setName, loadName, excludeNames, sortDataName, DEF_SORT_ASC, loadIdentifier);
}

function loadDataSortDescending(setName, loadName, excludeNames, sortDataName, loadIdentifier){
	loadDataSort(setName, loadName, excludeNames, sortDataName, DEF_SORT_DESC, loadIdentifier);
}

/**
 * Loads an elem, as well as all child elems belonging to it, with the exception of those in the exclusion list.
 * Loads data in a sorted order.
 * @param setName Required. The name of data set to use
 * @param loadName Required. Path specifying the elem name to load. Parents should be delimited with whitespaces.
 * @param excludeNames Required. An array containing paths to elems within loadName to exclude from the load. null if not required.
 * @param sortDataName Required. Name of data within dataset to sort
 * @param direction Required. The direction to sort. Ascending by default.
 * @param loadIdentifier Optional. A name given to web elements to indicate that an element has been loaded
 * @return void
 */
function loadDataSort(setName, loadName, excludeNames, sortDataName, direction, loadIdentifier){
	if(arguments.length < 5){
		console.error("loadDataSort - Not enough parameters");
		return;
	}
	if(dataSet[setName] == null || dataSet[setName][sortDataName] == null){
		console.error("loadDataSort - Unable to find setName or sortDataName. setName - " + setName + " sortDataName - " + sortDataName);
		return;
	}
	
	var loadElem = getLastElem(setName, loadName);
	if(loadElem == null){// Cant find element
		console.error("loadDataSort - Unable to find element. setName - " + setName +" loadName - " + loadName);
		return;
	}
	
	var excludeList = removeInvalidExclusion(setName, loadElem, excludeNames);// Remove invalid exclude elem paths
	var indexArr = null;
	indexArr = getIndexSort(indexArr, setName, sortDataName, direction);
	loadChildData(setName, loadElem, null, excludeList, indexArr, true, loadIdentifier);
}

/**
 * Loads an elem, as well as all child elems belonging to it, with the exception of those in the exclusion list.
 * Loads data that match a specified condition.
 * @param setName Required. The name of data set to use
 * @param loadName Required. Path specifying the elem name to load. Parents should be delimited with whitespaces.
 * @param excludeNames Required. An array containing paths to elems within loadName to exclude from the load. null if not required.
 * @param conditionDataName Required. Name of data within the dataSet to use to check if the condition matches.
 * @param conditionMatchFunc Required. A function taking 2 parameters, a single value to check and an array containing values required
 * 				during the condition check. The function must return a boolean value.
 * @param conditionArgs Required. An array containing values needed for condition checking. This array will be used in the 2nd parameter in conditionMatchFunc
 * @param loadIdentifier Optional. A name given to web elements to indicate that an element has been loaded
 * @return void
 */
function loadDataSelective(setName, loadName, excludeNames, conditionDataName, conditionMatchFunc, conditionArgs,  loadIdentifier){
	if(arguments.length < 7){
		console.error("loadDataSelective - Not enough parameters");
		return;
	}
	if(dataSet[setName] == null || dataSet[setName][conditionDataName] == null){
		console.error("loadDataSelective - Unable to find setName or conditionDataName. setName - " + setName + " conditionDataName - " + conditionDataName);
		return;
	}
	
	var loadElem = getLastElem(setName, loadName);
	if(loadElem == null){// Cant find element
		console.error("loadDataSelective - Unable to find element. setName - " + setName +" loadName - " + loadName);
		return;
	}
	
	var excludeList = removeInvalidExclusion(setName, loadElem, excludeNames);// Remove invalid exclude elem paths
	var indexArr = null;
	indexArr = getIndexSelective(indexArr, setName, conditionDataName, conditionMatchFunc, conditionArgs);
	loadChildData(setName, loadElem, null, excludeList, indexArr, true, loadIdentifier);
}

/**
 * Loads an elem, as well as all child elems belonging to it, with the exception of those in the exclusion list.
 * Loads data within a certain range
 * @param setName Required. The name of data set to use
 * @param loadName Required. Path specifying the elem name to load. Parents should be delimited with whitespaces.
 * @param excludeNames Required. An array containing paths to elems within loadName to exclude from the load. null if not required.
 * @param offset Required. The offset for data to load
 * @param count Required. Number of elements to load
 * @param loadIdentifier Optional. A name given to web elements to indicate that an element has been loaded
 * @return void
 */
function loadDataRange(setName, loadName, excludeNames, offset, count, loadIdentifier){
	// Prepare arguments
	if(arguments.length < 5){
		console.error("loadData - Not enough parameters");
		return;
	} else if (arguments.length == 5 || loadIdentifier == null){
		loadIdentifier = '';
	}
	offset = parseInt(offset);
	count = parseInt(count);
	
	if(dataSet[setName] == null){
		console.error("loadData - SetName not found in dataSet. setName - " + setName);
		return;
	}
	
	var loadElem = getLastElem(setName, loadName);
	if(loadElem == null){// Cant find element
		console.error("loadData - Unable to find element. setName - " + setName +" loadName - " + loadName);
		return;
	}
	
	var excludeList = removeInvalidExclusion(setName, loadElem, excludeNames); // Remove invalid exclude elem paths
	var indexArr = null;
	indexArr = getIndexRange(indexArr, offset, count);
	loadChildData(setName, loadElem, null, excludeList, indexArr, true, loadIdentifier);
}

/**
 * Loads an elem, as well as all child elems belonging to it, with the exception of those in the exclusion list.
 * Loads data with multiple load conditions (range/selective/range).
 * @param setName Required. The name of data set to use
 * @param loadName Required. Path specifying the elem name to load. Parents should be delimited with whitespaces.
 * @param excludeNames Required. An array containing paths to elems within loadName to exclude from the load. null if not required.
 * @param loadDef Required. The LoadDef object to use
 * @param loadIdentifier Optional. A name given to web elements to indicate that an element has been loaded
 * @return
 */
function loadDataMulti(setName, loadName, excludeNames, loadDef, loadIdentifier){
	if(arguments.length < 4){
		console.error("loadDataMulti - Not enough parameters");
		return;
	}
	if(dataSet[setName] == null){
		console.error("loadDataMulti - Unable to find setName. setName - " + setName);
		return;
	}
	if(!(loadDef instanceof LoadDef)){
		console.error("loadDataMulti - Invalid loadDef");
		return;
	}
	var loadElem = getLastElem(setName, loadName);
	if(loadElem == null){// Cant find element
		console.error("loadDataSort - Unable to find element. setName - " + setName +" loadName - " + loadName);
		return;
	}
	
	var indexes = null;
	var order = loadDef.exeOrder;
	var orderLen = order.length;
	
	// Optimisation: Ensure that select is executed first before sort if sort is executed right before select
	var sortIndex = order.indexOf(DEF_ORDER_SORT);
	if(sortIndex >= 0 && order.indexOf(DEF_ORDER_SELECT) == sortIndex + 1){
		var temp = order[sortIndex];
		order[sortIndex] = order[sortIndex + 1];
		order[sortIndex + 1] = temp;
		console.log(loadDef.exeOrder);
	}
	
	for(var i = 0; i < orderLen; i++){// Execute each order
		if(order[i] == DEF_ORDER_RANGE){
			indexes = getIndexRange(indexes, loadDef.offset, loadDef.count);
		} else if (order[i] == DEF_ORDER_SORT){
			indexes = getIndexSort(indexes, setName, loadDef.sortName, loadDef.sortDirection);
		} else if (order[i] == DEF_ORDER_SELECT){
			indexes = getIndexSelective(indexes, setName, loadDef.conditionName, loadDef.conditionFunc, loadDef.conditionArgs);
		} else {
			console.warn("loadDataMulti - Unknown order: " + order[i]);
		}
	}
	var excludeList = removeInvalidExclusion(setName, loadElem, excludeNames); // Remove invalid exclude elem paths
	loadChildData(setName, loadElem, null, excludeList, indexes, true, loadIdentifier);
}

/*
 * Info getting methods
 */

function getLoadedTextElements(parentElementName, loadIdentifier){
	return getLoadedElements(parentElementName, CUSTATTR_LOADED_TEXT_TAG, loadIdentifier);
}

function getLoadedValueElements(parentElementName, loadIdentifier){
	return getLoadedElements(parentElementName, CUSTATTR_LOADED_VAL_TAG, loadIdentifier);
}

function getLoadedAttrElements(parentElementName, loadIdentifier){
	return getLoadedElements(parentElementName, CUSTATTR_LOADED_ATTR_TAG, loadIdentifier);
}

function getLoadedCloneElements(parentElementName, loadIdentifier){
	return getLoadedElements(parentElementName, CUSTATTR_LOADED_CLONE_TAG, loadIdentifier);
}

function getLoadedGroupElements(parentElementName, loadIdentifier){
	return getLoadedElements(parentElementName, CUSTATTR_LOADED_GROUP_TAG, loadIdentifier);
}

/**
 * Returns an array of elements with the specified load identifier
 * @param parentElementName Required. The parent web element to search under
 * @param loadTag Required. The type of loaded data to find.
 * @param loadIdentifier Optional. The specific load identifier to search for. Will get all loaded elements of type loadTag if not specified
 * @return Array of loaded elements with the specified loadTag, and loadIdentifier if applicable
 */
function getLoadedElements(parentElementName, loadTag, loadIdentifier){
	if(arguments.length < 2){
		console.error("getLoadedElements - Not enough parameters");
		return;
	} else if (arguments.length == 2 || loadIdentifier == null){
		return $($(parentElementName).find("[" + loadTag + "]"));
	} else {
		return $($(parentElementName).find("[" + loadTag + "='" + loadIdentifier+"']"));
	}
}

/**
 * Returns the set of data found in the data set
 */
function getDataFromSet(setName, key){
	if(!(setName in dataSet) || !(key in dataSet[setName])){
		console.error("getDataFromSet - Unable to find setName or dataName. setName - " + setName + " key - " + key);
		return null;
	}
	return dataSet[setName][key];
}

/*
 * Web page manipulation methods
 */
function removeTextElements(parentElementName, loadIdentifier){
	removeElements(parentElementName, CUSTATTR_LOADED_TEXT_TAG, loadIdentifier);
}

function removeValueElements(parentElementName, loadIdentifier){
	removeElements(parentElementName, CUSTATTR_LOADED_VAL_TAG, loadIdentifier);
}

function removeAttrElements(parentElementName, loadIdentifier){
	removeElements(parentElementName, CUSTATTR_LOADED_ATTR_TAG, loadIdentifier);
}

function removeCloneElements(parentElementName, loadIdentifier){
	removeElements(parentElementName, CUSTATTR_LOADED_CLONE_TAG, loadIdentifier);
}

function removeGroupElements(parentElementName, loadIdentifier){
	removeElements(parentElementName, CUSTATTR_LOADED_GROUP_TAG, loadIdentifier);
}
/**
 * Removes web elements within parentElementName containing the specified loadTag and loadIdentifier
 * @param parentElementName Required. The parent web element to search under
 * @param loadTag Required. The type of loaded data to find.
 * @param loadIdentifier Optional. The specific load identifier to search for. Will get all loaded elements of type loadTag if not specified
 * @return
 */
function removeElements(parentElementName, loadTag, loadIdentifier){
	var removeElem = getLoadedElements(parentElementName, loadTag, loadIdentifier);
	if(removeElem != null && removeElem.length > 0){
		$(removeElem).remove();
	}
}

/*
 * Load definition object
 */
function LoadDef(){
	this.offset = 0;
	this.count = 0;
	this.sortName = null;
	this.sortDirection = DEF_SORT_ASC;
	this.conditionName = null;
	this.conditionFunc = null;
	this.conditionArgs = null;
	this.exeOrder = []; // Order of execution
	this.orderGiven = false; // True if an order has been set, false otherwise
}

LoadDef.prototype.setRange = function(offset, count) {
    this.offset = offset;
    this.count = count;
    if(!this.orderGiven){
    	this.addOrder(DEF_ORDER_RANGE);
    }
};

LoadDef.prototype.setSort = function(sortName, sortDirection){
	this.sortName = sortName;
	this.sortDirection = sortDirection;
	if(!this.orderGiven){
    	this.addOrder(DEF_ORDER_SORT);
    }
};

LoadDef.prototype.setCondition = function(conditionName, conditionFunc, conditionArgs){
	this.conditionName = conditionName;
	this.conditionFunc = conditionFunc;
	this.conditionArgs = conditionArgs;
	if(!this.orderGiven){
    	this.addOrder(DEF_ORDER_SELECT);
    }
};

LoadDef.prototype.setOrder = function(orders){
	this.exeOrder = toArray(orders);
	this.orderGiven = true;
};

LoadDef.prototype.addOrder = function(order){
	var index = this.exeOrder.indexOf(order);
    if(index >= 0){
    	this.exeOrder.splice(index, 1);
    }
    this.exeOrder.push(order);
};

/*
 * Internal helper functions
 */
function toArray(toConvert){
	if(toConvert instanceof Array){
		return toConvert;
	} else {
		return [toConvert];
	}
}

/**
 * Translates an absolute path with elem names into a jQuery path of web elements
 * @param setName Required. Set name in load element tree to use.
 * @param fullName Required. Absolute path with elem names to convert
 * @return The translated jQuery path string
 */
function getElementPathFromNames(setName, fullName){
	var parentNamesArr = fullName.replace(/\s+/g, " ").trim().split(" ");
	var parentLen = parentNamesArr.length;
	
	if (!(parentNamesArr[0] in elemData[setName])){
		return null;
	}
	
	var parentObj = elemData[setName][parentNamesArr[0]];
	var elemPath = parentObj[ELEM_PATH];
	for(var i = 1; i < parentLen; i++){
		if(!(ELEM_CHILD in parentObj) || !(parentNamesArr[i] in parentObj[ELEM_CHILD])){ // Not found
			return null;
		}
		parentObj = parentObj[ELEM_CHILD][parentNamesArr[i]];
		elemPath += ' ' + parentObj[ELEM_PATH];
	}
	return elemPath;
}

/**
 * Returns the elem from a given absolute path of elem names.
 * @param setName Required. The set name where the elem to return is under
 * @param fullName Required. Absolute path of elem names to return
 * @return The elem object matching the elem path if found, null otherwise
 */
function getLastElem(setName, fullName){
	var parentNamesArr = fullName.replace(/\s+/g, " ").trim().split(" ");
	var parentLen = parentNamesArr.length;

	if (!(parentNamesArr[0] in elemData[setName])){
		return null;
	}
	
	var parentObj = elemData[setName][parentNamesArr[0]];
	for(var i = 1; i < parentLen; i++){
		if(!(ELEM_CHILD in parentObj) || !(parentNamesArr[i] in parentObj[ELEM_CHILD])){ // Not found
			return null;
		}
		parentObj = parentObj[ELEM_CHILD][parentNamesArr[i]];
	}
	return parentObj;
}

/**
 * Does a validation check on the list of exclude elem names given, and removes invalid ones.
 * @param setName Required. Set name in load element tree to use.
 * @param loadName Required. Elem name where the exclude elem names are under.
 * @param excludeNames Required. An array containing the list of elem paths to exclude.
 * @return The verified exclude list
 */
function removeInvalidExclusion(setName, loadName, excludeNames){
	var excludeList = [];
	if(excludeNames != null){
		var excludeLen = excludeNames.length;
		for(var i = 0; i < excludeLen;){ // Remove invalid exclusions
			var elem = getLastElem(setName, loadName + " " + excludeNames[i]);
			if(elem == null){
				console.warn("removeInvalidExclusion - Invalid exclusion. Unable to find " + loadName + " " + excludeNames[i]);
				excludeNames.splice(i, 1);
			} else {
				excludeList.push(excludeNames[i].replace(/\s+/g, " ").trim().split(" "));
				i++;
			}
		}
	}
	return excludeList;
}

/**
 * A recursive method to load an elem and all of its children elems, without those specified in excludeList
 * @param setName Required. The set name containing the elems and data to load
 * @param currentElem Required. The current elem to load.
 * @param parentElements Required. Parent web elements to load.
 * @param excludeList Required. An array containing paths of elem names to exclude from the load
 * @param indexArr Required. The list of dataset indexes to load
 * @param isSorted Required. Indicates whether the indexArr is sorted. 
 * @param loadIdentifier Optional. A name given to web elements to indicate that an element has been loaded
 * @return void
 */
function loadChildData(setName, currentElem, parentElements, excludeList, indexArr, isSorted, loadIdentifier){
	
	if(indexArr == null){
		return;
	}
	
	// Get a copy of each arrays
	var actionTypes = currentElem[ELEM_ACTIONTYPE].slice(0);
	var dataNames = currentElem[ELEM_DATANAME].slice(0);
	
	// Execute the current elem action types
	if(actionTypes.length == dataNames.length){
		var index = 0;
		
		while (actionTypes.length > 0){
			if((index = $.inArray(TYPE_CLONE, actionTypes)) >= 0){// Settle clones first
				parentElements = cloneElement(setName, currentElem, dataNames[index], indexArr, isSorted, loadIdentifier);
				if(parentElements == null){// Do not load child elems if no clones are produced
					return;
				}
			} else if ((index = $.inArray(TYPE_GROUP, actionTypes)) >= 0){// Groups hold lesser priority than clones. They should not be used if there're clones anyway
				var parentNames = currentElem[ELEM_PARENTS] == null ? '' : currentElem[ELEM_PARENTS];
				var groupElement = $(getElementPathFromNames(setName, parentNames + " " + currentElem[ELEM_NAME]));
				
				parentElements = parentElements || [$(getElementPathFromNames(setName, parentNames + " " + currentElem[ELEM_NAME]))];
				
				if(groupElement.length < 1){
					return;
				}
				groupElement.attr(CUSTATTR_LOADED_GROUP_TAG, loadIdentifier); // Set the load identifier
			} else { // Loadable action types will be loaded last
				index = 0;
				var parentNames = currentElem[ELEM_PARENTS] == null ? '' : currentElem[ELEM_PARENTS];
				var actualParentElem = parentElements || [$(getElementPathFromNames(setName, parentNames + " " + currentElem[ELEM_NAME])).parent()];
				loadDataInParent(setName, currentElem, dataNames[index], actionTypes[index], actualParentElem, indexArr, loadIdentifier);
			}
			// Remove once executed
			actionTypes.splice(index, 1);
			dataNames.splice(index, 1);
		}
	} else {
		console.warn("loadChildData - dataNames and actionTypes do not match. " + currentElem[ELEM_NAME] + " will not be loaded");
	}
	
	// Load child elems if available
	if(ELEM_CHILD in currentElem){
		outer: 
		for(var childElem in currentElem[ELEM_CHILD]){
			var excludeChildList = [];
			var excludeLen = excludeList.length;
			// Check exclusion
			for(var i = 0; i < excludeLen; i++){
				if(excludeList[i][0] === childElem){ // Exclude path matches
					if(excludeList[i].length == 1){
						continue outer;
					} else {
						excludeList[i].shift(); // Remove the parent node
						excludeChildList.push(excludeList[i]);
					}
				}
			}
			loadChildData(setName, currentElem[ELEM_CHILD][childElem], parentElements, excludeChildList, indexArr, isSorted, loadIdentifier);
		}
	}
}

/**
 * Loads text/attribute/value data into a web element
 * @param loadElement Required. The web element to load data into
 * @param loadValue Required. The value/data to load
 * @param actionType Required. The type of action to perform
 * @param replaceStr Required. The string to look for and replace. In autoload, this will be the elem name.
 * @param loadIdentifier Optional. A name given to web elements to indicate that an element has been loaded
 * @return void
 */
function loadDataIntoElem(loadElement, loadValue, actionType, replaceStr, loadIdentifier){
	if(actionType == TYPE_TEXT){
		var contents = loadElement.contents();
		var contentLen = contents.length;
		if(loadElement.text() == null || loadElement.text() == '' || contentLen < 1){// Empty text
			loadElement.text(loadValue);
		} if (contentLen > 0) {
	    	var matchFound = false;
	    	
	  		for(var i = 0; i < contentLen; i++){// Go through all nodes, which may include inner HTML elements
		        if (contents.get(i).nodeType == Node.TEXT_NODE) {// Text Node found
		            var currentText = contents.get(i).textContent;
		            
		            if(currentText.indexOf(VARIABLE_PARENTHESIS + replaceStr + VARIABLE_PARENTHESIS) > -1){// JSONLoader tag found
		            	matchFound = true;
		            	var newText = currentText.replace(VARIABLE_PARENTHESIS + replaceStr + VARIABLE_PARENTHESIS, loadValue); // Replace the tag with value if found
		            	contents.get(i).textContent = newText;
		            }
		        }
	  		}
	  		if(!matchFound){// Unable to find tag. Value will be appended to the web element
	  			loadElement.prepend(document.createTextNode(loadValue));
	  		}
	  	}
	    loadElement.attr(CUSTATTR_LOADED_TEXT_TAG, loadIdentifier); // Set the load identifier
	    
	} else if (actionType == TYPE_ATTR){
		loadElement.each(function() {
			$.each(this.attributes, function() {
			    if(this.specified && this.name != 'value'){ // Look through all attributes except value
			    	this.value = this.value.replace(VARIABLE_PARENTHESIS + replaceStr + VARIABLE_PARENTHESIS, loadValue); // Replace the tag if found
			    }
		  });
		});
		loadElement.attr(CUSTATTR_LOADED_ATTR_TAG, loadIdentifier);// Set the load identifier
		
	} else if (actionType == TYPE_VAL){
		var currentVal = loadElement.val();
		if(currentVal == null || currentVal == ''){// Add the value directly if it is empty
			loadElement.val(loadValue);
		} else {// Since value is not found, look for the tag
			var newVal = currentVal.replace(VARIABLE_PARENTHESIS + replaceStr + VARIABLE_PARENTHESIS, loadValue);// Replace tag if found
			loadElement.val(newVal);
		}
		loadElement.attr(CUSTATTR_LOADED_VAL_TAG, loadIdentifier);// Set the load identifier
	}
}

/**
 * Clones a web element a certain amount of times. The resulting amount to clone will be the number of valid indexes within
 * the range of the mapped array.
 * @param setName Required. The set name containing the load element objects and data to clone
 * @param cloneElem Required. The elem to clone
 * @param dataName Required. The name of data to utilise
 * @param indexArr Required. The list of indexes to check for cloning.
 * @param isSorted Required. Indicates whether the indexArr is sorted. Note: Can be removed, this is in place to improve performance
 * @param loadIdentifier Optional. A name given to web elements to indicate that an element has been loaded
 * @return An array of cloned web elements
 */
function cloneElement(setName, cloneElem, dataName, indexArr, isSorted, loadIdentifier){
	if(loadIdentifier == null){
		loadIdentifier = '';
	}
	var parentNames = cloneElem[ELEM_PARENTS] == null ? '' : cloneElem[ELEM_PARENTS];
	var originalElement = $(getElementPathFromNames(setName, parentNames + " " + cloneElem[ELEM_NAME]));
	if(originalElement.length < 1){
		return null;
	}
	
	originalElement.length = 1; // There can only be 1 template to clone from. The first matching template will be used
	
	var clonedElements = [];
	var dataLen = dataSet[setName][dataName].length;
	var noOfClones;
	var indexLen = indexArr.length;
	
	if(isSorted){
		noOfClones = dataLen;
		for(var i = dataLen - 1; i >= 0; i--){// Check from the back
			if(indexArr[i] < dataLen){// No longer index out of bound
				break;
			}
			noOfClones--;// Index out of bound
		}
	} else {
		noOfClones = 0;
		for(var i = 0; i < indexLen; i++){ // Prevent overflows, ensure all indexes are in the array's range
			if(indexArr[i] < dataLen){
				noOfClones++;
			}
		}
	}
	
	if(noOfClones < 1){
		return null;
	}
	
	var clonedElement = originalElement.clone().insertAfter($(originalElement));// Clone once first
	clonedElement.attr(CUSTATTR_LOADED_CLONE_TAG, loadIdentifier);// Add the load identifier
	clonedElements.push(clonedElement);// Add to the list of cloned elements
	for(var i = 1; i < noOfClones; i++){
		clonedElement = clonedElement.clone().insertAfter($(clonedElement));
		clonedElements.push(clonedElement);
	}
	return clonedElements;
}

/**
 * Loads text/attribute/value data into the given parent elements
 * @param setName Required. The set name containing the load element objects and data to load
 * @param currentElem Required. The elem to use to load data
 * @param dataName Required. Name of dataset within setName to use to load element
 * @param actionType Required. Type of load action to perform on this element
 * @param parentElements Required. Array of parent web elements where all the child web elements are in
 * @param indexArr Required. The list of data indexes to load
 * @param loadIdentifier Optional. A name given to web elements to indicate that an element has been loaded
 * @return void
 */
function loadDataInParent(setName, currentElem, dataName, actionType, parentElements, indexArr, loadIdentifier){
	var path = currentElem[ELEM_PATH];
	var parents = currentElem[ELEM_PARENTS];
	var loadData = dataSet[setName][dataName];
	var len = parentElements.length;
	
	if((loadData instanceof Array) && indexArr.length != parentElements.length){// Array, but parent elements and index array lengths do not match
		len = indexArr.length < parentElements.length ? indexArr.length : parentElements.length;
	}
	
	for(var i = 0; i < len; i++){
		var loadElement = parentElements[i].find(path);// Look for the element to load
		if(loadElement.length < 1){
			loadElement = parentElements[i]; // Use the parent element if the child element cannot be found
		}
		var loadVal = (loadData instanceof Array) ? loadData[indexArr[i]] : loadData;
		
		loadDataIntoElem(loadElement, loadVal, actionType, currentElem[ELEM_NAME], loadIdentifier);
	}
}

/**
 * Generates indexes for the range of data to use
 * @param indexArr Required. The array of indexes to extract the range from. If null, indexes will be generated based on offset and count
 * @param offset Required. The offset of indexes to start generating. 
 * @param count Required. The number of indexes to generate.
 * @return Index array representing the range of data to use
 */
function getIndexRange(indexArr, offset, count){
	if(indexArr == null){
		indexArr = [];
		for(var i = offset; i < offset + count; i++){ // Generate consecutive numbers count number of times starting from offset
			indexArr.push(i);
		}
		return indexArr;
	} else {// Index array provided. Result will be a sub array of given array
		if(indexArr.length < (offset + count)){
			return indexArr.slice(offset, indexArr.length);
		} else {
			return indexArr.slice(offset, offset + count);
		}
	}
}

/**
 * Generates indexes of data that match specific conditions
 * @param indexArr Required. Array containing indexes of data array to filter from. If null, data will be filtered from the entire data array.
 * @param setName Required. Set name within data set where conditionDataName is under
 * @param conditionDataName Required. Name of data array where the condition will be checked against
 * @param conditionMatchFunc Required. The condition checking function
 * @param conditionArgs Required. An array of arguments required by conditionMatchFunc
 * @return Array of indexes where data within conditionDataName match the condition
 */
function getIndexSelective(indexArr, setName, conditionDataName, conditionMatchFunc, conditionArgs){
	var selectiveDataSet = dataSet[setName][conditionDataName];
	var funcArgs = [""];
	funcArgs.push(conditionArgs);
	var resultIndex = [];
	
	if(indexArr == null){
		var dataLen = selectiveDataSet.length;
		for(var i = 0; i < dataLen; i++){// Search the entire data set
			funcArgs[0] = selectiveDataSet[i];
			if(conditionMatchFunc.apply(this, funcArgs)){// Run the check
				resultIndex.push(i);// Push the data index if condition matches
			}
		}
	} else {
		var indexLen = indexArr.length;
		for(var i = 0; i < indexLen; i++){// Search within the data set specified by the indexes
			funcArgs[0] = selectiveDataSet[indexArr[i]];
			if(conditionMatchFunc.apply(this, funcArgs)){// Run the check
				resultIndex.push(indexArr[i]);// Push the data index if condition matches
			}
		}
		
	}
	return resultIndex;
}

/**
 * Generates indexes of sorted data
 * @param indexArr Required. Array containing indexes of data to sort. If null, sort the entire data array
 * @param setName Required. Set name within data set where sortDataName is under
 * @param sortDataName Required. Name of data array to sort
 * @param direction Required. Direction of the sort. Either DEF_SORT_DESC or DEF_SORT_ASC (default)
 * @return Array containing indexes representing the sorted data in sortDataName
 */
function getIndexSort(indexArr, setName, sortDataName, direction){
	var sortFunc;
	// Get the correct sort function
	if(direction == DEF_SORT_DESC){
		sortFunc = function(a, b) {
		    return ((a.data > b.data) ? -1 : ((a.data == b.data) ? 0 : 1));
		};
	} else {//Sort ascending by default
		sortFunc = function(a, b) {
		    return ((a.data < b.data) ? -1 : ((a.data == b.data) ? 0 : 1));
		};
	}
	
	var sortDataSet = dataSet[setName][sortDataName];
	var resultIndex = [];
	var tempList = [];
	
	// Push indexes to the array
	if(indexArr == null){
		for (var i in sortDataSet){
		    tempList.push({'data': sortDataSet[i], 'index': i});
		}
	} else {
		for(var i in indexArr){
			tempList.push({'data': sortDataSet[indexArr[i]], 'index': indexArr[i]});
		}
	}
	
	// Perform the sort
	tempList.sort(sortFunc);
	
	// Extract the index
	for (var i in tempList) {
	    resultIndex.push(tempList[i].index);
	}
	return resultIndex;
}
