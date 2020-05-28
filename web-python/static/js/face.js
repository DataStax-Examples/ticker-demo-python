(function(window){
    loadScript(["jquery"], function(){
        var $areaUpload = $("#areaUpload");
        var $areaResult = $("#areaResult");
        var $itemImage = $areaResult.find(".item-image");
        var $itemLoading = $areaResult.find(".item-loading");
        var $imageFace = $itemImage.find("img");
        var $txtWelcome = $("#txtWelcome");
        var $btnUpload = $("#btnAdd");
        var $btnEnter = $("#btnEnter");
        var demoImage = function(imgdata, imginfo, rawData){
            var self = this;
            this.rawData = rawData;
            this.domLoading = "<div class='item-loading' ><ul class='bokeh'><li></li><li></li><li></li><li></li><li class='txt'>loading...</li></ul><div class='wrap-loading'></div></div>";
            this.domThumb = "<li><a href=\"#\"><img /></a></li>";
            this.doms = {
                $blockImage : $itemImage,
                //$wrapImage : $blockImage.find(".wrap-image"),
                //$areaImage : $blockImage.find(".area-image"),
                $itemImage : $itemImage.find("img"),
                $listImages : $("#listImages").find("ul"),
                $sectionAttrs : $("#sectionAttrs"),
                init : function(){
                    return this;
                }
            }.init();
            sizeContainer = {
                width : this.doms.$blockImage.width(),
                height : this.doms.$blockImage.height()
            };
            this.imgdata = imgdata;
            this.imginfo = imginfo;
            this.arrayParts = ["eye_left", "eye_right", "nose", "mouth_l", "mouth_r"];
            this.arrayAttrs = {
                domGenerate : {
                    scoreDisplay : function(value){
                        return parseInt(value*10000)/100+"%";
                    },
                    objectDisplay : function(value, valProcess){
                        var stringResult = "";
                        for(var key in value){
                            if(valProcess){
                                var valKey = valProcess(value[key]);
                            }else{
                                var valKey = value[key];
                            }
                            stringResult += "<p>"+ key +"("+ valKey +")</p>";
                            break;
                        }
                        return stringResult;
                    },
                    rangeDisplay : function(value, arrayObj, threshold){
                        threshold = threshold?threshold:.5;
                        if(value<threshold){
                            var valResult = arrayObj[0];
                        }else if(value>threshold){
                            var valResult = arrayObj[1];
                        }
                        return valResult;
                    }
                },
                init : function(){
                    var self = this;
                    this.attrsDisplay = {
                        "confidence" : function(value){
                            return "<dl class=\"item-attr\"><dt>confidence: </dt><dd>"+value+"</dd></dl>";
                        },
                        "pose" : function(value){
                            if(value.constructor == Object){
                                var result = self.domGenerate.objectDisplay(value);
                                return "<dl class=\"item-attr\"><dt>pose: </dt><dd>"+result+"</dd></dl>";
                            }else{
                                return false;
                            }
                        },
                        "race" : function(value){
                            if(value.constructor == Object){
                                var result = self.domGenerate.objectDisplay(value, function(val){
                                    return parseInt(val*10000)/100+"%";
                                });
                                return "<dl class=\"item-attr\"><dt>race: </dt><dd>"+result+"</dd></dl>";
                            }else{
                                return false;
                            }
                        },
                        "quality" : function(value){
                            var resultString = "";
                            for(var key in value){
                                if(key == "brn"){
                                    var valKey = "face brightness";
                                }else if(key == "shn"){
                                    var valKey = "face sharpness";
                                }
                                resultString += "<dl class=\"item-attr\"><dt>"+valKey+":</dt><dd>"+parseInt(value[key]*10000)/100+"%"+"</dd></dl>";
                            }
                            return resultString
                        },
                        "emotion" : function(value){
                            if(value.constructor == Object){
                                var result = self.domGenerate.objectDisplay(value, function(val){
                                    return parseInt(val*10000)/100+"%";
                                });
                                return "<dl class=\"item-attr\"><dt>emotion: </dt><dd>"+result+"</dd></dl>";
                            }else{
                                return fvalse;
                            }
                        },
                        "age" : function(value){
                            return "<dl class=\"item-attr\"><dt>age: </dt><dd>"+value+"</dd></dl>";
                        },
                        "smile" : function(value){
                            var result = self.domGenerate.rangeDisplay(value, ["false", "true"], .5);
                            return "<dl class=\"item-attr\"><dt>smile: </dt><dd>"+result+"</dd></dl>";
                        },
                        "glasses" : function(value){
                            var result = self.domGenerate.rangeDisplay(value, ["without glass", "with glass"], .5);
                            return "<dl class=\"item-attr\"><dt>glass: </dt><dd>"+result+"</dd></dl>";
                        },
                        "sunglasses" : function(value){
                            var result = self.domGenerate.rangeDisplay(value, ["without sunglasses", "with sunglasses"], .5);
                            return "";
                        },
                        "beard" : function(value){
                            var result = self.domGenerate.rangeDisplay(value, ["false", "true"], .5);
                            return "<dl class=\"item-attr\"><dt>beard: </dt><dd>"+result+"</dd></dl>";
                        },
                        "mustache" : function(value){
                            var result = self.domGenerate.rangeDisplay(value, ["false", "true"], .5);
                            return "<dl class=\"item-attr\"><dt>mustache: </dt><dd>"+result+"</dd></dl>";
                        },
                        "eye_closed" : function(value){
                            var result = self.domGenerate.rangeDisplay(value, ["open", "closed"], .5);
                            return "<dl class=\"item-attr\"><dt>eye closed: </dt><dd>"+result+"</dd></dl>";
                        },
                        "mouth_open_wide" : function(value){
                            var result = self.domGenerate.scoreDisplay(value);
                            return "<dl class=\"item-attr\"><dt>mouth open width: </dt><dd>"+result+"</dd></dl>";
                        },
                        "beauty" : function(value){
                            var result = self.domGenerate.scoreDisplay(value);
                            return "<dl class=\"item-attr\"><dt>beauty: </dt><dd>"+result+"</dd></dl>";
                        },
                        "sex" : function(value){
                            var result = self.domGenerate.rangeDisplay(value, ["female", "male"], .5);
                            return "<dl class=\"item-attr\"><dt>gender: </dt><dd>"+result+"</dd></dl>";
                        }
                    };
                    return this;
                }
            }.init();
            this.init();
        }
        demoImage.prototype = {
            init : function(){
                var self = this;
                self.type = self.getDataType();
                if(self.type){
                    self.doms.$itemThumb = $(self.domThumb).prependTo(self.doms.$listImages).find("a").css("background-image", "url("+self.imgdata+")");
                    self.doms.$itemThumb.click(function(){
                        self.analyzeImage();
                        return false;
                    })
                }else{
                    alert("wrong type of file");
                }
            },
            analyzeImage : function(){
                var self = this;
                self.addLoading();
                self.getImageInfo(function(){
                    if(self.imginfo.width<sizeContainer.width && self.imginfo.height<sizeContainer.height){
                        self.scale = 1;
                    }else if(self.imginfo.width/self.imginfo.height > sizeContainer.width/sizeContainer.height){
                        self.scale = sizeContainer.width/self.imginfo.width;
                    }else{
                        self.scale = sizeContainer.height/self.imginfo.height;
                    } 
                    if(self.imginfo.width/self.imginfo.height>sizeContainer.width/sizeContainer.height){
                        if(self.imginfo.width<sizeContainer.width){
                            var widthImageShow = self.imginfo.width;
                        }else{
                            var widthImageShow = sizeContainer.width;
                        }
                        var valTop = (sizeContainer.height - (self.imginfo.height*widthImageShow/self.imginfo.width))/2;
                    }else if(self.imginfo.height < sizeContainer.height){
                        var valTop = (sizeContainer.height - self.imginfo.height)/2;
                    }else{
                        var valTop = 0;
                    }
                    if(typeof self.metadata == "undefined"){
                        var imgData = {};
                        imgData[self.type] = self.requestdata;
                        loadScript(["rekoJS"], function(){
                            reko.request($.extend({
                                jobs: "face_part_detail_recognize_gender_emotion_race_age_glass_mouth_open_wide_eye_closed_mustache_beard_beauty_aggressive"
                            }, imgData), function(data) {
                                self.metadata = data;
                                self.removeLoading();
                                self.processData();
                            }, function(msg){
                                self.removeLoading();
                                $("#areaDataRaw").find("pre").html("<span class=\"txt-value\">" + msg + "</span>");
                                $("#conNotice").html("<p class=\"txt-error\">" + msg + "</p>").fadeIn().delay(3000).fadeOut(500);
                            })
                        });
                    }else{
                        self.removeLoading();
                        self.processData();
                    }
                });
            },
            getImageInfo : function(callback){
                var self = this;
                if(typeof self.imginfo !== "undefined" && self.imginfo.width && self.imginfo.height ){
                    callback();
                }else{
                    var $tmpImage = $("<img />").attr("src", self.imgdata);
                    $conOff.append($tmpImage);
                    $tmpImage.load(function(){
                        self.imginfo = {
                            width : $tmpImage.width(),
                            height : $tmpImage.height()
                        };
                        $tmpImage.remove();
                        callback();
                    });
                }
            },
            getDataType : function(){
                var self = this;
                var regexpUrl = /^http[s]?\:\/\/([^\/]+\/)*(.*)\.(jpg|gif|jpeg|png)$/i;
                var regexpBase64 = /^data\:image\/(gif|jpeg|png)\;base64\,(.+)/i;
                if(self.imgdata.match(regexpUrl)){
                    self.requestdata = self.imgdata;
                    return "urls";
                }else{
                    var base64 = self.imgdata.match(regexpBase64);
                    if(base64){
                        self.requestdata = base64[2];
                        return "base64";
                    }else{
                        return null;
                    }
                }
            },
            addLoading : function(){
                var self = this;
                $itemLoading.show();
                $itemImage.hide();
            },
            removeLoading : function(){
                var self = this;
                $itemLoading.hide();
                $itemImage.show();
            }
        }
        //define demoImageFace class from demoImage
        window.demoImageFace = function(imgdata, imginfo, rawData){
            demoImage.call(this, imgdata, imginfo, rawData);
        }
        demoImageFace.prototype = demoImage.prototype;
        demoImageFace.prototype.constructure = demoImage;
        demoImageFace.prototype.processData = function(){
            var self = this;
            var mainFaceBox = null;
            var mainFaceAttr = null;
            $(self.metadata.face_detection).each(function(){
                if(this.confidence > 0.5){
                    var dataParts = reko.face.parts(this);
                    var dataFace = {
                        width : dataParts.boundingbox.width/self.metadata.ori_img_size.width,
                        height : dataParts.boundingbox.height/self.metadata.ori_img_size.height,
                        top : dataParts.boundingbox.top/self.metadata.ori_img_size.height,
                        left : dataParts.boundingbox.left/self.metadata.ori_img_size.width
                    }
                    if(!mainFaceBox || mainFaceBox.width<dataFace.width){
                        mainFaceBox = dataFace
                        mainFaceAttr = reko.face.attrs(this);
                    }
                }
            });
            if(mainFaceBox){
                reko.image.crop(self.rawData, mainFaceBox, function(file, sizeObj){
                    $imageFace.attr("src", file).css({
                        "display": "block"
                        });
                    $itemLoading.hide();
                    $itemImage.show();
                    });
                self.showAttr(mainFaceAttr);
                var match = mainFaceAttr.matches[0]
                if(match.score > 0.8){
                    $txtWelcome.removeClass("txt-error").html("Welcome back "+match.tag+"!");
                    $btnUpload.hide();
                    $btnEnter.css({display:"block"})
                }else{
                    $txtWelcome.addClass("txt-error").html("Not Verified, please try again.");
                }
            }else{
                $txtWelcome.addClass("txt-error").html("No face was detected;");
            }
            
        }
    demoImageFace.prototype.showAttr = function(data){
        var self = this;
        var domAttrs = "";
        for(var key in self.arrayAttrs.attrsDisplay){
            if(typeof data[key] !== "undefined"){
                domAttrs += self.arrayAttrs.attrsDisplay[key](data[key]);
                }
            }
        }
    });
})(window);
