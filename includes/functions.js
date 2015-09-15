function eventListener(){
    $(".install").on("tap", function() {
        install(function (){refresh();});
    });
    $("#register-register").on("tap", function() {
        register();
    });
}
//si un objeto está vacío
function is_empty(obj) {

    // null and undefined are empty
    if (obj == null) return true;
    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length && obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    for (var key in obj) {
        if (hasOwnProperty.call(obj, key))    return false;
    }

    return true;
}
function checkConnect(){//return false;
    if(onweb){
        return true;
    }
    try{
        if(navigator.connection.type!=Connection.NONE){
            return true;
        }else{
            showErroresConexion();
            return false;
        }
    }catch(e){
        mylog(e);
    }
}
Number.isInteger = Number.isInteger || function(value) {
    return typeof value === "number" && 
           isFinite(value) && 
           Math.floor(value) === value;
};

function cleanField(field){
    var trimeado = $.trim(field);
    //if(field*1==trimeado){
    
    if(Number.isInteger(field)){
        return "'"+(field)+"'";
    }else{
        if(trimeado == '' || trimeado == null || trimeado == 'null' || trimeado == undefined || trimeado == 'undefined'){
            return "null";
        }else{
            return "'"+field+"'";
        }
    }
}
function validateEmail($email) {
  var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  return emailReg.test( $email );
}
function openPopup(msg){
    alert(msg);
}
function mylog(cosa){
    console.log(cosa);
}

function showLoading(){
    return true;
}
function hideLoading(){
    return true;
}
function registrar(){
    if( $.trim($('#nombre').val()) == '') { 
        openPopup('Ingrese un nombre.');
        return false;
    }else if( !validateEmail($('#mail').val()) ||  $.trim($('#mail').val()) == '') { 
        openPopup('Ingrese un e-mail valido.');
        return false;
    }else {
        $.mobile.changePage( "#preguntas", {transition: "slide"});
        return true;
    }
}
function responder(){
    var respuestas = ['', $('input[name=radio-choice-1]:checked').val(), $('input[name=radio-choice-2]:checked').val(), $('input[name=radio-choice-3]:checked').val()];
    if(respuestas[1]!=undefined &&
       respuestas[2]!=undefined &&
       respuestas[3]!=undefined){
   
        var gano = 0;
        var link = ['#perdiste', '#ganaste'];
        if(respuestas[1]==1 &&
           respuestas[2]==6 &&
           respuestas[3]==9){
            gano = 1;
        }
        updateDB_callback("INSERT INTO registros(`nombre`, `email`, `rta1`, `rta2`, `rta3`, `gano`) VALUES ("+cleanField($('#nombre').val())+", "+cleanField($('#mail').val())+", "+cleanField(respuestas[1])+", "+cleanField(respuestas[2])+", "+cleanField(respuestas[3])+", "+cleanField(gano)+")",
        function(){
            queueSync('registrar', JSON.stringify({nombre:$('#nombre').val(), email:$('#mail').val(), rta1:respuestas[1], rta2:respuestas[2], rta3:respuestas[3], gano:gano}));
            $('input[name=radio-choice-1], input[name=radio-choice-2], input[name=radio-choice-3]').removeAttr('checked').checkboxradio("refresh");
            $('#mail, #nombre').val('');
            $.mobile.changePage( link[gano], {transition: "slide"});
        });
        
    }else{
        openPopup("Responda las 3 preguntas para continuar.");
    }
}