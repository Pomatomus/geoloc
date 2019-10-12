// Geolocalizar 11/10/2019

// Globales
var punto=0;
const DB_NAME = 'bdloca';
const DB_VERSION = 1; // Use a long long for this value (don't use a float)
const DB_STORE_NAME = 'puntos';
var db;
var current_view_pub_key;
var loc = {punto:0, lat:"", lon:"", fecha:"", coment:""};

// Inicio
function iniciar(){
	document.getElementById('obtener').addEventListener('click', obtener, false);
	document.getElementById('borrabd').addEventListener('click', borrarbd, false);
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
  var request = objectStore.add({id: loc.punto, lat: loc.lat, lon: loc.lon, fecha: loc.fecha, coment: loc.coment}); 
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
	loc.lat= Math.round(position.coords.latitude*100000)/100000;
	loc.lon= Math.round(position.coords.longitude*100000)/100000;
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
	datos+='<p> Punto: '+loc.punto;
	datos+=' Latitud: '+loc.lat;
	datos+=' Latongitud: '+loc.lon;
	datos+=' Fecha: '+loc.fecha+'</p>';
	datos+='<p> Comentario: <input type="text" name="coment" onchange="cambiacoment('+
	       loc.punto+', value)" value="'+loc.coment+'" > </p>';
	datos+='</div>';
	sel.innerHTML+=datos;
	
	datos=" Punto: "+loc.punto+" Latidtud: "+loc.lat+" Longitud: "+loc.lon+" Hora: "+loc.fecha;
	pie.innerHTML=datos;		
}


function errores(error){
  var pie=document.getElementById('pie');	
  pie.innerHTML='Error: '+error.code+' '+error.message;
}

window.addEventListener('load', iniciar, false);