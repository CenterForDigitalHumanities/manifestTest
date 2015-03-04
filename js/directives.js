    /*
     * These templates include the areas where a warning could pop up, but none are ever set so they are not used and are left to look generic so that if one
     * plans to be implemented it can.  That is why you see it in the code but never see it on screen.  See servicesjs, controllers.js, and manifestTest.html to see 
     * the full intended functionality of warnings for the future.  
     */
       
    angular.module('msTestApp.directives', []);
     

    /*
     * Used for making a file input template.  It accounts for what to do on change and how to get the 
     * information for parsing.  Using <input file-input="content.file" on-change="putContentInTextarea()" /> will grab this directive and apply the change
     * function to it.  When the file upload happens, it will populate the textarea.  
     */
    msTestApp.directive('fileInput',function ($parse) {
        return {
            restrict: "EA",
            template: "<input type='file' />",
            replace: true,
            link: function (scope, element, attrs) { //link element with its attributes to the scope
                var modelGet = $parse(attrs.fileInput); //content to get
                var modelSet = modelGet.assign; //assign model to this variable
                var onChange = $parse(attrs.onChange); //change function to call

                var updateModel = function () {
                    scope.$apply(function () {
                        modelSet(scope, element[0].files[0]); // Assign the elements file content to the fileInput variable.  
                        onChange(scope); // call the change function using the scope.  
                    });
                };
                element.bind('change', updateModel); //bind the change to the model
            }
        };
    });
    
    /*
     * The html will call ng-repeat over the object containing the canvas.  For each canvas, it will put the call in for this directive template to build out the canvas.
     * Should the ng-repeat functionality be moved into here somehow?  
     */
    //This could be a partial or created in another html file and include via templateURL instead of template

    msTestApp.directive('manifestcanvas', function(){
        return {
            restrict: "EA",
            templateUrl: "manifestCanvas.html",
            replace: true
        };
    });
    
    
    
    msTestApp.directive('metadatarow', function(){
        return {
                restrict: "EA",
                replace: true,
                template:'<tr>\n\
                        <td class="toggleTools">\n\
                            <span class="showField" ng-click="headerMetadata = true;"> + </span>\n\
                            <span class="hideField" ng-click="headerMetadata = false;"> - </span>\n\
                        </td>\n\
                        <td ng-show="headerMetadata" class="dataLabel invalid" ng-class="{valid:object.valid}">{{object.label}}</td>\n\
                        <td ng-show="headerMetadata" class="data">\n\
                            <span class="invalid" ng-class="{valid:object.valid}">{{object.data}}</span>\n\
                            <span class="message invalid" ng-class="{valid:object.valid, warning:object.warning}">{{object.message}}</span>\n\
                        </td>\n\
                    </tr>'
            };
     });
     
     
     /* IGNORE EVERYTHING BELOW HERE.  IT IS TRANSCRIPTION STUFF /*
    
    /*
     * ng-model to set current canvas data (allow for inputs for jump to).  Connect it with a watcher on ng-change
     */
    msTestApp.directive('transcribe', function() {
        return {
            template: '<div class="transcriptionTemplate" style="">\n\
                <div class="canvasControls">\n\
                    <input type="button" ng-click="showPrevCanvas(currentCanvas);" value="Prev">\n\
                    <input type="button" ng-click="showNextCanvas(currentCanvas);" value="Next">\n\
                    <span>Current Canvas: {{currentCanvas + 1}} / {{transcanvases.length}}</span>\n\
                </div>\n\
                <div name="transcanvas_{{$index}}" ng-repeat="canvas in transcanvases" ng-class="{hidden: $index !== 0}">\n\
                    <div name="bookmark_{{$index}}"></div>\n\
                        <div name="imgTop_{{$index}}">\n\
                          <img ng-show="canvas.resources[0].resource[\'@id\'] !== undefined && canvas.resources[0].resource[\'@id\'] !== \'\'" src="{{canvas.resources[0].resource[\'@id\']}}"> \n\
                          <img ng-show="canvas.resources[0].resource[\'@id\'] == undefined || canvas.resources[0].resource[\'@id\'] == \'\' " src="images/missingImage.png"> \n\
                        </div>\n\
                        <div name="workspace_{{$index}}">\n\
                            <div name="captions_{{$index}}"></div>\n\
                            <button style="position: absolute; right:0;" id="nextTranscriptlet" onclick="transcription.nextTranscriptlet();"> NEXT </button>\n\
                            <button style="position: absolute; left:0;" id="previousTranscriptlet" onclick="transcription.previousTranscriptlet();"> PREVIOUS </button>\n\
                            <div ng-repeat="line in canvas.resources">\n\
                                <div line></div>\n\
                            </div>\n\
                        </div>\n\
                        <div name="imgBottom_{{$index}}">\n\
                          <img ng-show="canvas.resources[0].resource[\'@id\'] !== undefined && canvas.resources[0].resource[\'@id\'] !== \'\'" src="{{canvas.resources[0].resource[\'@id\']}}"> \n\
                          <img ng-show="canvas.resources[0].resource[\'@id\'] == undefined || canvas.resources[0].resource[\'@id\'] == \'\' " src="images/missingImage.png"> \n\
                      </div><br>\n\
                    </div>\n\
                </div>',
            replace: true
        };
    });
    
    msTestApp.directive('line', function() {
        return {
            template: '<div style="height:10px; width: 100px; background-color:yellow; margin: 10px 0px;" class="transcriptlet" name="transcriptlet_{{$index}}" lineID="{{$index}}"\n\
                        lineLeft="{{line.on.substring(line.on.lastIndexOf(\'=\')+1).split(\',\')[0]}}" lineTop="{{line.on.substring(line.on.lastIndexOf(\'=\')+1).split(\',\')[1]}}"\n\
                        lineWidth="{{line.on.substring(line.on.lastIndexOf(\'=\')+1).split(\',\')[2]}}" lineHeight="{{line.on.substring(line.on.lastIndexOf(\'=\')+1).split(\',\')[3]}}">\n\
                    </div>',
            replace: true,
            link: function($scope, element, attrs){
                element.bind('focus',function() { // cannot seem to bind the focus function here.  
                    element.html('HELLO');
//                    TranscriptionService.updatePresentation(item);
                });
            }
        }
    });
    
    
    
    
//            var theImage = $('.transcriptionImage');
//            var theHeight = theImage.height();
    //        var theWidth = theImage.width();
    //        var ratio = theWidth / theHeight;
//            $.each(asset.transcriptionData.transLine, function() {
//            console.log('line #:' + counter);
//            
//            //The lines come to me in the array in order.  This means the lineID is always counter - 1
//            var thisContent = '';
//            if(review === 'review'){
//                thisContent = this.lineContent;
//                if(thisContent == undefined)thisContent = "";
//            }
//            
//            var newAnno = $('<div id="transcriptlet_'+counter+'" lineID="'+counter+'" class="transcriptlet" data-answer="' + this.lineContent + '"><textarea tabindex=1>'+thisContent+'</textarea></div>');
//            newAnno.attr({
//              lineTop: parseFloat(this.y) / 10,
//              lineLeft: parseFloat(this.x) / (10 * ratio),
//              lineHeight: parseFloat(this.h) / 10,
//              lineWidth: parseFloat(this.w) / (10 * ratio),
//              counter: counter
//            });
////            $('#bookmark').css({ // 1000 / 100 = 10
////              top: parseFloat(this.y) / 10 + "%",
////              left:parseFloat(this.x) / (10 * ratio) + "%",
////              height:parseFloat(this.h) / 10 + "%",
////              width:parseFloat(this.w) / (10 * ratio) + "%",
////              position: "absolute"
////            });
//            counter += 1;
//            $("#workspace").append(newAnno);
//
//        });
//$('.transcriptlet').focusin(function() {
//            console.log('FOCUS ON A TRANSCRIPLET!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
//            var item = $(this);
//            transcription.updatePresentation(item);
//        });
//        transcription.updatePresentation($('.transcriptlet').eq(0));
    
    