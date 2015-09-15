/* Clase para insert en batch desde xml
 * Ej: 
    var dbController = new DBController();
    dbController.init("hayquipo");
 * 
 * <sql>
 *  <statement>create blah blahh</statement>
 * </sql>
 * 4451100 - LXW386
 * Gonza
 * 
 **/
var stepactual;
var db=null;
var dbname;
var steps = ['Instalando', 'Bienvenido!'];
var last_insert_id=null;
function DBController() {
    
    this.init = function(name){
        dbname= name;
        db = window.openDatabase(name, "1.0", name, 700000);
        
        var value = window.localStorage.getItem("install_"+dbname)*1;
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> '+value+' > '+steps.length);
        if(value < steps.length){
            stepactual = value;
            dbController.executeBatch(stepactual);
        }else{
            skipSuccessHandlerDump();
        }
    };
    this.clearDB = function(){
        /*clear database*/
        db = window.openDatabase(dbname, "1.0", dbname, 700000);
        
        db.transaction(function(tx) {
          tx.executeSql('DROP TABLE IF EXISTS `users`');
          tx.executeSql('DROP TABLE IF EXISTS `jugador_puesto`');
          tx.executeSql('DROP TABLE IF EXISTS `equipo_hincha`');
          tx.executeSql('DROP TABLE IF EXISTS `perfiles` ');
          tx.executeSql('DROP TABLE IF EXISTS `equipos`');
          tx.executeSql('DROP TABLE IF EXISTS `jugadores_equipos`');
          tx.executeSql('DROP TABLE IF EXISTS `tipos_eventos`');
          tx.executeSql('DROP TABLE IF EXISTS `categorias_eventos`');
          tx.executeSql('DROP TABLE IF EXISTS `canchas_equipos`');
          tx.executeSql('DROP TABLE IF EXISTS `calendario`');
          tx.executeSql('DROP TABLE IF EXISTS `tareas`');
          tx.executeSql('DROP TABLE IF EXISTS `convocados`');
          tx.executeSql('DROP TABLE IF EXISTS `sync`');

        }, function(){  }, successHandler);
    };
    this.dbquery = function(query){
        dbResponse = {
            row: []
        };
        db.transaction(function(tx){
            tx.executeSql(query, [], function(tx, results){
                if(results.rows.length > 0){
                    i = 0;
                    while(i < results.rows.length){
                        console.log(results.rows.item(i).segs);
                        dbResponse.row[i] = results.rows.item(i);
                        i++;
                    }
                    console.log(dbResponse);
                }
                
            }, errorCB);
        }, errorCB);
    };
    this.executeBatch = function(sx) {
        var path;
        var mensaje = steps[sx];
        stepactual = sx;
        if(sx==0){
            path = 'includes/createtables.xml';
        }else{
            path = 'includes/inserts'+sx+'.xml';
        }
        
        if(path){
            if(mensaje != '' && mensaje != undefined){
                console.log(mensaje);
            }
            $.get(path, {}, this.gotFile, "xml");
        }
    };
    
    this.gotFile = function(doc) {
        var statements = [];
        var statementNodes=doc.getElementsByTagName("statement");
        for(var i=0; i<statementNodes.length; i++) {
            statements.push(statementNodes[i].textContent);
        }
        if(statements.length) {
            db = null;
            console.log('conectado a: ' + dbname);
            db = window.openDatabase(dbname, "1.0", dbname, 700000);
            db.transaction(function(tx) {
              //do nothing
              for(var i=0;i<statements.length;i++) {
                if(statementNodes[i].textContent != ''){
                    console.log(statementNodes[i].textContent);
                    tx.executeSql(statements[i]);
                }
              }
            }, errHandler, function(){
                stepactual++;
                
                console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> '+stepactual+' > '+steps.length);
                window.localStorage.setItem("install_"+dbname, stepactual);
                if(steps[stepactual]==undefined){
                    successHandlerDump();
                }else{
                    dbController.executeBatch(stepactual);
                }
                
            });
        }
    };

};

function errHandler(err){
    console.log('errHandler:'+JSON.stringify(err));
}

function successHandler(){
    console.log('successHandler()');
}

function successHandlerDump(){
    closePopup();
    $('#popup').removeClass('instalando');
}
function skipSuccessHandlerDump(){
    closePopup();
    $('#popup').removeClass('instalando');
    
}

function updateDB(sql_){
    db.transaction(function(tx){ tx.executeSql(sql_);}, errorCB);
}

function updateDB_callback(sql_, callback_){
    db.transaction(function(tx){
        tx.executeSql(sql_, [], callback_());
    }, errorCB);
}

function get_last_insert_id(){
    db.transaction(function(tx){
        var query = "SELECT last_insert_rowid() as last_id";
        tx.executeSql(query, [], function(tx, results){
            if(results.rows.length > 0){
                last_insert_id = results.rows.item(0).last_id;
            }
        }, errorCB);
    }, errorCB);
}

function errorCB(err) {
    //alert(err);
    console.log(err);
}

function insertOrUpdate(){
    if(insertOrUpdateQueue.length > 0){
        console.log(insertOrUpdateQueue);
        var reg = insertOrUpdateQueue.pop();
        console.log("insertOrUpdate: "+reg.select);
        var query = reg.select;

        db.transaction(function(tx){
            tx.executeSql(query, [], function(tx, results){
                if(results.rows.length > 0){
                    console.log(">> Update: "+reg.update);
                    updateDB_callback(reg.update, function(){ insertOrUpdate();});
                }else{
                    console.log(">> Insert: "+reg.insert);
                    updateDB_callback(reg.insert, function(){ insertOrUpdate();});
                }
            }, errorCB);
        }, errorCB);
    }
}