var express = require('express');
var wuis = require('./watchUpdateAssets.js')


/**
 * Script per lanciare un server web per lo sviluppo
 * Cambiare i percorsi alle cartelle del workspace!
 */

var app = express();

var port = 3000;
var workspacePath = 'C:\\workspaces\\workspaceEngAppProva';
var engAppPath = workspacePath+'\\eng-app';
var icuPath = workspacePath+'\\icu-ui';
var hnetPath = workspacePath+'\\hnet-ui';

app.use('/eng-app-src', express.static(engAppPath+'\\src'));
app.use('/eng-app-build', express.static(engAppPath+'\\build'));
app.use('/eng-app-libs', express.static(engAppPath+'\\libs'));
app.use('/icu-ui', express.static(icuPath+'\\www'));
app.use('/hnet-ui', express.static(hnetPath+'\\www'));

app.listen(port);

wuis.startWatch({
	path: engAppPath+'\\src\\**\\*.js',
	basePath: engAppPath+'\\src',
	watchingFn: wuis.writeDebugJsImportsFn,
	importScriptPath: engAppPath+'\\build\\devImports.js'
});
/*
wuis.startWatch({
	path: engAppPath+'\\src\\**\\*.html',
	basePath: engAppPath+'\\src',
	//watchingFn: wuis.writeTemplates
});
*/



console.log("Dev server running on port ",port," ... (Ctrl-C to stop) ...");
