(function(window){
    'use strict';
    var property = {
        account : {
            api_key: 'wDENxudHfgwjxvJp',
            api_secret: 'xTfNEEPSJL9SFlKf',
            name_space: "demo_datastax",
            user_id: "demo_datastax"
        },
        apihost : 'https://rekognition.com',
        landmarkExcept : ['mouth l', 'mouth r'],
        resizeLimit : 800
    }
    loadScript(["jquery"], function(){
        var rekoLibrary = function(){
            return this;
        };
        var reko = function (params) {
            return new rekoLibrary(params);
        };
        reko.fn = rekoLibrary.prototype = {
            setHost: function(host) {
                reko.property.apihost = host;
            },
            setAccount: function(data) {
                reko.property.account = $.extend(self.account, data);
            },
            request: function(data, callback, error) {
                $.ajax({
                    type: 'POST',
                    url: reko.property.apihost + '/func/api/index.php',
                    dataType: 'json',
                    accepts: 'application/json',
                    data: $.extend({}, reko.property.account, data),
                    success: function(data) {
                        if (data.usage.status === 'Succeed.') {
                            reko.property.data = data;
                            callback(data);
                        } else {
                            if (error) {
                                error(data.usage.status);
                            }
                        }
                    },
                    error: function(x, t, m) {
                        self.data = '';
                        if (error) {
                            error(x.statusText + ' : ' + x.responseText);
                        }
                    }
                });
            }
        };
        reko.property = reko.fn.property = property;
        reko.image = reko.fn.image = {
            resize: function(data, callback) {
                var self = this;
                var orientation = 1;
                if(typeof reko.$conOff == "undefined"){
                    if($('#conOff').length){
                        reko.$conOff = $('#conOff');
                    }else{
                        reko.$conOff = $('<div id="conOff" style="position:absolute;top:-6666px;left:-6666px;width:1px;height:1px;"></div>');
                        //reko.$conOff = $('<div id="conOff"></div>');
                        $(document).find('body').append(reko.$conOff);
                    }
                }
                if(typeof reko.$canvasTmp == "undefined"){
                    if(reko.$conOff.find('.canvas-resize').length){
                        reko.$canvasTmp = reko.$conOff.find('.canvas-resize').eq(0);
                    }else{
                        reko.$canvasTmp = $('<canvas class="canvas-resize"></canvas>');
                        reko.$conOff.append(reko.$canvasTmp);
                    }
                }
                loadScript(["binaryajax","exif"], function(){
                    EXIF.getData(data, function(){
                        orientation = EXIF.getTag(this, 'Orientation');
                        if (typeof FileReader != 'undefined') {
                            var reader = new FileReader();
                            reader.onload = function(e){
                                var imgTmp = new Image();
                                var file = e.target.result;
                                var $canvasTmp, ctx;
                                imgTmp.onload = function(){
                                    var $imgTmp = $(imgTmp);
                                    var widthResize = parseInt(imgTmp.width);
                                    var heightResize = parseInt(imgTmp.height);
                                    var widthRotate, heightRotate;
                                    var arc = 0, tmp;
                                    if (widthResize > reko.property.resizeLimit || heightResize > reko.property.resizeLimit) {
                                        if (widthResize > heightResize && widthResize > reko.property.resizeLimit) {
                                            heightResize = reko.property.resizeLimit * heightResize / widthResize;
                                            widthResize = reko.property.resizeLimit;
                                        } else if (heightResize > widthResize && heightResize > reko.property.resizeLimit) {
                                            widthResize = reko.property.resizeLimit * widthResize / heightResize;
                                            heightResize = reko.property.resizeLimit;
                                        }
                                    }
                                    widthRotate = widthResize;
                                    heightRotate = heightResize;
                                    if (orientation == 3 || orientation == 4) {
                                        arc = -180 * Math.PI / 180;
                                    } else if (orientation == 1 || orientation == 2) {
                                        arc = 0;
                                    } else if (orientation) {
                                        tmp = widthRotate;
                                        widthRotate = heightRotate;
                                        heightRotate = tmp;
                                        if (orientation == 6 || orientation == 5) {
                                            arc = 90 * Math.PI / 180;
                                        } else if (orientation == 8 || orientation == 7) {
                                            arc = -90 * Math.PI / 180;
                                        }
                                    }
                                    reko.$canvasTmp.attr({
                                        width: widthRotate,
                                        height: heightRotate
                                    });
                                    ctx = reko.$canvasTmp[0].getContext('2d');
                                    ctx.translate(widthRotate / 2, heightRotate / 2);
                                    ctx.rotate(arc);
                                    ctx.drawImage($imgTmp[0], 0, 0, imgTmp.width, imgTmp.height, -widthResize / 2, -heightResize / 2, widthResize, heightResize);
                                    file = reko.$canvasTmp[0].toDataURL('image/jpeg', 0.9);
                                    $imgTmp.remove();
                                    callback(file, {
                                        height: heightRotate,
                                        width: widthRotate
                                    });
                                };
                                imgTmp.src=file;
                            };
                            reader.readAsDataURL(data);
                        } else {
                            $.ajaxFileUpload({
                                url: 'https://rekognition.com/demo/do_upload',
                                fileElement: $('#conUpload').find('.file-upload').eq(0),
                                dataType: 'json',
                                success: function(data) {
                                    $('#conUpload').find('.file-upload').eq(0).val('').change(function() {
                                        if ($(this).val()) {
                                            doUpload();
                                        };
                                    });
                                    if (this.fileUrl) {
                                        var $imgTmp = $('<img />').attr('src', this.fileUrl).appendTo($conOff);
                                        $imgTmp.load(function() {
                                            self.detectImg(file, !i);
                                        })
                                    }
                                },
                                error: function(data, status, e) {
                                    throw(e);
                                }
                            });
                        }
                    });
                });
            },
            crop : function(data, box, callback){
                var self = this;
                var orientation = 1;
                if(typeof reko.$conOff == "undefined"){
                    if($('#conOff').length){
                        reko.$conOff = $('#conOff');
                    }else{
                        reko.$conOff = $('<div id="conOff" style="position:absolute;top:-6666px;left:-6666px;width:1px;height:1px;"></div>');
                        $(document).find('body').append(reko.$conOff);
                    }
                }
                if(typeof reko.$canvasCrop == "undefined"){
                    if(reko.$conOff.find('.canvas-crop').length){
                        reko.$canvasCrop = reko.$conOff.find('.canvas-crop').eq(0);
                    }else{
                        reko.$canvasCrop = $('<canvas class="canvas-crop"></canvas>');
                        reko.$conOff.append(reko.$canvasCrop);
                    }
                }
                if(reko.$conOff.find('.canvas-resize').length){
                    reko.$canvasTmp = reko.$conOff.find('.canvas-resize').eq(0);
                }else{
                    reko.$canvasTmp = $('<canvas class="canvas-resize"></canvas>');
                    reko.$conOff.append(reko.$canvasTmp);
                }
                loadScript(["binaryajax","exif"], function(){
                    EXIF.getData(data, function() {
                        orientation = EXIF.getTag(this, 'Orientation');
                        if (typeof FileReader != 'undefined') {
                            var reader = new FileReader();
                            reader.onload = function(e) {
                                var imgTmp = new Image();
                                var file = e.target.result;
                                var $canvasTmp, ctx, ctxCrop;
                                imgTmp.onload = function() {
                                    var $imgTmp = $(imgTmp);
                                    var widthResize = parseInt(imgTmp.width);
                                    var heightResize = parseInt(imgTmp.height);
                                    var widthRotate, heightRotate;
                                    var arc = 0,tmp;
                                    if (widthResize > reko.property.resizeLimit || heightResize > reko.property.resizeLimit) {
                                        if (widthResize > heightResize && widthResize > reko.property.resizeLimit) {
                                            heightResize = reko.property.resizeLimit * heightResize / widthResize;
                                            widthResize = reko.property.resizeLimit;
                                        } else if (heightResize > widthResize && heightResize > reko.property.resizeLimit) {
                                            widthResize = reko.property.resizeLimit * widthResize / heightResize;
                                            heightResize = reko.property.resizeLimit;
                                        }
                                    }
                                    widthRotate = widthResize;
                                    heightRotate = heightResize;
                                    if (orientation == 3 || orientation == 4) {
                                        arc = -180 * Math.PI / 180;
                                    } else if (orientation == 1 || orientation == 2) {
                                        arc = 0;
                                    } else if (orientation) {
                                        tmp = widthRotate;
                                        widthRotate = heightRotate;
                                        heightRotate = tmp;
                                        if (orientation == 6 || orientation == 5) {
                                            arc = 90 * Math.PI / 180;
                                        } else if (orientation == 8 || orientation == 7) {
                                            arc = -90 * Math.PI / 180;
                                        }
                                    }
                                    reko.$canvasTmp.attr({
                                        width: widthRotate,
                                        height: heightRotate
                                    });
                                    ctx = reko.$canvasTmp[0].getContext('2d');
                                    ctx.translate(widthRotate / 2, heightRotate / 2);
                                    ctx.rotate(arc);
                                    ctx.drawImage($imgTmp[0], -widthResize / 2, -heightResize / 2, widthResize, heightResize);
                                    box = {
                                        width : box.width*widthRotate,
                                        height : box.height*heightRotate,
                                        left : box.left*widthRotate,
                                        top : box.top*heightRotate
                                    }
                                    if(box.width/2+box.left<widthRotate/2){
                                        var r = box.width/2 + box.left;
                                    }else{
                                        var r = widthRotate - box.width/2 - box.left;
                                    }
                                    if(box.height/2+box.top<heightRotate/2){
                                        var rTmp = box.height/2 + box.top;
                                        if(rTmp < r){
                                            r = rTmp;
                                        }
                                    }else{
                                        var rTmp = heightRotate - box.height/2 - box.top;
                                        if(rTmp < r){
                                            r = rTmp;
                                        }
                                    }
                                    reko.$canvasCrop.attr({
                                        width: r*2,
                                        height: r*2
                                    });
                                    ctxCrop = reko.$canvasCrop[0].getContext('2d');
                                    ctxCrop.drawImage(reko.$canvasTmp[0], parseInt(box.left+box.width/2-r), parseInt(box.top+box.height/2-r), parseInt(r*2), parseInt(r*2), 0, 0, parseInt(r*2), parseInt(r*2));
                                    //ctxCrop.drawImage(reko.$canvasTmp[0], box.left, box.top, box.width, box.height, 0, 0, box.width, box.height);
                                    file = reko.$canvasCrop[0].toDataURL('image/jpeg', 0.9);
                                    $imgTmp.remove();
                                    callback(file, {
                                        height: heightRotate,
                                        width: widthRotate
                                    });
                                };
                                imgTmp.src=file;
                            };
                            reader.readAsDataURL(data);
                        } else {
                            $.ajaxFileUpload({
                                url: 'https://rekognition.com/demo/do_upload',
                                fileElement: $('#conUpload').find('.file-upload').eq(0),
                                dataType: 'json',
                                success: function(data) {
                                    $('#conUpload').find('.file-upload').eq(0).val('').change(function() {
                                        if ($(this).val()) {
                                            doUpload();
                                        };
                                    });
                                    if (this.fileUrl) {
                                        var $imgTmp = $('<img />').attr('src', this.fileUrl).appendTo($conOff);
                                        $imgTmp.load(function() {
                                            self.detectImg(file, !i);
                                        })
                                    }
                                },
                                error: function(data, status, e) {
                                    throw(e);
                                }
                            });
                        }
                    });
                });
            }
        };
        reko.face = reko.fn.face = {
            parts: function(data) {
                var self = this;
                var result = {
                    boundingbox: {
                        width: data.boundingbox.size.width,
                        height: data.boundingbox.size.height,
                        top: data.boundingbox.tl.y,
                        left: data.boundingbox.tl.x
                    },
                    pose: data.pose,
                    landmarks: {}
                };
                for (var key in data) {
                    if (data[key].hasOwnProperty('x') && reko.property.landmarkExcept.indexOf(key) === -1) {
                        result.landmarks[key] = data[key];
                    }
                }
                return result;
            },
            attrs: function(data) {
                var result = {};
                for (var key in data) {
                    if (!data[key].hasOwnProperty('x') && key != 'boundingbox' && key != 'name') {
                        result[key] = data[key];
                    }
                }
                return result;
            }
        };
        if(!window.reko){
            window.reko = reko();
        }
    });
})(window);