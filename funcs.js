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
    var girone = $("#select-girone").val();
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
        risultato = " - "
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
