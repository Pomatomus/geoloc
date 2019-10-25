// Geolocalizar 11/10/2019

// Globales
var punto=0;
var maxpuntos=0;
const DB_NAME = 'bdloca';
const DB_VERSION = 1; // Use a long long for this value (don't use a float)
const DB_STORE_NAME = 'puntos';
var db;
var current_view_pub_key;
var loc = {punto:0, lat:"", lon:"", exact:"", altura:"", alterr:"", fecha:"", coment:""};
var intervalo;

// Inicio
function iniciar(){
	document.getElementById('obtener').addEventListener('click', obtener, false);
	document.getElementById('borrabd').addEventListener('click', borrarbd, false);
	document.getElementById('copiar').addEventListener('click', copiaAlPorta, false);
	document.getElementById('programar').addEventListener('click', programar, false);
	openDb();
} 


// Base datos
function openDb() {
    var req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onsuccess = function (evt) {    
      db = this.result;
	  mostrarbd();
    }
    
	req.onerror = function (evt) {
      errores(evt);
    }

    req.onupgradeneeded = function (evt) {
      var store = evt.currentTarget.result.createObjectStore(
        DB_STORE_NAME, { keyPath: 'id', autoIncrement: false });
    }
}

function agregarobjeto(){
  var transaction = db.transaction([DB_STORE_NAME], "readwrite");
  var objectStore = transaction.objectStore(DB_STORE_NAME);
  var request = objectStore.add({id: loc.punto, lat: loc.lat, lon: loc.lon, exact: loc.exact, 
                altura: loc.altura, alterr: loc.alterr, fecha: loc.fecha, coment: loc.coment}); 
  // request.onsuccess = function(event) {
    // console.log('Objeto anadido');
  // }
}


function mostrarbd(){
  var transaction = db.transaction([DB_STORE_NAME], "readonly");
  var objectStore = transaction.objectStore(DB_STORE_NAME);
  
  objectStore.openCursor().onsuccess = function(event) {
    var cursor = event.target.result;
    if (cursor) {
      loc.punto=cursor.value.id;
	  loc.lat=cursor.value.lat;
	  loc.lon=cursor.value.lon;
	  loc.exact=cursor.value.exact;
	  loc.altura=cursor.value.altura;
	  loc.alterr=cursor.value.alterr;
	  loc.fecha=cursor.value.fecha;
	  loc.coment=cursor.value.coment;
	  punto+=1;
	  pintaloc();
      cursor.continue();
    }
  }
} 

function borrarbd(){	
 if (window.confirm("Borrar la BD?")) {   		
  var req = indexedDB.deleteDatabase(DB_NAME);
  location.reload(true);
 
  req.onerror = function (event) {
	errores(event);
  }

  req.onblocked = function () {
    console.log("Couldn't delete database due to the operation being blocked");
  }
 }
}	

function cambiacoment(punto,texto){
  var objectStore = db.transaction([DB_STORE_NAME], "readwrite").objectStore(DB_STORE_NAME);
  var request = objectStore.get(punto);	
  request.onsuccess = function(event) {
    // Get the old value that we want to update
    var data = event.target.result;
    data.coment = texto;
    // Put this updated object back into the database.
    var requestUpdate = objectStore.put(data);
    requestUpdate.onerror = function(event) {
      // Do something with the error
    }
  }
}
// Obterner Posición
function obtener(){
  const prc = 1000000;
  var d = new Date();
  var geoconfig={
		enableHighAccuracy: true,
		timeout: 10000,
		maximumAge: 5000
  };
	//navigator.geolocation.getCurrentPosition(mostrar,errores,geoconfig);
  navigator.geolocation.getCurrentPosition(function(position) {
	punto+=1;
	loc.punto=punto;
	loc.lat= Math.round(position.coords.latitude*prc)/prc;
	loc.lon= Math.round(position.coords.longitude*prc)/prc;
	loc.exact= position.coords.accuracy;
	loc.altura= position.coords.altitude;
	loc.alterr= position.coords.altitudeAccuracy;
	loc.fecha=  d.getDate()+"/"+d.getMonth()+"/"+d.getFullYear()+"  "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();	
	loc.coment="";
	pintaloc();
	agregarobjeto();
  },errores,geoconfig);	
} 

function pintaloc(){
	var pie=document.getElementById('pie');	
	var sel = document.getElementById("ubicacion");
	var datos='';
	datos=' <div class="loc"> ';
	//Columna Texto
	datos+=' <div class="loctext"> ';
	datos+='<p> Punto: </p>';
	datos+='<p> Latitud: </p>';
	datos+='<p> Latongitud: </p>';
	datos+='<p> Tolerancia: </p>';
	datos+='<p> Altura: </p>';
	datos+='<p> Error Altura: </p>';
	datos+='<p> Fecha: </p>';
	datos+='<p> Comentario: </p>';		   
	datos+='</div>';
    
	//Columna Datos.
    datos+=' <div class="locdat"> ';
	datos+='<p> ' + loc.punto + '</p>';
	datos+='<p> '+loc.lat + '</p>';
	datos+='<p> '+loc.lon + '</p>';
	datos+='<p> '+loc.exact + '</p>';
	datos+='<p> '+loc.altura + '</p>';
	datos+='<p> '+loc.alterr + '</p>';
	datos+='<p> '+loc.fecha + '</p>';
	datos+='<p> <input type="text" name="coment" onchange="cambiacoment('+
	       loc.punto+', value)" value="'+loc.coment+'" > </p>';		   
	datos+='</div>';   	
	
	datos+='</div>';
	sel.innerHTML=datos+sel.innerHTML;
	
	datos=" Punto: "+loc.punto+" Latidtud: "+loc.lat+" Longitud: "+loc.lon+" Hora: "+loc.fecha;
	pie.innerHTML=datos;		
}

// copiar al porta papeles.

function copiaAlPorta() {
	 var data="";
     var objectStore = db.transaction([DB_STORE_NAME], "readonly").objectStore(DB_STORE_NAME);
	 var valor = prompt("Copiar Punto?", "");
	 if (valor != null && valor !="") {		 
	  if (valor =="0") {		 
       objectStore.openCursor().onsuccess = function(event) {
         var cursor = event.target.result;
         if (cursor) {
           data+="Punto "+cursor.value.id+", ";
	       data+=cursor.value.lat+",";
           data+=cursor.value.lon+"\r";
           cursor.continue();
         }
		 navigator.clipboard.writeText(data);
	   }
      } else {
       valor=Number(valor);		  
       var request = objectStore.get(valor);	
       request.onsuccess = function(event) {
	     var data = event.target.result;
	     navigator.clipboard.writeText(data.lat + "," + data.lon);
       }
      }
     }	 
}

// manejar errores
function errores(error){
  var pie=document.getElementById('pie');	
  pie.innerHTML='Error: '+error.code+' '+error.message;
}

// programar obterner puntos automaticamente.
function programar() {
  var valor = prompt("Intervalo en Minutos?", "");
  if (valor != null && valor !="") { 
   valor=valor*60000;  
   intervalo= window.setInterval(autopunto,valor);	
  }
}	

function autopunto() {
  maxpuntos+=1;
  if (maxpuntos<10) {
    obtener()	  
  } else {	  
	window.clearInterval(intervalo);  
  }
}

window.addEventListener('load', iniciar, false);