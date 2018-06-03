var interval = 30000; //intervallo per cambio tab a schermo (= 30sec)

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

function switchScreenTabs(){
  if($("#partite-classifiche").is(":visible")){
    $("#partite-classifiche").fadeOut();
    $("#marcatori").fadeIn('slow');
  }else{
    $("#partite-classifiche").fadeIn('slow');
    $("#marcatori").fadeOut();
  }
}

function getPartite(){
  var appendhtml = '';
  var color = "";

  firebase.database().ref('/partite').orderByChild('ora').on('value', function(snap){
    //elimina prime righe vuote tabelle partite
    $("#table-partite-a").find("tr:gt(0)").remove();
    $("#table-partite-b").find("tr:gt(0)").remove();

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
            $('#table-partite-a tr:last').after(appendhtml);
          }else if(girone === "B"){
            $('#table-partite-b tr:last').after(appendhtml);
          }
        });
      });

      i--;
    });
  });
}

function getPartiteConsole(){
  var appendhtml = '';

  firebase.database().ref('/partite').orderByChild('ordine').on('value', function(snap){
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
  //pulisci inputs
  $("#input-nome-"+girone).val('');
  $("#input-gol-"+girone).val('1');
  $("#input-ris-finale-"+girone).val('');

  //partita all'inizio del form
  var sfida = $('#'+key_partita).find("td:eq(1)").text(); //prendi il testo del td sfida
  $("#p-partita-"+girone).text(sfida);

  //inserisci squadre nella select per squadre
  $('#select-marc-squadra-'+girone).find("option").remove(); //pulisci opzioni

  var x = 1;
  fillSelectSquadra(s1, girone, x);
  $('#input-ris-finale-'+girone).attr('data-s1', s1);
  x++;
  fillSelectSquadra(s2, girone, x);
  $('#input-ris-finale-'+girone).attr('data-s2', s2);

  //inserisci marcatori prima squadra nella select per marcatori
  fillSelectMarcatore(s1, girone);

  //id partita nell'input aggiornamento risultato finale
  $("#input-ris-finale-"+girone).attr('data-partita', key_partita);
}

function fillSelectSquadra(squadra, girone, squadra_index){
  firebase.database().ref('/squadre').orderByKey().equalTo(squadra).once('value', function(snap){
    snap.forEach(function (snapshot) {
      var nome_s1 = snapshot.val().name;
      var gf_1 = snapshot.val().gf;
      var gs_1 = snapshot.val().gs;
      var score_1 = snapshot.val().score;

      $('#select-marc-squadra-'+girone).append($("<option data-gf='"+gf_1+"' data-gs='"+gs_1+"'></option>").attr("value",squadra).text(nome_s1));
      $('#input-ris-finale-'+girone).attr("data-score"+squadra_index, score_1);
    });
  });
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

  var gols = risultato.split(" - "); //separa i gol delle due squadre e crea array
  var gol_s1 = Number(gols[0]);
  var gol_s2 = Number(gols[1]);


  var s1 = $("#input-ris-finale-"+girone).attr("data-s1");
  var score_s1 = Number($("#input-ris-finale-"+girone).attr("data-score1"));
  var s2 = $("#input-ris-finale-"+girone).attr("data-s2");
  var score_s2 = Number($("#input-ris-finale-"+girone).attr("data-score2"));

  var updates = {};

  updates['/partite/'+ key_partita + '/risultato'] = risultato;

  if(gol_s1 > gol_s2){ //s1 ha fatto piu' gol -> s1 vince, s2 perde
    score_s1 += 3;
    updates['/squadre/' + s1 + '/score'] = score_s1;
  }else if(gol_s1 < gol_s2){ //s1 ha fatto meno gol -> s1 perde, s2 vince
    score_s2 += 3;
    updates['/squadre/' + s2 + '/score'] = score_s2;
  }else if(gol_s1 === gol_s2){ //s1 e s2 hanno fatto gli stessi gol -> pareggio
    score_s1 += 1;
    score_s2 += 1;
    updates['/squadre/' + s1 + '/score'] = score_s1;
    updates['/squadre/' + s2 + '/score'] = score_s2;
  }

  firebase.database().ref().update(updates, completed);
}

function updateMarcatore(girone){
  var key_marc = $("#select-marc-marcatore-"+girone).val();
  var gol = Number($("#input-gol-"+girone).val());
  var prec_gol = Number($("#select-marc-marcatore-"+girone).find(':selected').attr('data-gol'));
  var tot_gol = prec_gol + gol;

  var key_squadra = $("#select-marc-squadra-"+girone).val();
  var prec_gf = Number($("#select-marc-squadra-"+girone).find(':selected').attr('data-gf'));
  var tot_gf = prec_gf + gol;

  var key_squadra_subisce = $("#select-marc-squadra-"+girone+" option:not(:selected)").val();
  var prec_gs = Number($("#select-marc-squadra-"+girone+" option:not(:selected)").attr('data-gs'));
  var tot_gs = prec_gs + gol;

  var updates = {};

  if(key_marc === '0'){  //se NUOVO viene selezionato nei marcatori
    var nome_marc = $("#input-nome-"+girone).val().toUpperCase();

    var newMarc = {
      girone: girone,
      gol: gol,
      nome: nome_marc,
      squadra: key_squadra
    }

    var newKey = firebase.database().ref().push().key;
    updates['/marcatori/' + newKey] = newMarc;

  } else{ //se viene selezionato marcatore esistente
    updates['/marcatori/' + key_marc + '/gol'] = tot_gol;
  }

  updates['/squadre/' + key_squadra + '/gf'] = tot_gf;
  updates['/squadre/' + key_squadra_subisce + '/gs'] = tot_gs;

  firebase.database().ref().update(updates, completed);

  //aggiorna gf e gs nella select
  $("#select-marc-squadra-"+girone).find(':selected').attr('data-gf', tot_gf);
  $("#select-marc-squadra-"+girone+" option:not(:selected)").attr('data-gs', tot_gs);
}

function getClassifica(){
  var appendhtml = '';

  firebase.database().ref('/squadre').orderByChild('score').on('value', function(snap){
    //elimina prime righe vuote tabelle partite
    $("#classifica-a").find("tr:gt(0)").remove();
    $("#classifica-b").find("tr:gt(0)").remove();

    var i = snap.numChildren();
    snap.forEach(function (snapshot) {
      var key = snapshot.key;
      var name = snapshot.val().name;
      var score = snapshot.val().score;
      var gf = snapshot.val().gf;
      var gs = snapshot.val().gs;
      var diff = gf - gs;
      var girone = snapshot.val().girone;

      appendhtml = "<tr id='"+key+"'><td>"+name+"</td><td>"+score+"</td><td>"+gf+"</td><td>"+gs+"</td><td>"+diff+"</td></tr>";

      console.log(appendhtml);

      if(girone === "A"){
        $('#classifica-a tr:first').after(appendhtml);
      }else if(girone === "B"){
        $('#classifica-b tr:first').after(appendhtml);
      }
    });

    i--;
  });
}

function getMarcatori(){
  firebase.database().ref('/marcatori').orderByChild('gol').on('value', function(snap){
    //elimina prima riga vuota tabella marcatori
    $("#marcatori table").find("tr:gt(0)").remove();

    var i = snap.numChildren();
    snap.forEach(function (snapshot) {
      var key = snapshot.key;
      var nome = snapshot.val().nome;
      var gol = snapshot.val().gol;
      var girone = snapshot.val().girone;
      var key_squadra = snapshot.val().squadra;

      firebase.database().ref('/squadre').orderByKey().equalTo(key_squadra).once('value', function(snap){
        snap.forEach(function (snapshot) {
          squadra = snapshot.val().name;

          appendhtml = "<tr id='"+key+"'><td>"+nome+"</td><td>"+squadra+" ("+girone+")</td><td>"+gol+"</td></tr>";

          console.log(appendhtml);

          $('#marcatori table tr:last').after(appendhtml);
        });
      });


    });
  });
}
