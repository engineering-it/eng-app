var chokidar = require('chokidar');
var fs = require('fs');
var path = require('path')

var startWatch = function(config) { 

	var debouncedWDI = debounce(config.watchingFn,250);
	
	var filePaths = [];
	
	var add = function(fp) {
		var idx = filePaths.indexOf(fp);
		if (idx===-1) {
			filePaths.push(fp);
			debouncedWDI(filePaths,config);
		}
	};
	
	var remove = function(fp) {
		var idx = filePaths.indexOf(fp);
		if (idx!==-1) {
			filePaths.splice(idx,1);
			debouncedWDI(filePaths,config);
		}
	};
	
	var watcher = chokidar.watch(config.path, {
	  ignored: /[\/\\]\./,
	  persistent: true
	})
	.on('add', function(path){ 
		add(path);
	})
	.on('unlink', function(path){ 
		remove(path);
	});
};


var writeDebugImports = function(paths,config) {
	
	var sortedPaths = sortNormalizePaths(paths,config.basePath);
	
	var code = [];
	addArray("scripts",sortedPaths,code);
	addFunction("writeScriptTag",writeScriptTag,code);
	addFunction("writeAllTags",writeAllTags,code);
	code.push("writeAllTags(scripts,document);");
	wrapCode(code);
	
	fs.writeFile(config.importScriptPath, code.join("\n"), function(err) {
	    if(err) {
	        return console.log(err);
	    }
	    console.log(config.importScriptPath,"updated!");
	}); 
};

var wrapCode = function(code) {
	code.unshift("(function(){");
	code.push("})();");
};

var sortNormalizePaths = function(paths,basePath) {
	var sortedPaths = [];
	
	paths.forEach(function(val){
		var normalized = "/eng-app-src/"+path.relative(basePath,val);
		normalized = normalized.replace(/\\/g,"/");
		if (normalized.endsWith("Module.js")) {
			sortedPaths.unshift(normalized);
		} else {
			sortedPaths.push(normalized);
		}
	});
	
	//sposta in testa engModule.js e aggiunge base64resources.js
	var idx = sortedPaths.indexOf("/eng-app-src/eng/engModule.js");
	sortedPaths.splice(idx,1);
	
	sortedPaths.unshift("/eng-app-build/base64resources.js");
	sortedPaths.unshift("/eng-app-src/eng/engModule.js");
	
	// aggiunge i templates
	//sortedPaths.push("/eng-app-build/templates-all-latest.js");
	
	return sortedPaths;
};

var addFunction = function(name,fn,code) {
	code.push("var "+name+"="+fn.toString()+";");
};

var addArray = function(name,array,code) {
	code.push("var scripts = [");
	array.forEach(function(val){
		code.push("'"+val+"',");
	});
	code.push("];")
};

var writeScriptTag = function(scriptPath,doc) {
	doc.write("<script type=\"text/javascript\" src=\"")
	doc.write(scriptPath);
	doc.write("\"></script>");
};

var writeAllTags = function(paths,doc) {
	paths.forEach(function(p){
		writeScriptTag(p,doc);
	});
};

var debounce = function(func,wait) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			func.apply(context, args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
};


module.exports =  {
	startWatch: startWatch,
	writeDebugJsImportsFn: writeDebugImports
};




