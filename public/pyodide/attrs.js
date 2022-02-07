var Module=typeof globalThis.__pyodide_module!=="undefined"?globalThis.__pyodide_module:{};if(!Module.expectedDataFileDownloads){Module.expectedDataFileDownloads=0}Module.expectedDataFileDownloads++;(function(){var loadPackage=function(metadata){var PACKAGE_PATH="";if(typeof window==="object"){PACKAGE_PATH=window["encodeURIComponent"](window.location.pathname.toString().substring(0,window.location.pathname.toString().lastIndexOf("/"))+"/")}else if(typeof process==="undefined"&&typeof location!=="undefined"){PACKAGE_PATH=encodeURIComponent(location.pathname.toString().substring(0,location.pathname.toString().lastIndexOf("/"))+"/")}var PACKAGE_NAME="attrs.data";var REMOTE_PACKAGE_BASE="attrs.data";if(typeof Module["locateFilePackage"]==="function"&&!Module["locateFile"]){Module["locateFile"]=Module["locateFilePackage"];err("warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)")}var REMOTE_PACKAGE_NAME=Module["locateFile"]?Module["locateFile"](REMOTE_PACKAGE_BASE,""):REMOTE_PACKAGE_BASE;var REMOTE_PACKAGE_SIZE=metadata["remote_package_size"];var PACKAGE_UUID=metadata["package_uuid"];function fetchRemotePackage(packageName,packageSize,callback,errback){if(typeof process==="object"){require("fs").readFile(packageName,(function(err,contents){if(err){errback(err)}else{callback(contents.buffer)}}));return}var xhr=new XMLHttpRequest;xhr.open("GET",packageName,true);xhr.responseType="arraybuffer";xhr.onprogress=function(event){var url=packageName;var size=packageSize;if(event.total)size=event.total;if(event.loaded){if(!xhr.addedTotal){xhr.addedTotal=true;if(!Module.dataFileDownloads)Module.dataFileDownloads={};Module.dataFileDownloads[url]={loaded:event.loaded,total:size}}else{Module.dataFileDownloads[url].loaded=event.loaded}var total=0;var loaded=0;var num=0;for(var download in Module.dataFileDownloads){var data=Module.dataFileDownloads[download];total+=data.total;loaded+=data.loaded;num++}total=Math.ceil(total*Module.expectedDataFileDownloads/num);if(Module["setStatus"])Module["setStatus"]("Downloading data... ("+loaded+"/"+total+")")}else if(!Module.dataFileDownloads){if(Module["setStatus"])Module["setStatus"]("Downloading data...")}};xhr.onerror=function(event){throw new Error("NetworkError for: "+packageName)};xhr.onload=function(event){if(xhr.status==200||xhr.status==304||xhr.status==206||xhr.status==0&&xhr.response){var packageData=xhr.response;callback(packageData)}else{throw new Error(xhr.statusText+" : "+xhr.responseURL)}};xhr.send(null)}function handleError(error){console.error("package error:",error)}var fetchedCallback=null;var fetched=Module["getPreloadedPackage"]?Module["getPreloadedPackage"](REMOTE_PACKAGE_NAME,REMOTE_PACKAGE_SIZE):null;if(!fetched)fetchRemotePackage(REMOTE_PACKAGE_NAME,REMOTE_PACKAGE_SIZE,(function(data){if(fetchedCallback){fetchedCallback(data);fetchedCallback=null}else{fetched=data}}),handleError);function runWithFS(){function assert(check,msg){if(!check)throw msg+(new Error).stack}Module["FS_createPath"]("/","lib",true,true);Module["FS_createPath"]("/lib","python3.9",true,true);Module["FS_createPath"]("/lib/python3.9","site-packages",true,true);Module["FS_createPath"]("/lib/python3.9/site-packages","attr",true,true);Module["FS_createPath"]("/lib/python3.9/site-packages","attrs",true,true);Module["FS_createPath"]("/lib/python3.9/site-packages","attrs-21.4.0-py3.9.egg-info",true,true);function processPackageData(arrayBuffer){assert(arrayBuffer,"Loading data file failed.");assert(arrayBuffer instanceof ArrayBuffer,"bad input to processPackageData");var byteArray=new Uint8Array(arrayBuffer);var curr;var compressedData={data:null,cachedOffset:111541,cachedIndexes:[-1,-1],cachedChunks:[null,null],offsets:[0,1249,2285,3610,4658,5847,7059,8387,9649,10741,11485,12460,13322,14509,15929,17397,18839,20147,21322,22729,23905,25165,26451,27850,28966,30052,30994,32111,33298,34556,35664,36511,37500,38555,39887,41325,42689,44074,45566,47020,48445,49662,50675,51790,52902,54012,54931,55915,57098,58192,59391,60378,61548,62580,63149,63742,64725,66038,67336,68421,69581,70428,71648,72920,74276,75404,76727,77930,79041,80331,81435,82588,83806,84956,86163,87443,88644,89860,91015,91936,92958,94162,95442,96898,97440,97985,98544,99352,100517,101523,102642,103543,104621,105724,107261,108760,110298,111274],sizes:[1249,1036,1325,1048,1189,1212,1328,1262,1092,744,975,862,1187,1420,1468,1442,1308,1175,1407,1176,1260,1286,1399,1116,1086,942,1117,1187,1258,1108,847,989,1055,1332,1438,1364,1385,1492,1454,1425,1217,1013,1115,1112,1110,919,984,1183,1094,1199,987,1170,1032,569,593,983,1313,1298,1085,1160,847,1220,1272,1356,1128,1323,1203,1111,1290,1104,1153,1218,1150,1207,1280,1201,1216,1155,921,1022,1204,1280,1456,542,545,559,808,1165,1006,1119,901,1078,1103,1537,1499,1538,976,267],successes:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]};compressedData["data"]=byteArray;assert(typeof Module.LZ4==="object","LZ4 not present - was your app build with  -s LZ4=1  ?");Module.LZ4.loadPackage({metadata:metadata,compressedData:compressedData},true);Module["removeRunDependency"]("datafile_attrs.data")}Module["addRunDependency"]("datafile_attrs.data");if(!Module.preloadResults)Module.preloadResults={};Module.preloadResults[PACKAGE_NAME]={fromCache:false};if(fetched){processPackageData(fetched);fetched=null}else{fetchedCallback=processPackageData}}if(Module["calledRun"]){runWithFS()}else{if(!Module["preRun"])Module["preRun"]=[];Module["preRun"].push(runWithFS)}};loadPackage({files:[{filename:"/lib/python3.9/site-packages/attr/__init__.py",start:0,end:1667,audio:0},{filename:"/lib/python3.9/site-packages/attr/_cmp.py",start:1667,end:5832,audio:0},{filename:"/lib/python3.9/site-packages/attr/_compat.py",start:5832,end:14228,audio:0},{filename:"/lib/python3.9/site-packages/attr/_config.py",start:14228,end:15120,audio:0},{filename:"/lib/python3.9/site-packages/attr/_funcs.py",start:15120,end:29873,audio:0},{filename:"/lib/python3.9/site-packages/attr/_make.py",start:29873,end:132609,audio:0},{filename:"/lib/python3.9/site-packages/attr/_next_gen.py",start:132609,end:138361,audio:0},{filename:"/lib/python3.9/site-packages/attr/_version_info.py",start:138361,end:140555,audio:0},{filename:"/lib/python3.9/site-packages/attr/converters.py",start:140555,end:144633,audio:0},{filename:"/lib/python3.9/site-packages/attr/exceptions.py",start:144633,end:146614,audio:0},{filename:"/lib/python3.9/site-packages/attr/filters.py",start:146614,end:147738,audio:0},{filename:"/lib/python3.9/site-packages/attr/setters.py",start:147738,end:149204,audio:0},{filename:"/lib/python3.9/site-packages/attr/validators.py",start:149204,end:165170,audio:0},{filename:"/lib/python3.9/site-packages/attr/__init__.pyi",start:165170,end:180270,audio:0},{filename:"/lib/python3.9/site-packages/attr/_cmp.pyi",start:180270,end:180587,audio:0},{filename:"/lib/python3.9/site-packages/attr/_version_info.pyi",start:180587,end:180796,audio:0},{filename:"/lib/python3.9/site-packages/attr/converters.pyi",start:180796,end:181212,audio:0},{filename:"/lib/python3.9/site-packages/attr/exceptions.pyi",start:181212,end:181751,audio:0},{filename:"/lib/python3.9/site-packages/attr/filters.pyi",start:181751,end:181966,audio:0},{filename:"/lib/python3.9/site-packages/attr/py.typed",start:181966,end:181966,audio:0},{filename:"/lib/python3.9/site-packages/attr/setters.pyi",start:181966,end:182539,audio:0},{filename:"/lib/python3.9/site-packages/attr/validators.pyi",start:182539,end:184807,audio:0},{filename:"/lib/python3.9/site-packages/attrs/__init__.py",start:184807,end:185916,audio:0},{filename:"/lib/python3.9/site-packages/attrs/converters.py",start:185916,end:185986,audio:0},{filename:"/lib/python3.9/site-packages/attrs/exceptions.py",start:185986,end:186056,audio:0},{filename:"/lib/python3.9/site-packages/attrs/filters.py",start:186056,end:186123,audio:0},{filename:"/lib/python3.9/site-packages/attrs/setters.py",start:186123,end:186190,audio:0},{filename:"/lib/python3.9/site-packages/attrs/validators.py",start:186190,end:186260,audio:0},{filename:"/lib/python3.9/site-packages/attrs/__init__.pyi",start:186260,end:188242,audio:0},{filename:"/lib/python3.9/site-packages/attrs/py.typed",start:188242,end:188242,audio:0},{filename:"/lib/python3.9/site-packages/attrs-21.4.0-py3.9.egg-info/PKG-INFO",start:188242,end:196284,audio:0},{filename:"/lib/python3.9/site-packages/attrs-21.4.0-py3.9.egg-info/SOURCES.txt",start:196284,end:198562,audio:0},{filename:"/lib/python3.9/site-packages/attrs-21.4.0-py3.9.egg-info/dependency_links.txt",start:198562,end:198563,audio:0},{filename:"/lib/python3.9/site-packages/attrs-21.4.0-py3.9.egg-info/not-zip-safe",start:198563,end:198564,audio:0},{filename:"/lib/python3.9/site-packages/attrs-21.4.0-py3.9.egg-info/requires.txt",start:198564,end:199195,audio:0},{filename:"/lib/python3.9/site-packages/attrs-21.4.0-py3.9.egg-info/top_level.txt",start:199195,end:199206,audio:0}],remote_package_size:115637,package_uuid:"419cc620-7f0a-44f2-9c3b-56a042277f85"})})();