document.addEventListener('DOMContentLoaded', function() {
  // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
  // // The Firebase SDK is initialized and available here!
  //
  // firebase.auth().onAuthStateChanged(user => { });
  // firebase.database().ref('/path/to/ref').on('value', snapshot => { });
  // firebase.messaging().requestPermission().then(() => { });
  // firebase.storage().ref('/path/to/ref').getDownloadURL().then(() => { });
  //
  // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥

  try {
    let app = firebase.app();
    let features = ['auth', 'database', 'messaging', 'storage'].filter(feature => typeof app[feature] === 'function');
    document.getElementById('load').innerHTML = `Firebase SDK loaded with ${features.join(', ')}`;
  } catch (e) {
    console.error(e);
    document.getElementById('load').innerHTML = 'Error loading the Firebase SDK, check the console.';
  }

  $('input').click(function(){
      $(this).select();
  });

  $("#btn-iscrizione-squadra").click(function(){
    var nome = $("#input-nome-squadra").val().toUpperCase();
    var girone = $("#select-girone").val();

    var teamData = {
        name: nome,
        girone: girone,
        score: 0,
        gf: 0,
        gs: 0
      };

    // Get a key for a new Post.
    var newKey = firebase.database().ref().push().key;

    // Write the new post's data simultaneously in the posts list and the user's post list.
    var updates = {};
    updates['/squadre/' + newKey] = teamData;

    firebase.database().ref().update(updates, completed);
  });

  $("#select-girone-sfide").on('change', function(){
    var girone = this.value;
    firebase.database().ref('/squadre').orderByChild('girone').equalTo(girone).once('value', function(snap){
      //$("#select-squadre option[value='0']").remove();
      $("#select-squadra-1").find("option").remove();
      $("#select-squadra-2").find("option").remove();

      var i = snap.numChildren();
      //$("#numero-squadre span").text(i);
      snap.forEach(function (snapshot) {
        var key = snapshot.key;
        var name = snapshot.val().name;

        $('#select-squadra-1').append($("<option></option>").attr("value",key).text(name));
        $('#select-squadra-2').append($("<option></option>").attr("value",key).text(name));

        i--;
      });

      //$('#select-squadre').append($("<option></option>").attr("value",0).text("0 - 0"));
    });
  });

  $("#btn-insert-sfida").click(function(){
    var andata = $("#input-ora-sfida-and").val();
    var ritorno = $("#input-ora-sfida-rit").val();
    var girone = $("#select-girone-sfide").val();
    var s1 = $("#select-squadra-1").val();
    var s2 = $("#select-squadra-2").val();

    var sfidaData1 = { //dati partita di andata
        s1: s1,
        s2: s2,
        ora: andata,
        risultato: 0,
        girone: girone
      };

    var sfidaData2 = { //dati partita di ritorno
        s1: s2, //inverti squadre per partita di ritorno
        s2: s1,
        ora: ritorno,
        risultato: 0,
        girone: girone
      };

    // Get a key for a new Post.
    var newKey1 = firebase.database().ref().push().key;
    var newKey2 = firebase.database().ref().push().key;

    // Write the new post's data simultaneously in the posts list and the user's post list.
    var updates = {};
    updates['/partite/' + newKey1] = sfidaData1;
    updates['/partite/' + newKey2] = sfidaData2;

    firebase.database().ref().update(updates, completed);
  });

  $(".marc-squadra-selection").on('change', function(){
    var id_select = $(this).attr('id');
    var squadra = $('#'+id_select).val();
    var girone = id_select.slice(-1);

    $("#input-nome-"+girone).prop('disabled', false); //abilita input nome al cambio squadra

    fillSelectMarcatore(squadra, girone);
  });

  $(".marc-marcatore-selection").on('change', function(){
    var id_select = $(this).attr('id');
    var marcatore = $('#'+id_select).val();
    var girone = id_select.slice(-1);

    if(marcatore === '0'){
      $("#input-nome-"+girone).prop('disabled', false);
    } else{
      $("#input-nome-"+girone).prop('disabled', true);
    }
  });

});

function completed(){
  alert("Fatto!");
}

function getPartite(){
  var appendhtml = '';
  var color = "";

  firebase.database().ref('/partite').orderByChild('ora').on('value', function(snap){
    //elimina prime righe vuote tabelle partite
    $("#partite-a table").find("tr:gt(0)").remove();
    $("#partite-b table").find("tr:gt(0)").remove();

    var i = snap.numChildren();
    snap.forEach(function (snapshot) {
      var key = snapshot.key;
      var s1 = snapshot.val().s1;
      var s2 = snapshot.val().s2;
      var ora = snapshot.val().ora;
      var risultato = snapshot.val().risultato;
      var girone = snapshot.val().girone;

      if(risultato === 0){
        risultato = " - ";
      }

      firebase.database().ref('/squadre').orderByKey().equalTo(s1).once('value', function(snap){
        snap.forEach(function (snapshot) {
          s1 = snapshot.val().name;
        });
        firebase.database().ref('/squadre').orderByKey().equalTo(s2).once('value', function(snap){
          snap.forEach(function (snapshot) {
            s2 = snapshot.val().name;
          });

          appendhtml = "<tr id='"+key+"'><td>"+ora+"</td><td>"+s1+" - "+s2+"</td><td>"+risultato+"</td></tr>";

          console.log(appendhtml);

          if(girone === "A"){
            $('#partite-a table tr:last').after(appendhtml);
          }else if(girone === "B"){
            $('#partite-b table tr:last').after(appendhtml);
          }
        });
      });

      i--;
    });
  });
}

function getPartiteConsole(){
  var appendhtml = '';

  firebase.database().ref('/partite').orderByChild('ora').on('value', function(snap){
    //elimina prime righe vuote tabelle partite
    $("#partite-a table").find("tr:gt(0)").remove();
    $("#partite-b table").find("tr:gt(0)").remove();

    var i = snap.numChildren();
    snap.forEach(function (snapshot) {
      var key = snapshot.key;
      var s1 = snapshot.val().s1;
      var s2 = snapshot.val().s2;
      var ora = snapshot.val().ora;
      var risultato = snapshot.val().risultato;
      var girone = snapshot.val().girone;

      if(risultato === 0){
        risultato = "<button onclick=\"fillFormMarcatori('"+girone+"', '"+key+"', '"+s1+"', '"+s2+"')\">Aggiorna</button>";
      }

      firebase.database().ref('/squadre').orderByKey().equalTo(s1).once('value', function(snap){
        snap.forEach(function (snapshot) {
          s1 = snapshot.val().name;
        });
        firebase.database().ref('/squadre').orderByKey().equalTo(s2).once('value', function(snap){
          snap.forEach(function (snapshot) {
            s2 = snapshot.val().name;
          });

          appendhtml = "<tr id='"+key+"'><td>"+ora+"</td><td>"+s1+" - "+s2+"</td><td>"+risultato+"</td></tr>";

          console.log(appendhtml);

          if(girone === "A"){
            $('#partite-a table tr:last').after(appendhtml);
          }else if(girone === "B"){
            $('#partite-b table tr:last').after(appendhtml);
          }
        });
      });

      i--;
    });
  });
}

function fillFormMarcatori(girone, key_partita, s1, s2){
  //partita all'inizio del form
  var sfida = $('#'+key_partita).find("td:eq(1)").text(); //prendi il testo del td sfida
  $("#p-partita-"+girone).text(sfida);

  //inserisci squadre nella select per squadre
  firebase.database().ref('/squadre').orderByKey().equalTo(s1).once('value', function(snap){
    snap.forEach(function (snapshot) {
      var nome_s1 = snapshot.val().name;

      $('#select-marc-squadra-'+girone).append($("<option></option>").attr("value",s1).text(nome_s1));
    });
  });
  firebase.database().ref('/squadre').orderByKey().equalTo(s2).once('value', function(snap){
    snap.forEach(function (snapshot) {
      var nome_s2 = snapshot.val().name;

      $('#select-marc-squadra-'+girone).append($("<option></option>").attr("value",s2).text(nome_s2));
    });
  });

  //inserisci marcatori prima squadra nella select per marcatori
  fillSelectMarcatore(s1, girone);

  //id partita nell'input aggiornamento risultato finale
  $("#input-ris-finale-"+girone).attr('data-partita', key_partita);
}

function fillSelectMarcatore(squadra, girone){
  $('#select-marc-marcatore-'+girone).find("option").remove(); //pulisci opzioni
  $('#select-marc-marcatore-'+girone).append($("<option data-gol='0'></option>").attr("value",'0').text("NUOVO"));

  firebase.database().ref('/marcatori').orderByChild('squadra').equalTo(squadra).once('value', function(snap){
    snap.forEach(function (snapshot) {
      var key_1 = snapshot.key;
      var nome_1 = snapshot.val().nome;
      var gol_1 = snapshot.val().gol;

      $('#select-marc-marcatore-'+girone).append($("<option data-gol='"+gol_1+"'></option>").attr("value",key_1).text(nome_1));
    });
  });
}

function updateRisultato(girone){
  var risultato = $("#input-ris-finale-"+girone).val();
  var key_partita = $("#input-ris-finale-"+girone).attr("data-partita");

  // Write the new post's data simultaneously in the posts list and the user's post list.
  var updates = {};
  updates['/partite/' + key_partita + '/risultato'] = risultato;

  firebase.database().ref().update(updates, completed);
}
