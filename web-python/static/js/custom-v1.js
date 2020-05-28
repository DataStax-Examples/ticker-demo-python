$(document).ready(function() {
    $("#itemblistdetails1").css("display","block");
    function itemrowbuttonmake (itemrownum) { 
        $( "#itemblistutton"+itemrownum ).click(
              function() {
                        function updateitemsloop (itemloopnum) {
                            $("#itemblistdetails"+itemloopnum).css("display","none");
                        }
                        var x = 1;
                        while (x < itemrowcount) {
                            updateitemsloop (x);
                            x++;
                        }
                        $( ".selecteditem").removeClass("selecteditem");
                        $("#itemblistdetails"+itemrownum).css("display","block");
                        $( "#itemblistutton"+itemrownum).addClass("selecteditem")
              });
    }
    var itemrowcount = 1+$("#item-list tbody tr").length;
    var i = 1;
    while (i < itemrowcount) {
        itemrowbuttonmake (i);
        i++;
    }
});