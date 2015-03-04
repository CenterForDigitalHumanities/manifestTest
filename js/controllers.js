
angular.module('msTestApp.controllers', []);

/*
 * Validate the string is a valid JSON object. 
 * @param {type} str
 * @returns {Boolean}
 */
var isJson = function (str) {
        var r = true;
        if(typeof str === "object"){
            console.log('str is an object');
            r = true;
        }
        else{
            try {
                JSON.parse(str);
                r=true;
            } 
            catch (e) {
               console.log('str could not be parsed: '+e);
               r = false;
            }
        }
        return r;
    };
                
    /*
     * Makes sure that a URL is valid.  Right now, CORS is preventing me from doing a full test for this.  We would like that it try to resolve
     * the URL and if successful, it is valid.  If not, it is invalid.  
     * @param url  The string URL.
     * @returns {Boolean}
     */
        var validURL = function(url) {
//                    var method = 'HEAD';
//                    var http = new XMLHttpRequest();
//                    http.open(method, url, true);
//                    http.send();
            if(url.indexOf('http://') < 0){
                return false;
            }
            else{
                return true;
            }
        };

/*
 * Controller to control getting manifest information and parsing through it.  This controller also controls the UI on the manifest testing page.
 *
 * @param  $scope  The classic angularJS scope
 * @param  FileUploadService The service controlling user file uploads.
 * @param  manifestDataService The service controlling functions on manifest data.
 * @param  manifestService The getters and setters for the manifest pieces.  
 */
msTestApp.controller("GetManifestFile", function($scope, FileUploadService, manifestDataService, manifestService)
            {    
                $scope.content={};
                $scope.newberryManifestObject = {}; 
                $scope.canvasParseObject = {};
                $scope.content.file = {};
                $scope.autoCheck = false;
                $scope.objectStatus = {"valid":false, "status":"Invalid Object"};
                //Pieces for hide/show of rows in the DOM.
                    //Manifest Metadata
                $scope.headerType = true;
                $scope.headerMetadata = true;
                $scope.headerLabel = true;
                $scope.headerFolios = true;
                    //end Manifest Metadata
                    //canvas Rows
                $scope.canvasType = true;
                $scope.canvasImages = true;
                $scope.canvasImageInfo = false; //Keeps the image portion hidden for a more concise first view.
                $scope.canvasLabel = true;
                    //end canvas rows
                    //canvas image rows
                $scope.canvasImagePiece = true;
                $scope.canvasParts = false; //keeps the canvas initially listed in a readable manner from which the user can expand.  
                $scope.canvasPiece = true;
                    //end canvas image orws
                //End pieces for show/hide 
                
                /*
                 * Toggle whether or not to parse the text area object automatically.
                 */
                $scope.toggleAutoCheck=function(){
                    var autoCheckBtn = document.getElementById("activateAutoChecking");
                    var checkBtn = document.getElementById("textAreaContent");
                    if(!$scope.autoCheck){
                        $scope.autoCheck = true;
                        checkBtn.setAttribute('disabled', true);
                        autoCheckBtn.setAttribute('value', 'Turn Off Live Checking');
                    }
                    else{
                        $scope.autoCheck = false;
                        checkBtn.removeAttribute('disabled', true);
                        autoCheckBtn.setAttribute('value', 'Turn On Live Checking');
                    }
                };
                
                /*
                 * Watch the textarea.  If there is a change that has a length and auto checking is active, then parse the text area content. 
                 * $scope.autoCheck is what allows the toggle, but the watcher is always there.  Is this best practice?
                 */
                $scope.$watch("content.input", function(newValue, oldValue) {
                    if ($scope.content.input !== undefined && $scope.content.input.length > 0 && $scope.autoCheck) {
                        $scope.getTextareaContent();
                    }
                  });

               
                /*
                 * Show all the warnings on the page.  Since there are no warnings right now, the buttons these functions are connected to 
                 * in manifestTest.html are commented out.  They just need to be uncommented and they are fully functional. See services.hs and directives.js to learn more. 
                 * 
                 * @param  evt  The event passed by angularJS
                 */
                $scope.showWarnings = function(evt){
                    var pageWarnings = document.getElementsByClassName('warning');
                    for(var i=0; i<pageWarnings.length; i++){
                        pageWarnings[i].style.display = 'inline';
                    }
                    document.getElementById('showWarnings').style.display = 'none';
                    document.getElementById('hideWarnings').style.display = 'inline';
                };
                
                /*
                 * Hide all the warnings on the page. Since there are no warnings right now, the buttons these functions are connected to 
                 * in manifestTest.html are commented out.  They just need to be uncommented and they are fully functional.  See services.hs and directives.js to learn more.
                 * @param  evt  The event passed by angularJS
                 */
                $scope.hideWarnings = function(evt){
                    var pageWarnings = document.getElementsByClassName('warning');
                    for(var i=0; i<pageWarnings.length; i++){
                         pageWarnings[i].style.display = 'none';
                     }
                    document.getElementById('showWarnings').style.display = 'inline';
                    document.getElementById('hideWarnings').style.display = 'none';
                };
                
                /*
                 * Show the image section of a canvas
                 * @param  evt  The event passed by angularJS
                 * @param  index  the index of the current canvas out of the canvas object
                 */
               
               /*
                * Gets the string object out of the text area for parsing.  This will set objects to the scope variables in the GetManifestFile controller.
                */
                $scope.getTextareaContent=function(){
                    if(isJson($scope.content.input)){
                        if(typeof $scope.content.input !== "object"){
                            $scope.content.object = JSON.parse($scope.content.input);
                        }
                        $scope.newberryManifestObject = manifestService.set($scope.content.object); //service changes this.
                        $scope.manifestMetadataObject = manifestService.setParseObject(manifestDataService.scanManifestData($scope.newberryManifestObject)); // This runs the get manifest, which means parseObject is changed up stream.  This is attatched to the service and does not need to be redefined in the scope.
                        $scope.canvasParseObject = manifestService.createParsedCanvasObject(manifestService.getCanvases($scope.newberryManifestObject));
                        $scope.objectStatus.status = 'Valid Object';
                        $scope.objectStatus.valid = true;
                    }
                    else{ 
                        $scope.content.object = {};
                        $scope.newberryManifestObject = manifestService.set($scope.content.object); //service changes this.
                        $scope.manifestMetadataObject = manifestService.setParseObject(manifestDataService.scanManifestData($scope.newberryManifestObject)); // This runs the get manifest, which means parseObject is changed up stream.  This is attatched to the service and does not need to be redefined in the scope.
                        $scope.canvasParseObject = manifestService.createParsedCanvasObject(manifestService.getCanvases($scope.newberryManifestObject));
                        $scope.objectStatus.status = 'Invalid Object';
                        $scope.objectStatus.valid = false;
                    }
                };
                
               /*
                * Takes the file content and puts it into the text area.  
                */
                $scope.putContentInTextarea = function () {
                    FileUploadService.readAsText($scope.content.file, $scope).then(function (result) {
                        $scope.content.input = result; //Populates the text area with the file data.
                    });
                };
                
                /*
                 * Verifies that the text from the text area is a valid JSON object.
                 * @param str  The string from the text area.  
                 * @returns r {Boolean} and a message that a user can view in the console as to why it is not JSON.
                 */
                

            });

/* IGNORE EVERYTHING BELOW HERE IT IS TRANSCRIPTION STUFF */
msTestApp.controller("TranscriptionController", function($scope, transcriptionService){   
    $scope.transcriptionObject = {
        "@context" : "http://www.shared-canvas.org/ns/context.json",
        "@id" : "http://t-pen.org/Tradamus+Simple/manifest.json",
        "@type" : "sc:Manifest",
        "label" : "Tradamus Simple",
        "sequences" : [ {
          "@id" : "http://t-pen.org/Tradamus+Simple/sequence/normal",
          "@type" : "sc:Sequence",
          "label" : "Current Page Order",
          "canvases" : [ {
            "@id" : "http://t-pen.org/Tradamus+Simple/canvas/100r",
            "@type" : "sc:Canvas",
            "label" : "100r",
            "height" : 1000,
            "width" : 667,
            "resources" : [ {
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@id" : "http://t-pen.org/TPEN/imageResize?folioNum=105420&height=1000",
                "@type" : "dctypes:Image",
                "format" : "image/jpeg",
                "height" : 2365,
                "width" : 1579
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100r"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083792",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "Infesto Trinitatis8"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100r#xywh=148,60,409,18"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083842",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "tralalalal lalaal alala"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100r#xywh=148,78,409,31"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083841",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "Alleluia benedict-"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100r#xywh=148,109,409,25"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083794",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "tralalalal lalaal alala"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100r#xywh=148,134,409,34"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083795",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "es domine deus patrii nostros et"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100r#xywh=148,168,409,27"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083796",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "tralalalal <temp>lalaal</temp> alala"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100r#xywh=148,195,409,34"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083840",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "laudabilis in leaila Alle-"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100r#xywh=148,229,409,28"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083797",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "tralalalal lalaal alala"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100r#xywh=148,257,409,36"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083798",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "luia <temp>ÐæȜð</temp> Diu niuinte are deiaulul"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100r#xywh=148,293,409,23"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083799",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "tralalalal lalaal alala"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100r#xywh=148,316,409,32"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083800",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "ape nota trinitas al-"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100r#xywh=148,348,409,29"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083801",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "tralalalal lalaal alala"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100r#xywh=148,377,409,34"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083802",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "uia tibi gloria et laus e"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100r#xywh=148,411,409,29"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083803",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "tralalalal lalaal alala"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100r#xywh=148,440,409,29"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083839",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "trua Benedictus sitirus"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100r#xywh=148,469,409,30"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083804",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "tralalalal lalaal alala"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100r#xywh=148,499,409,34"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083838",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "pater unigraitus quam te i"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100r#xywh=148,533,409,28"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083807",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "tralalalal lalaal alala"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100r#xywh=148,561,409,35"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083809",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "filius lauitus quo quam ipin"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100r#xywh=148,596,409,27"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083810",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "tralalalal lalaal alala"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100r#xywh=148,623,409,33"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083811",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "tus quia te at nobilauuuleri"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100r#xywh=148,656,409,36"
            } ]
          }, {
            "@id" : "http://t-pen.org/Tradamus+Simple/canvas/100v",
            "@type" : "sc:Canvas",
            "label" : "100v",
            "height" : 1000,
            "width" : 667,
            "resources" : [ {
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@id" : "http://t-pen.org/TPEN/imageResize?folioNum=105421&height=1000",
                "@type" : "dctypes:Image",
                "format" : "image/jpeg",
                "height" : 2365,
                "width" : 1579
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100v"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083814",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "<temp>Infesto Corporis Christi</temp>"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100v#xywh=104,61,401,45"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083877",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "tralalalal lalaal alala"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100v#xywh=104,106,401,27"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083816",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "midi alleluia Benediate all"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100v#xywh=104,133,401,30"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083817",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "tralalalal lalaal alala"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100v#xywh=104,163,401,37"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083878",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "celi et mia omnibus uiuentibus routite"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100v#xywh=104,200,401,26"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083818",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "tralalalal lalaal alala"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100v#xywh=104,226,401,42"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083879",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "uum e i qui a te at vobis tuum"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100v#xywh=104,268,401,23"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083880",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "tralalalal lalaal alala"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100v#xywh=104,291,401,26"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083822",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "le moridam tuam blah eos"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100v#xywh=104,317,401,27"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083823",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "tralalalal lalaal alala"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100v#xywh=104,344,401,44"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083881",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "<temp>silidun</temp> Alleulia"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100v#xywh=104,388,401,27"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083882",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "tralalalal lalaal alala"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100v#xywh=104,415,401,32"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083825",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "Lardo vica vere"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100v#xywh=104,447,401,29"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083883",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "tralalalal lalaal alala"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100v#xywh=104,476,401,27"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083884",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "est a bus et languis meus verr"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100v#xywh=104,503,401,23"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083827",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "tralalalal lalaal alala"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100v#xywh=104,526,401,37"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083885",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "est potus qui inaducat carue ine"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100v#xywh=104,563,401,25"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083828",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "tralalalal lalaal alala"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100v#xywh=104,588,401,39"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083886",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "am et bibitincum"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100v#xywh=104,627,401,27"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083887",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "tralalalal lalaal alala"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100v#xywh=104,654,401,30"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083830",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "languinem in me inauet et"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/100v#xywh=104,684,401,30"
            } ]
          }, {
            "@id" : "http://t-pen.org/Tradamus+Simple/canvas/101r",
            "@type" : "sc:Canvas",
            "label" : "101r",
            "height" : 1000,
            "width" : 667,
            "resources" : [ {
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@id" : "http://t-pen.org/TPEN/imageResize?folioNum=105422&height=1000",
                "@type" : "dctypes:Image",
                "format" : "image/jpeg",
                "height" : 2365,
                "width" : 1579
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/101r"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083851",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "In festo Corpous Christi"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/101r#xywh=151,27,410,46"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083924",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "tralalalal lalaal alala"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/101r#xywh=151,73,410,35"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083925",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "ego in eo Sacerdotes in ceilium"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/101r#xywh=151,108,410,28"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083927",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "tralalalal lalaal alala"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/101r#xywh=151,136,410,33"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083926",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "domini et panes offerunt deo et"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/101r#xywh=151,169,410,22"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083855",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "tralalalal lalaal alala"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/101r#xywh=151,191,410,37"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083928",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "ideo lauiti erunt deo cuo et no-"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/101r#xywh=151,228,410,23"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083858",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "tralalalal lalaal alala"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/101r#xywh=151,251,410,36"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083929",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "polluent uome cuis alleluia"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/101r#xywh=151,287,410,23"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083860",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "tralalalal lalaal alala"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/101r#xywh=151,310,410,46"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083861",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "Quoae laique inaducabitis pauce huic"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/101r#xywh=151,356,410,22"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083863",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "tralalalal lalaal alala"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/101r#xywh=151,378,410,28"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083930",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "et calicem bibetis mo?te <temp>domini</temp> annuabi"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/101r#xywh=151,406,410,29"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083865",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "<temp>tralalalal lalaal alala</temp>"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/101r#xywh=151,435,410,36"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083866",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "tralalalal lalaal alala"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/101r#xywh=151,471,410,23"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083867",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "tralalalal lalaal alala"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/101r#xywh=151,494,410,34"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083931",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "tralalalal lalaal alala"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/101r#xywh=151,528,410,29"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083868",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "tralalalal lalaal alala"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/101r#xywh=151,557,410,39"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083870",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "tralalalal lalaal alala"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/101r#xywh=151,596,410,23"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083871",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "tralalalal lalaal alala"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/101r#xywh=151,619,410,40"
            }, {
              "@id" : "http://t-pen.org/Tradamus+Simple/line/101083872",
              "@type" : "oa:Annotation",
              "motivation" : "sc:painting",
              "resource" : {
                "@type" : "cnt:ContentAsText",
                "cnt:chars" : "tralalalal lalaal alala"
              },
              "on" : "http://t-pen.org/Tradamus+Simple/canvas/101r#xywh=151,659,410,21"
            } ]
          } ]
        } ]
    };
    $scope.currentCanvas = 0;
    $scope.transcanvases = transcriptionService.setCanvases($scope.transcriptionObject);
    
    $scope.showNextCanvas = function(){
        var tempCanvas = $scope.currentCanvas + 1;
        console.log(document.getElementsByName('transcanvas_0')[0])
        if(document.getElementsByName('transcanvas_'+ tempCanvas).length === 1){
            document.getElementsByName('transcanvas_'+$scope.currentCanvas)[0].className="hidden";
            $scope.currentCanvas += 1;
            document.getElementsByName('transcanvas_'+ $scope.currentCanvas)[0].className = '';
        }
        else{
            //This canvas is not there...
        }
    };

    $scope.showPrevCanvas = function(){
        var tempCanvas = $scope.currentCanvas - 1;      
        if($scope.currentCanvas >0 && document.getElementsByName('transcanvas_'+ tempCanvas).length === 1){
          document.getElementsByName('transcanvas_'+ $scope.currentCanvas)[0].className = 'hidden';
          $scope.currentCanvas -= 1;
          document.getElementsByName('transcanvas_'+ $scope.currentCanvas)[0].className = '';
        }
        else{
            //This canvas is not there...
        }
    };
    
});