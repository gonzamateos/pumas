function queueSync(func, data){
    updateDB("INSERT INTO `syncs`(`func`, `vals`) VALUES ('"+func+"','"+data+"')");
    //serverSync();
}
function serverSync(){
    mylog('serverSync');
    if(checkConnect() && !srvsyncing){
        syncing=true;
        srvsyncing=true;
        var query = "SELECT * FROM `syncs` limit 10";
        
        db.transaction(function(tx){
            tx.executeSql(query, [], function(tx, results){
                if(results.rows.length > 0){
                    var more ="";
                    if(results.rows.length>=10){
                        more ="Sincronizacion parcial, pueden existir mas registros por sincronizar.";
                    }
                    mylog(results.rows);
                    i = 0;
                    var forsync= new Array();
                    while(i < results.rows.length){
                        var myvals = JSON.parse(results.rows.item(i).vals);
                        forsync[i] = {
                            id: results.rows.item(i).id, 
                            func: results.rows.item(i).func, 
                            vals: myvals};
                        i++;
                    }
                    mylog(forsync);
                    $.ajax({
                        url: responseUrl,
                        type: "POST", 
                        cache: false, 
                        dataType: 'jsonp',
                        callback: 'callback',
                        data: '&action=sync&forsync='+JSON.stringify(forsync)+'&sync=true',
                        success: function(data){ 
                            mylog('success');
                            mylog(data.content);
                            var oks = '';
                            var sw  = false;
                            for (var i=0; i<data.content.length; i++){
                                if(data.content[i].iscorrect==1){
                                    sw = true;
                                    oks+=','+data.content[i].id;
                                }
                            }
                            if(sw){
                                updateDB("DELETE FROM `syncs` WHERE id IN (0"+oks+")");
                                mylog("DELETE FROM `syncs` WHERE id IN (0"+oks+")");
                                
                            }
                            openPopup("Registros correctamente actualizados. "+more);
                        },beforeSend: function() {
                            mylog('beforeSend');
                            showLoading();
                        }, //Show spinner
                        complete: function() {
                            mylog('complete');
                            syncing=false;
                            srvsyncing=false;openPopup
                            hideLoading();
                        },
                        error: function (obj, textStatus, errorThrown) {
                            syncing=false;
                            srvsyncing=false;
                            mylog("status=" + textStatus + ",error=" + errorThrown);
                            hideLoading();
                            openPopup("Error actualizando, vuelva a intentarlo.");
                        }
                    });
                }else{
                    openPopup('Nada que sincronizar.');
                    syncing=false;
                    srvsyncing = false;
                }
            }, errorCB);
        }, errorCB);
    }else{
        openPopup("No estas conectado a internet.");
    }
}