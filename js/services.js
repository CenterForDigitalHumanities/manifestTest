
angular.module('msTestApp.services', []);

/*
 * This service holds the getters and setters for a manifest object
 * */
msTestApp.service('manifestService', function(){
            var theManifest = {};
                
            this.get = function(){
                return theManifest;
            };
            
            this.set = function(object){
                theManifest = object; 
                return theManifest;
            };
            
            var manifestMetadataObject = {};
            
            this.setParseObject = function(result){
                manifestMetadataObject = result;
                return manifestMetadataObject;
            };
            
            this.getParseObject = function(){
                return manifestMetadataObject;
            };
            
            
            /*
             * This function is used to get the canvases from a manifest object
             * @param obj The manifest object 
             * @return canvas An object only containing the canvases from the manifest object
             */
            this.getCanvases = function(obj){
                var canvases = [{"@type": "", "label":"", "metadata": "", "images": []}];
                if(obj.sequences){
                    if(obj.sequences[0].canvases){
                        canvases = angular.copy(obj.sequences[0].canvases);
                    }
                }
                return canvases;
            };
            
            /*
             * Take a canvas object and turn it into a parsed canvas object with the necessary templated information for each section and field.  
             * The angular.forEach approach assures that every field is read from the object
             * and accounted for.  The ones that are expected are addressed and unexpected fields are returned to the user in place but flagged.  Expected fields
             * that are incorrect are also flagged. 
             * @param obj  An object only containing the canvases from a manifest object.  
             * @see manifestCanvas.html 
             * @see manifestServices.getCanvases
             * @return A new object containing the parsed canvas object.  It is used in manifestCanvas.html. 
             */
            this.createParsedCanvasObject = function(obj){
                var objCopy = angular.copy(obj);
                var resultJSON = [];
                
                angular.forEach(objCopy, function(canvas, canvasIndex){ //specific to newberry manifest test.  It builds out the Review portion. 
                    resultJSON[canvasIndex] = {};
                    resultJSON[canvasIndex]['images'] = {"field":"images", "valid":false, "data":0, "message": "\u2716", "warning": false, label:"No Images!"}; //The holder in case the field is missing in the object.
                    var containsErrors = false;
                    var validImage = true; //Need to know whether the image is valid for each canvas, so it is defined here. 
                    angular.forEach(canvas, function(value1, key1){
                        switch(key1){ // parse through the canvas object.  Catch the image object on the iteration that has it to be parsed through later.
                            case "@type":
                                if (value1 === 'sc:Canvas' ) { 
                                    resultJSON[canvasIndex][key1] = {"field":key1, "valid":true, "data":value1, "message": "\u2713", "warning": false, label:"Type (sc:Canvas):"};
                                }
                                else{
                                    resultJSON[canvasIndex][key1] = {"field":key1, "valid":false, "data":value1, "message": "\u2716", "warning": false, label:"Type (sc:Canvas):"};
                                    containsErrors = true;
                                }
                                break;
                            case "label":
                                if (value1 !== '') { 
                                    resultJSON[canvasIndex][key1] = {"field":key1, "valid":true, "data":value1, "message": "\u2713", "warning": false, label:"Title:"};
                                }
                                else{
                                    resultJSON[canvasIndex][key1] = {"field":key1, "valid":false, "data":value1, "message": "\u2716", "warning": false, label:"Title:"};
                                    containsErrors = true;
                                }
                                break;
                            case "metadata":
                                if (value1 !== '' && validURL(value1)) { 
                                    resultJSON[canvasIndex][key1] = {"field":key1, "valid":true, "data":value1, "message": "\u2713", "warning": false, "label":"Metadata Source (Manifest):"};
                                }
                                else{
                                    resultJSON[canvasIndex][key1] = {"field":key1, "valid":false, "data":value1, "message": "\u2716 Make sure the URL is valid.", "warning": false, "label":"Metadata Source (Manifest):"};
                                    containsErrors = true;
                                }
                                break;
                            case "images":
                                var count = -1;
                                var manifestCanvasImagesObject = [];
                                angular.forEach(value1, function(value2, key2){ //Each Image...
                                    count += 1;
                                    manifestCanvasImagesObject[count] = {imageMetadata:{}, imageGuts:{}, valid:false, field:"images", label:"Canvas Image", warning: false};
                                    angular.forEach(value2, function(value3, key3){
                                        switch(key3){
                                            case "@type": 
                                                if(value3 === "oa:Annotation"){
                                                    manifestCanvasImagesObject[count].imageMetadata["imagesType"] = {"field":key3, "valid":true, "data":value3, "message": "\u2713", "warning": false, "label":"Images Type(sc:Canvas):"};
                                                }
                                                else{
                                                    manifestCanvasImagesObject[count].imageMetadata["imagesType"] = {"field":key3, "valid":false, "data":value3, "message": "\u2716", "warning": false, "label":"Images Type(sc:Canvas):"};
                                                    containsErrors = true;
                                                    validImage = false;
                                                }
                                                break;
                                            case "motivation":
                                                if(value3 === "sc:Painting"){
                                                    manifestCanvasImagesObject[count].imageMetadata[key3] = {"field":key3, "valid":true, "data":value3, "message": "\u2713", "warning": false, "label":"Motivation (sc:Painting):"};
                                                }
                                                else{
                                                    manifestCanvasImagesObject[count].imageMetadata[key3] = {"field":key3, "valid":false, "data":value3, "message": "\u2716", "warning": false, "label":"Motivation (sc:Painting):"};
                                                    containsErrors = true;
                                                    validImage = false;
                                                }
                                                break;
                                            case "resource":
                                                if(Object.keys(value3).length > 0){
                                                    manifestCanvasImagesObject[count].imageMetadata["imageResources"] = {"field":"imageResources", "valid":true, "data":Object.keys(value3).length, "message": "\u2713", "warning": false, "label":"Image Resources:"};
                                                }
                                                else{
                                                    manifestCanvasImagesObject[count].imageMetadata["imageResources"] = {"field":"imageResources", "valid":false, "data":0, "message": "\u2716.  This field is missing.", "warning": false, "label":"Image Resources:"};
                                                    containsErrors = true;
                                                    validImage = false;
                                                }
                                                break;
                                            default:
                                                manifestCanvasImagesObject[count].imageMetadata[key3] = {"field":key3, "valid":true, "data":value3, "message": "\u2713", "warning": false, "label":"Unexpected Field "+key3+":"};
                                                containsErrors = true;
                                                validImage = false;
                                        }
                                        
                                        /* A self criticism:  You should define these at the beginning of the function in their undefined form and change them as they
                                         * are populated
                                         *  */
                                        if (canvas.images[count]['@type'] === undefined) {
                                            validImage = false;
                                            manifestCanvasImagesObject[count].imageMetadata["@type"] = {"field":"@type", "valid":false, "data":"", "message": "\u2716", "warning": false, label:"Type (dctypes: Image):"};
                                            containsErrors = true;
                                        }
                                        if (canvas.images[count].motivation === undefined) {
                                            validImage = false;
                                            manifestCanvasImagesObject[count].imageMetadata.motivation = {"field":"motivation", "valid":false, "data":"", "message": "\u2716", "warning": false, "label":"Images Motivation: "};
                                            containsErrors = true;
                                        }
                                        if (canvas.images[count].resource === undefined) {
                                            validImage = false;
                                            manifestCanvasImagesObject[count].imageMetadata.imageResources = {"field":"imageResources", "valid":false, "data":0, "message": "\u2716.  No Image Resources.", "warning": false, "label":"Image Resources:"};
                                            containsErrors = true;
                                        }
                                        
                                    });

                                    angular.forEach(value2.resource, function(value4, key4){
                                        
                                        switch(key4){
                                            case "@id":
                                                if(value4 !== "" && validURL(value4)){
                                                    manifestCanvasImagesObject[count].imageGuts["@id"] = {"field":key4, "valid":true, "data":value4, "message": "\u2713", "warning": false, "label":"Image Source:"};
                                                }
                                                else{
                                                    manifestCanvasImagesObject[count].imageGuts["@id"] = {"field":key4, "valid":false, "data":value4, "message": "\u2716.  Make sure URL is valid.", "warning": false, "label":"Image Source:"};
                                                    containsErrors = true;
                                                    validImage = false;
                                                }
                                                break;
                                            case "@type": 
                                                if(value4 === "dctypes:Image"){
                                                    manifestCanvasImagesObject[count].imageGuts["imageType"] = {"field":key4, "valid":true, "data":value4, "message": "\u2713", "warning": false, "label":"Image Type(dctypes:Image):"};
                                                    
                                                }
                                                else{
                                                    manifestCanvasImagesObject[count].imageGuts["imageType"] = {"field":key4, "valid":false, "data":value4, "message": "\u2716", "warning": false, "label":"Image Type(dctypes:Image):"};
                                                    containsErrors = true;
                                                    validImage = false;
                                                }
                                                break;
                                            case "format": //You could force that this object be of a certain file type to pass the test here.  
                                                if(value4 !== ""){
                                                    manifestCanvasImagesObject[count].imageGuts.format = {"field":key4, "valid":true, "data":value4, "message": "\u2713", "warning": false, "label":"Image Format:"};
                                                }
                                                else{
                                                    manifestCanvasImagesObject[count].imageGuts.format = {"field":key4, "valid":false, "data":"", "message": "\u2716", "warning": false, "label":"Image Format:"};
                                                    containsErrors = true;
                                                    validImage = false;
                                                }
                                                break;
                                             case "height":  
                                                if(value4 !== ""){
                                                    manifestCanvasImagesObject[count].imageGuts.height = {"field":key4, "valid":true, "data":value4, "message": "\u2713", "warning": false, "label":"Image Height:"};
                                                }
                                                else{
                                                    manifestCanvasImagesObject[count].imageGuts.height = {"field":key4, "valid":false, "data":"", "message": "\u2716", "warning": false, "label":"Image Height:"};
                                                    containsErrors = true;
                                                    validImage = false;
                                                }
                                                break;
                                             case "width":
                                                if(value4 !== ""){
                                                    manifestCanvasImagesObject[count].imageGuts.width = {"field":key4, "valid":true, "data":value4, "message": "\u2713", "warning": false, "label":"Image Width:"};
                                                }
                                                else{
                                                    manifestCanvasImagesObject[count].imageGuts.width = {"field":key4, "valid":false, "data":"", "message": "\u2716", "warning": false, "label":"Image Width:"};
                                                    containsErrors = true;
                                                    validImage = false;
                                                }
                                                break;
                                            default:
                                                manifestCanvasImagesObject[count].imageGuts[key4] = {"field":key4, "valid":false, "data":value4, "message": "\u2716", "warning": false, "label":"Unexpected Field "+key4+":"};
                                                containsErrors = true;
                                                validImage = false;

                                        }
                                        
                                    });
                                });
                                
                                /* A self criticism:  You should define these at the beginning of the function in their undefined form and change them as they
                                         * are populated
                                *  */
                                if(count === -1){ //There is no image object, therefore no images.
                                    resultJSON[canvasIndex]['images'] = {valid:false, label:"No Canvas Images", message:"\u2716", data:0, imagesData:""};
                                }
                                else{ //There is an image object, are the fields correct? 
                                    if(canvas.images !== undefined && canvas.images[count] !== undefined && canvas.images[count].resource !== undefined){
                                        if (canvas.images[count].resource['@type'] === undefined) { 
                                            manifestCanvasImagesObject[count].imageGuts["@type"] = {"field":"@type", "valid":false, "data":"", "message": "\u2716", "warning": false, label:"Type (dctypes: Image):"};
                                            containsErrors = true;
                                            validImage = false;
                                        }
                                        if (canvas.images[count].resource['@id'] === undefined) {
                                            manifestCanvasImagesObject[count].imageGuts['@id'] = {"field":"@id", "valid":false, "data":"", "message": "\u2716", "warning": false, "label":"Image URL: "};
                                            containsErrors = true;
                                            validImage = false;
                                        }
                                        if (canvas.images[count].resource.format === undefined) { 
                                            manifestCanvasImagesObject[count].imageGuts.format = {"field":"format", "valid":false, "data":"", "message": "\u2716", "warning": false, label:"Image Format:"};
                                            containsErrors = true;
                                            validImage = false;
                                        }
                                        if (canvas.images[count].resource.height === undefined) {
                                            manifestCanvasImagesObject[count].imageGuts.height = {"field":"height", "valid":false, "data":"", "message": "\u2716", "warning": false, "label":"Image Height:"};
                                            containsErrors = true;
                                            validImage = false;
                                        }
                                        if (canvas.images[count].resource.width === undefined) {
                                            manifestCanvasImagesObject[count].imageGuts.width = {"field":"width", "valid":false, "data":"", "message": "\u2716", "warning": false, "label":"Image Width:"};
                                            containsErrors = true;
                                            validImage = false;
                                        }
                                        resultJSON[canvasIndex]['images'] = {valid:validImage, label:"Canvas Images", message:"\u2713", data:manifestCanvasImagesObject.length, imagesData:manifestCanvasImagesObject };
                                    }
                                }
                                break;
                            default:
                                resultJSON[canvasIndex][key1]={"field":key1, "valid":false, "data":value1, "message":"", "warning": true, label:'Unexpected Field "'+key1+'":'};
                                containsErrors = true;
                        }
                        //console.log(containsErrors); //unused but this may still be useful.  You can log this out to yourself and it will tell you if there was any spot that an error was found.
                        //resultJSON[canvasIndex].valid = !containsErrors; //Cannot do because we have to go through each field in the canvas and this one causes an extra row. 
                        
                    });
                    
                });
                return resultJSON;
            };
            
                        
        });
        
        /*
         * This service has the functions for parsing through manifest and canvas data. 
         */
    
        msTestApp.service('manifestDataService', function() { 
            
            /* IGNORE FOR NOW
            * A checker for errors that is not necessairly specific to newberry.  This just tests the manifest structure and does not dive into the canvas structure.
            * That is in another service function.  This will return the quick errors at the top that it finds with the manifest.  You can opt to go into review and see it
            * pieced together with the errors.  
            * This piece is built but I have not brought this to life yet on the page.  I am not sure we are going to use it.  
            */
//            this.getQuickErrors = function(obj){
//                var parsedManifestErrors = [];
//                var objCopy = angular.copy(obj);
//                angular.forEach(objCopy, function(value, key){ 
//                    switch(key){
//                        case "metadata":
//                            var typeCorrect = false;
//                            var urlValid = false;
//                            var message = "";
//                            if(angular.isString(value)){
//                                typeCorrect = true;
//                                message += "The type is correct. ";
//                                if(this.validURL(value)){
//                                    urlValid = true;
//                                    message += "The URL is valid.";
//                                }
//                                else{
//                                    message += "The URL has errors.";
//                                }
//                                urlValid = this.validURL(value);
//                            }
//                            else{
//                                message = "The entry for this field is incorrect. ";
//                            }
//                            
//                            if(!typeCorrect || !urlValid){
//                                parsedManifestErrors.append({"field":key, "data:":value, "typeCorrect":typeCorrect, "urlValid":urlValid, "message":message});
//                            }
//                            break;
//                        case "label":
//                            var typeCorrect = false;
//                            var message = "";
//                            if(angular.isString(value)){
//                                typeCorrect = true;
//                                message += "The type is correct. ";
//                            }
//                            else{
//                                message = "The entry for this field is incorrect. ";
//                            }
//                            if(!typeCorrect){
//                                parsedManifestErrors.append({"field":key, "data:":value, "typeCorrect":typeCorrect, "urlValid":"NA", "message":message});
//                            }
//                            break;
//                        case "@type":
//                           var typeCorrect = false;
//                            var message = "";
//                            if(angular.isString(value)){
//                                typeCorrect = true;
//                                message += "The type is correct. ";
//                            }
//                            else{
//                                message = "The entry for this field is incorrect. ";
//                            }
//                            if(!typeCorrect){
//                                parsedManifestErrors.append({"field":"@type", "data:":value, "typeCorrect":typeCorrect, "urlValid":"NA", "message":message});
//                            }
//                            break;
//                        default:
//                            var message = "This field was not expected for this object!";
//                            parsedManifestErrors.append({"field":key, "data:":value, "typeCorrect":typeCorrect, "urlValid":this.validURL(value), "message":message});
//                    }
//                    return parsedManifestErrors;
//                });
//            };
            
            /*
             * Go through each field of manifest data and test for its existence/validity.  Since I have not figured out anything good to include for warnings,
             * I have commented out the spots to set them.  The comments explain how to create them and where to create them if that becomes a desire as things we
             * feel are warnings come up. See directives.hs, controllers.js, and manifestTest.html to learn about the full intended functionality of warnings in the future. 
             * 
             * @param obj The manifest object. 
             * @returns resultJSON An object holding whether or not the field was valid paired with a message to display for use in the manifestheader directive 
             * in directives.js 
             */
            this.scanManifestData = function(obj){ //test object is already an object.
                var objCopy = angular.copy(obj);
                var resultJSON = {};
                /*
             * We would like that this test if the URL resolves to check if it is valid, but CORS is preventing me from doing real tests on it.
             * @param {type} url
             * @returns {Boolean}
             */
                
                //Set the "View As Review" data.  Specific to newberry manifest.  
                angular.forEach(objCopy, function(value, key){ //specific to newberry manifest test.  It builds out the Review portion.  
                    switch(key){
                        case "@type":
                            if (value === 'sc:Manifest' ) { 
                                resultJSON[key] = {"field":key, "valid":true, "data":value, "message": "\u2713", "warning": false, label:"Type (sc:Manifest):"};
                            }
                            else{
                                resultJSON[key] = {"field":key, "valid":false, "data":value, "message": "\u2716", "warning": false, label:"Type (sc:Manifest):"};
                            }
                            break;
                        case "label":
                            if (value !== '') { 
                                resultJSON[key] = {"field":key, "valid":true, "data":value, "message": "\u2713", "warning": false, label:"Title:"};
                            }
                            else{
                                resultJSON[key] = {"field":key, "valid":false, "data":value, "message": "\u2716", "warning": false, label:"Title:"};
                            }
                            break;
                        case "metadata":
                            if (value !== '') { 
                                resultJSON[key] = {"field":key, "valid":true, "data":value, "message": "\u2713 Make sure the URL is valid.", "warning": false, "label":"Metadata Source (Manifest):"};
                            }
                            else{
                                resultJSON[key] = {"field":key, "valid":false, "data":value, "message": "\u2716 Make sure the URL is valid.", "warning": false, "label":"Metadata Source (Manifest):"};
                            }
                            break;
                        case "sequences":
                            if(value[0].canvases.length === 0){
                                resultJSON[key] = {"field":key, "valid":false, "data":0, "message": "\u2716", "warning": false, "label": "Canvases (Folios)"};
                            } 
                            else{
                                resultJSON[key] = {"field":key, "valid":true, "data":objCopy[key][0].canvases.length, "message": "\u2713", "warning": false, "label": "Canvases (Folios)"};
                            }
                            break;
                        default:
                            resultJSON[key]={"field":key, "valid":false, "data":value, "message":"", "warning": true, label:'Unexpected Field "'+key+'":'};
                    }
                });
                
                /*
                 * Since the for each cannot account for NOT finding an EXPECTED value, it needs to check for undefined separately.  It will then add the appropriate
                 * object into the result object array.  
                 */
                if (objCopy['@type'] === undefined) { 
                    resultJSON["@type"] = {"field":"@type", "valid":false, "data":"", "message": "\u2716", "warning": false, label:"Type (sc:Manifest):"};
                }
                if (objCopy.sequences === undefined) {
                    resultJSON.sequences = {"field":"sequences", "valid":false, "data":0, "message": "\u2716", "warning": false, "label": "Canvases (Folios):"};
                }
                if (objCopy.label === undefined) {
                    resultJSON.label = {"field":"label", "valid":false, "data":"", "message": "\u2716", "warning": false, "label":"Title:"};
                }
                if (objCopy.metadata === undefined) {
                    resultJSON.metadata = {"field":"metadata", "valid":false, "data":"", "message": "\u2716 Make sure the URL is valid.", "warning": false, "label":"Metadata Source (Manifest):"};
                }
                return resultJSON;
            };
        });
        
        /* IGNORE EVERYTHING BELOW THIS LINE */

        msTestApp.service('FileUploadService', function (FileReader) {
            angular.extend(this, FileReader);
            this.isSupported = function () {
                return window.File && window.FileReader;
            };
        });

        msTestApp.service('FileReader', function ($q) {
            var onLoad = function (reader, deferred, scope) {
            return function () {
                scope.$apply(function () {
                    deferred.resolve(reader.result);
                });
            };
        };

        var onError = function (reader, deferred, scope) {
            return function () {
                scope.$apply(function () {
                    deferred.reject(reader.result);
                });
            };
        };

        var onProgress = function (reader, scope) {
            return function (event) {
                scope.$broadcast("fileProgress",
                    {
                        total: event.total,
                        loaded: event.loaded
                    });
            };
        };

        var getReader = function (deferred, scope) {
            var reader = new FileReader();
            reader.onload = onLoad(reader, deferred, scope);
            reader.onerror = onError(reader, deferred, scope);
            reader.onprogress = onProgress(reader, scope);
            return reader;
        };

        var readAsText = function (file, scope) {
            var deferred = $q.defer();
            var reader = getReader(deferred, scope);
            reader.readAsText(file);
            return deferred.promise;
        };

        var readAsDataURL = function (file, scope) {
            var deferred = $q.defer();
            var reader = getReader(deferred, scope);
            reader.readAsDataURL(file);
            return deferred.promise;
        };

        return {
            readAsDataUrl: readAsDataURL,
            readAsText: readAsText
        };
    });

/*
 * The service to support TranscriptionController.
 */
msTestApp.service('transcriptionService', function(){
        var canvases = [];
        
        /*
         * Get the object containing the canvases.
         * @param object The transcription manifest object. 
         * @return Returns an array of canvas objects or an empty array.  
         */
        this.setCanvases = function(object){
            if(object.sequences[0].canvases !== undefined && object.sequences[0].canvases.length > 0){
                canvases = object.sequences[0].canvases;
            }
            else{
              canvases = [];
            }
            return canvases;
        };

        this.getCanvases = function(){
            return canvases;
        };
        
        /*
         * This function is given the URL from a transcription canvas so that the X, Y, W, and H can be extracted and returned to the controller
         * with real values.  This is used to set the lineX, lineY, lineHeight, lineWidth attributes in the transcribe directive.
         * 
         * @see diretives.js    ->   The transcribe directive. 
         * @param {str} lineURL
         * @returns {Array} An array containing X, Y, W, H (in that order) so that the numbers can be used as attributes.
         */
        this.XYWH = function(lineURL){
            var x = -1;
            var y = -1;
            var w = -1;
            var h = -1;
            var XYWHarray = [x,y,w,h];
            if(lineURL.indexOf('#') > -1){ //string must contain this to be valid
                var XYWHsubstring = lineURL.substring(lineURL.lastIndexOf('#' + 1)); //xywh = 'x,y,w,h'
                if(XYWHsubstring.indexOf('=') > -1){ //string must contain this to be valid
                    var numberArray = XYWHsubstring.substring(lineURL.lastIndexOf('xywh=' + 1)).split(',');
                    if(numberArray.length === 4){ // string must have all 4 to be valid
                        x = numberArray[0];
                        y = numberArray[1];
                        w = numberArray[2];
                        h = numberArray[3];
                        XYWHarray = [x,y,w,h];
                    }
                }
            }
            return XYWHarray;
        };
});

                
    /**
   * Organizes the screen when a new line is focused on.
   * Tests if adjustment is needed before running.
   *
   * @see setPositions()
   * @see updateCaptions()
   * @see swapTranscriptlet()
   */
//  updatePresentation: function(object) {
//    focusItem[0] = focusItem[1];
//    focusItem[1] = object;
//    if ((focusItem[0] === null) || (focusItem[0].attr("id") !== focusItem[1].attr("id"))) {
//      this.adjustImgs(this.setPositions());
//      this.swapTranscriptlet();
//      this.updateCaptions();
//      //show previous line transcription
//      $('#captions').animate({
//        opacity: 1
//      }, 100);
//    } else {
//      this.adjustImgs(this.setPositions());
//      //this.maintainWorkspace();
//    }
//    //prevent textareas from going invisible and not moving out of the workspace
//    focusItem[1].removeClass("transcriptletBefore transcriptletAfter");
////        if(document.activeElement.id === "transcriptionPage"){
////            // nothing is focused on somehow
////            focusItem[1].find('.theText')[0].focus();
////        }
//  },

//  /**
//   * Removes previous textarea and slides in the new focus.
//   *
//   * @see updatePresentation()
//   */
//  swapTranscriptlet: function() {
//    //focusItem[0].addClass("transcriptletBefore").removeClass('noTransition');
//    // slide in the new transcriptlet
//    focusItem[1].css({"width": "auto", "z-index": "5"});
//    focusItem[1].removeClass("transcriptletBefore transcriptletAfter");
//    focusItem[1].prevAll(".transcriptlet").addClass("transcriptletBefore").removeClass("transcriptletAfter");
//    focusItem[1].nextAll(".transcriptlet").addClass("transcriptletAfter").removeClass("transcriptletBefore");
//    console.log($('.transcriptletAfter').length, $('.transcriptletBefore').length);
//    if($('.transcriptletAfter').length == 0){
//        $('#nextTranscriptlet').hide();
//    }
//    else{
//        $('#nextTranscriptlet').show();
//    }
//    if($('.transcriptletBefore').length == 0){
//        $('#previousTranscriptlet').hide();
//    }
//    else{
//         $('#previousTranscriptlet').show();
//    }
//  },
//  /**
//   * Aligns images and workspace using defined dimensions.
//   *
//   * @see maintainWorkspace()
//   */
//  adjustImgs: function(positions) {
//    //move background images above and below the workspace
//    $("#imgTop").animate({
//      "height": positions.imgTopHeight + "%"
//    },250)
//    .find("img").animate({
//      top: positions.topImgPosition + "%",
//      left: "0px"
//    },250);
//    positions.bookmarkLeft = $(focusItem[1]).attr('lineLeft');
//    positions.bookmarkWidth = $(focusItem[1]).attr('lineWidth');
//    $('#bookmark').animate({
//      left: positions.bookmarkLeft + "%",
//      top: positions.bookmarkTop + "%",
//      height: positions.bookmarkHeight + "%",
//      width: positions.bookmarkWidth + "%"
//    },350);
//    $("#imgBottom").find("img").animate({
//      top: positions.bottomImgPosition + "%",
//      left: "0px"
//    },250);
//  },
//  /**
//   * Shows previous line of transcription above current textarea.
//   *
//   * @see updatePresentation()
//   */
//  updateCaptions: function() {
//    if (focusItem[1].prev().hasClass('transcriptlet')) {
//      $prevLine = focusItem[1].prev().find('textarea').val();
//    } else {
//      $prevLine = "Top of Assignment";
//    }
//    $('#captions').text($prevLine);
//  },
//
//    nextTranscriptlet: function() {
//        var nextID = parseFloat(focusItem[1].attr('lineID')) + 1;
//        transcription.updatePresentation($('#transcriptlet_'+nextID));
//  },
//
//  previousTranscriptlet: function() {
//        var prevID = parseFloat(focusItem[1].attr('lineID')) - 1;
//        transcription.updatePresentation($('#transcriptlet_'+prevID));
//  }
//};

//setPositions: function() {
//    //Determine size of section above workspace
//    if (focusItem[1].attr("lineHeight") !== null) {
//      var bookmarkPadding = 0;
//      var currentLineHeight = parseFloat(focusItem[1].attr("lineHeight"));
//      var currentLineTop = parseFloat(focusItem[1].attr("lineTop"));
//      var imageHeight = $('#transcriptionCanvas').height();
//      // top of column
//      var previousLine = (focusItem[1].prev().is('.transcriptlet') && (currentLineTop > parseFloat(focusItem[1].prev().attr("lineTop")))) ? parseFloat(focusItem[1].prev().attr("lineHeight")) : parseFloat(focusItem[1].attr("lineTop"));
//      // oversized for screen
//      var imgTopHeight = (previousLine + currentLineHeight)+1.5; // obscure behind workspace. TODO
//      // topImgPosition, bookmarkTop - other bookmark dimensions stored in hidden inputs
//      var topImgPosition = ((previousLine - currentLineTop)*100)/imgTopHeight;
////      var bookmarkTop = ((previousLine/imgTopHeight)*100 - bookmarkPadding);
//      var bookmarkTop = (currentLineTop + (((imgTopHeight)/100)*topImgPosition)); //+ (topImgPosition*imgTopHeight)/ imageHeight)
// //     var bookmarkHeight = (currentLineHeight/(imgTopHeight)*100 + 2 * bookmarkPadding);
//      // bottomImgPosition
//      var bottomImgPosition = -(currentLineTop + currentLineHeight);
//    }
//    var positions = {
//      imgTopHeight: imgTopHeight,
//      topImgPosition: topImgPosition,
//      bottomImgPosition: bottomImgPosition,
//      bookmarkTop: bookmarkTop,
//      bookmarkHeight: currentLineHeight
//    };
//    return positions;
//  },

            
