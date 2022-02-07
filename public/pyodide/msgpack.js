var Module=typeof globalThis.__pyodide_module!=="undefined"?globalThis.__pyodide_module:{};if(!Module.expectedDataFileDownloads){Module.expectedDataFileDownloads=0}Module.expectedDataFileDownloads++;(function(){var loadPackage=function(metadata){var PACKAGE_PATH="";if(typeof window==="object"){PACKAGE_PATH=window["encodeURIComponent"](window.location.pathname.toString().substring(0,window.location.pathname.toString().lastIndexOf("/"))+"/")}else if(typeof process==="undefined"&&typeof location!=="undefined"){PACKAGE_PATH=encodeURIComponent(location.pathname.toString().substring(0,location.pathname.toString().lastIndexOf("/"))+"/")}var PACKAGE_NAME="msgpack.data";var REMOTE_PACKAGE_BASE="msgpack.data";if(typeof Module["locateFilePackage"]==="function"&&!Module["locateFile"]){Module["locateFile"]=Module["locateFilePackage"];err("warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)")}var REMOTE_PACKAGE_NAME=Module["locateFile"]?Module["locateFile"](REMOTE_PACKAGE_BASE,""):REMOTE_PACKAGE_BASE;var REMOTE_PACKAGE_SIZE=metadata["remote_package_size"];var PACKAGE_UUID=metadata["package_uuid"];function fetchRemotePackage(packageName,packageSize,callback,errback){if(typeof process==="object"){require("fs").readFile(packageName,(function(err,contents){if(err){errback(err)}else{callback(contents.buffer)}}));return}var xhr=new XMLHttpRequest;xhr.open("GET",packageName,true);xhr.responseType="arraybuffer";xhr.onprogress=function(event){var url=packageName;var size=packageSize;if(event.total)size=event.total;if(event.loaded){if(!xhr.addedTotal){xhr.addedTotal=true;if(!Module.dataFileDownloads)Module.dataFileDownloads={};Module.dataFileDownloads[url]={loaded:event.loaded,total:size}}else{Module.dataFileDownloads[url].loaded=event.loaded}var total=0;var loaded=0;var num=0;for(var download in Module.dataFileDownloads){var data=Module.dataFileDownloads[download];total+=data.total;loaded+=data.loaded;num++}total=Math.ceil(total*Module.expectedDataFileDownloads/num);if(Module["setStatus"])Module["setStatus"]("Downloading data... ("+loaded+"/"+total+")")}else if(!Module.dataFileDownloads){if(Module["setStatus"])Module["setStatus"]("Downloading data...")}};xhr.onerror=function(event){throw new Error("NetworkError for: "+packageName)};xhr.onload=function(event){if(xhr.status==200||xhr.status==304||xhr.status==206||xhr.status==0&&xhr.response){var packageData=xhr.response;callback(packageData)}else{throw new Error(xhr.statusText+" : "+xhr.responseURL)}};xhr.send(null)}function handleError(error){console.error("package error:",error)}var fetchedCallback=null;var fetched=Module["getPreloadedPackage"]?Module["getPreloadedPackage"](REMOTE_PACKAGE_NAME,REMOTE_PACKAGE_SIZE):null;if(!fetched)fetchRemotePackage(REMOTE_PACKAGE_NAME,REMOTE_PACKAGE_SIZE,(function(data){if(fetchedCallback){fetchedCallback(data);fetchedCallback=null}else{fetched=data}}),handleError);function runWithFS(){function assert(check,msg){if(!check)throw msg+(new Error).stack}Module["FS_createPath"]("/","lib",true,true);Module["FS_createPath"]("/lib","python3.9",true,true);Module["FS_createPath"]("/lib/python3.9","site-packages",true,true);Module["FS_createPath"]("/lib/python3.9/site-packages","msgpack",true,true);Module["FS_createPath"]("/lib/python3.9/site-packages","msgpack-1.0.3-py3.9.egg-info",true,true);function processPackageData(arrayBuffer){assert(arrayBuffer,"Loading data file failed.");assert(arrayBuffer instanceof ArrayBuffer,"bad input to processPackageData");var byteArray=new Uint8Array(arrayBuffer);var curr;var compressedData={data:null,cachedOffset:92104,cachedIndexes:[-1,-1],cachedChunks:[null,null],offsets:[0,1222,2519,3590,4546,5802,7044,8223,9244,10330,11307,12337,13017,13852,14775,15927,17144,17948,18705,19549,20289,21239,22493,23680,24930,25969,27130,28348,29070,30191,31386,32296,33692,35156,36668,38006,39377,40650,41672,43024,44408,45658,46976,48605,50106,51496,52833,54097,55574,57210,58704,59777,61222,62558,64009,65325,66533,67975,69425,70595,72058,73557,75086,76576,78013,79259,80578,81665,82774,83789,84967,85891,86940,88285,89659,91027],sizes:[1222,1297,1071,956,1256,1242,1179,1021,1086,977,1030,680,835,923,1152,1217,804,757,844,740,950,1254,1187,1250,1039,1161,1218,722,1121,1195,910,1396,1464,1512,1338,1371,1273,1022,1352,1384,1250,1318,1629,1501,1390,1337,1264,1477,1636,1494,1073,1445,1336,1451,1316,1208,1442,1450,1170,1463,1499,1529,1490,1437,1246,1319,1087,1109,1015,1178,924,1049,1345,1374,1368,1077],successes:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]};compressedData["data"]=byteArray;assert(typeof Module.LZ4==="object","LZ4 not present - was your app build with  -s LZ4=1  ?");Module.LZ4.loadPackage({metadata:metadata,compressedData:compressedData},true);Module["removeRunDependency"]("datafile_msgpack.data")}Module["addRunDependency"]("datafile_msgpack.data");if(!Module.preloadResults)Module.preloadResults={};Module.preloadResults[PACKAGE_NAME]={fromCache:false};if(fetched){processPackageData(fetched);fetched=null}else{fetchedCallback=processPackageData}}if(Module["calledRun"]){runWithFS()}else{if(!Module["preRun"])Module["preRun"]=[];Module["preRun"].push(runWithFS)}};loadPackage({files:[{filename:"/lib/python3.9/site-packages/msgpack/__init__.py",start:0,end:1118,audio:0},{filename:"/lib/python3.9/site-packages/msgpack/_version.py",start:1118,end:1138,audio:0},{filename:"/lib/python3.9/site-packages/msgpack/exceptions.py",start:1138,end:2219,audio:0},{filename:"/lib/python3.9/site-packages/msgpack/ext.py",start:2219,end:8307,audio:0},{filename:"/lib/python3.9/site-packages/msgpack/fallback.py",start:8307,end:42782,audio:0},{filename:"/lib/python3.9/site-packages/msgpack/_cmsgpack.so",start:42782,end:145659,audio:0},{filename:"/lib/python3.9/site-packages/msgpack-1.0.3-py3.9.egg-info/PKG-INFO",start:145659,end:154384,audio:0},{filename:"/lib/python3.9/site-packages/msgpack-1.0.3-py3.9.egg-info/dependency_links.txt",start:154384,end:154385,audio:0},{filename:"/lib/python3.9/site-packages/msgpack-1.0.3-py3.9.egg-info/top_level.txt",start:154385,end:154393,audio:0},{filename:"/lib/python3.9/site-packages/msgpack-1.0.3-py3.9.egg-info/SOURCES.txt",start:154393,end:155253,audio:0}],remote_package_size:96200,package_uuid:"ee9fe759-bb15-44c1-b1c4-2e41e2ae00d4"})})();