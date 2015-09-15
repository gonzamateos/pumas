var insertOrUpdateQueue = [];
var syncing       = false;
var srvsyncing    = false;
var dbController  = null;
var onweb         = false;
var popup_opened  = true;
var siteUrl   = 'http://thepastoapps.com/proyectos/pumas/';
var responseUrl   = siteUrl+'response.php';
var timeoutID = null;
var downloadTimeout = null;
var downloadInterval = null;
var uploadTimeout = null;
var uploadInterval = null;
var showInterval = null;
var actualizando = null;

document.addEventListener("deviceready", onDeviceReady, false);
document.addEventListener("backbutton", onBackKeyDown, false);

function onBackKeyDown(){
    if ($.mobile.activePage.attr("id") === "registro") {
        return false;
    }else{
        if(onweb){
            history.back();
        }else{
            screen.lockOrientation('portrait');
            var nav = window.navigator;
            if( this.phonegapNavigationEnabled &&
                nav &&
                nav.app &&
                nav.app.backHistory ){
                nav.app.backHistory();
            } else {
                window.history.back();
            }
        }
    }
}
function onDeviceReady() {
    // Alert Bienvenida
    //navigator.notification.alert("Este es un prototipo de la aplicación. Los datos no son reales y las funcionalidades no se encuentran implementadas.hayekipo_");
    //alert("Este es un prototipo de la aplicación. Los datos no son reales y las funcionalidades no se encuentran implementadas.");
    
    /* Permisos */
    $.mobile.allowCrossDomainPages = true;
    $.ajaxSetup({ cache: false });
    
    /* Insert Inicial*/
    dbController = new DBController();
    dbController.init("pumas");
        
    eventListener();
}
