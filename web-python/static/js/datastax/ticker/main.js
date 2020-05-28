(function(window){
  'use strict';
  window.mobileMode = (document.documentElement.clientWidth > 850) ? 0 : 1;
  window.hasPlaceholderSupport = function() {
    return 'placeholder' in document.createElement('input');
    }
  window.pathLibs = {
    // path of the javescript libraries
    jquery : {
      link : "static/js/jquery.1.8.3.min.js",
      loaded : 0
    },
    binaryajax : {
      link : "static/js/binaryajax.js",
      loaded : 0
    },
    exif : {
      link : "static/js/exif.js",
      loaded : 0
    },
    rekoJS : {
      link : "static/js/reko.js",
      loaded : 0
    },
    face : {
      link : "static/js/face.js",
      loaded : 0
    }
  }
  window.loadScript = function(urlkeys, callback){
    // Function for loading javascript libraries
    if(urlkeys.constructor === String && pathLibs[urlkeys]){
      var urlkey = urlkeys;
      if(!pathLibs[urlkey]['loaded']){
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        var funcLoaded = function(){
          if(pathLibs[urlkey]['loaded']){
            script.remove();
          }else{
            pathLibs[urlkey]['loaded'] = 1;
          }
          if(callback){
            callback();
          }
        }
        script.src = pathLibs[urlkey]['link'];
        script.onreadychange = funcLoaded;
        script.onload = funcLoaded;
        head.appendChild(script);
      }else{
        if(callback){
          callback();
        }
      }
    }else if( urlkeys.constructor === Array ){
      if(urlkeys.length > 0){
        var urlFirst = urlkeys[0];
        urlkeys = urlkeys.slice(1, urlkeys.length);
        loadScript(urlFirst, function(){
          loadScript(urlkeys, callback);
        });
      }else{
        if(callback){
          callback();
        }
      }
    }else{
      throw('wrong type of script url');
    }
  }
  loadScript(["jquery","rekoJS"], function(){
    var $areaUpload = $("#areaUpload");
    var $areaResult = $("#areaResult");
    var $areaAttr = $areaResult.find(".item-attr ul");
    var $btnUpload = $("#btnAdd");
    var $fileUpload = $("#fileUpload");
    var $itemLoading = $areaResult.find(".item-loading");
    var $itemImage = $areaResult.find(".item-image");
    loadScript(["face"], function(){
        $btnUpload.click(function(){
            $fileUpload.trigger("click");
        });
        $fileUpload.change(function(){
            $areaAttr.empty();
            $itemImage.hide();
            $areaResult.show();
            $itemLoading.show();
            $areaUpload.find("p").hide();
            var files = $(this)[0].files;
            var numFiles = files.length;
            $(files).each(function(i) {
                var rawData = this;
                reko.image.resize(rawData, function(file, sizeObj){
                    var imageClass = new demoImageFace(file, sizeObj, rawData);
                    imageClass.analyzeImage();
                })
            });
        })
    })
  });
})(window);
