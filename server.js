import logik from "./logik.js";
// import ordre from "ordre.js"

//laver express server.
const port = 6969;
import express from "express"; //Ændret til import. ved brug af firebase 
const app = express();

//Opretter view.
let pug = import("pug");
import path from "path";
const { request } = import("http");
const { response } = import("express");
app.set("view engine", "pug");
app.set("views", "views/");

app.use(express.json());


//Importer til __DirName
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

//Firebase filer.
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
    getFirestore,
    collection,
    getDocs,
    doc,
    deleteDoc,
    addDoc,
    setDoc,
    getDoc,
    query,
    where,
    updateDoc,
} from "firebase/firestore";
import { Console } from "console";
import { get } from "http";
import { DefaultDeserializer } from "v8";
//import{storage} from 'firebase/storage'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCwMpbafG7AkNlU28omo8MDhA7ZgIh7BlA",
    authDomain: "papersign-19cd5.firebaseapp.com",
    projectId: "papersign-19cd5",
    storageBucket: "papersign-19cd5.appspot.com",
    messagingSenderId: "477663863462",
    appId: "1:477663863462:web:f765c4665f9f0610fd4a67",
};

// Initialize Firebase
const appFireBase = initializeApp(firebaseConfig);
const db = getFirestore(appFireBase);

// Initialize Server Storage
let produkter = await getAllProducts();
let produktgrupper = await getAllProductgroups();
let fakturaer = await getAllFakturaer();
let ordrer = await getAllOrdrer();
let ProduktInProduktGoup = [];
let kurv = [];
let pgid = -1;
let total = 0;
let valgtGruppeNrS;
let valgtProduktNrS;
let betalt = 0;
let betallinger = [];
// let darkmode = true;


async function getAllOrdrer() {
    let fakturaCollection = collection(db, "ordrer");
    let ordrer = await getDocs(fakturaCollection);
    let liste = ordrer.docs.map((doc) => {
        let data = doc.data();
        data.docID = doc.id;
        return data;
    });
    return liste;
}

//Numre til id af produkter og produktgrupper. 
let result = await getAllNumbers();
let gruppeNr = result[1].gruppeNr;
let produktNr = result[3].produktNr;
let ordreNr = result[2].ordreNr;
let fakturaNR = result[0].fakturaNr;

async function getAllFakturaer() {
    let fakturaCollection = collection(db, "fakturaer");
    let collection1 = await getDocs(fakturaCollection);
    let liste = collection1.docs.map((doc) => {
        let data = doc.data();
        data.docID = doc.id;
        return data;
    });
    return liste;
}
async function getAllProductgroups() {
    let gruppeCollection = collection(db, "produktgrupper");
    let varegruppper = await getDocs(gruppeCollection);
    let liste = varegruppper.docs.map((doc) => {
        let data = doc.data();
        data.docID = doc.id;
        return data;
    });
    return liste;
}

// henter numre til varenumre, gruppenumre osv. (Dette er deres "id" inde på firebase)
async function getAllNumbers() {
    let gruppeCollection = collection(db, "nummre");
    let nummre = await getDocs(gruppeCollection);
    let liste = nummre.docs.map((doc) => {
        let data = doc.data();
        data.docID = doc.id;
        return data;
    });
    return liste;
}

// henter alle produkter, fra firebase og putter dem ind i et "lokalt" array
async function getAllProducts() {
    let varerCollection = collection(db, "varer");
    let varer = await getDocs(varerCollection);
    let vareliste = varer.docs.map((doc) => {
        let data = doc.data();
        data.docID = doc.id;
        return data;
    });
    return vareliste;
}

// forsiden (Kasseapparatet)
app.get("/", async (request, response) => {
    let temppgid = request.query.pgroup;
    if (temppgid != undefined) {
        pgid = temppgid
    }
    else if (pgid == -1) { pgid = 'visalt' }
    let p = await searchProductByGroupNr(pgid);
    let pg = await getAllProductgroups();
    let lavP = lagerStatus();
    response.render("kasse", { pgid: pgid, produkter: p, produktgrupper: pg, kurv: kurv, total: total, betalt: (total - betalt), lavP: lavP });
});

app.get("/underSkriftBetal", async (request, response) => {
    let temppgid = request.query.pgroup;
    if (temppgid != undefined) {
        pgid = temppgid
    }
    else if (pgid == -1) { pgid = 'visalt' }
    let p = await searchProductByGroupNr(pgid);
    let pg = await getAllProductgroups();
    let lavP = lagerStatus();
    betalBeloeb(0, "Underskrift")
    //genenmføre købet
    //Opretter ordre
    let d = new Date();
    let datoidag = d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();
    let nyOrdreFirebase = { samletpris: total, dato: datoidag, betalingsmetode: betallinger, navn: "", ordreNr: ordreNr, ordrelinjer: kurv, underskrift: false }
    //Sender odre til firebase
    await setDoc(doc(db, "ordrer", `${ordreNr}`), nyOrdreFirebase)
    ordreNr++;
    let ordreNrUpdate = { ordreNr: ordreNr }
    await setDoc(doc(db, "nummre/ordreNr"), ordreNrUpdate)
    // Opdatere lager beholdningen på firebase
    for (let k of kurv) {
        let produkterFB = await getAllProducts();
        let pIndexFB = findIndexOfProduct(produkterFB, k.produktnr, "produktNr")
        let productFB = produkterFB[pIndexFB]
        let nyAntal = produkterFB[pIndexFB].antal - k.antal
        produkterFB[pIndexFB].antal = nyAntal
        await setDoc(doc(db, "varer/" + k.produktnr), productFB)
    }
    //Nulstiller kasse apperatet 
    kurv = [];
    betallinger = [];
    betalt = 0;
    total = 0;
    //Opdater lokal data
    produkter = await getAllProducts();
    ordrer = await getAllOrdrer();
    response.render("kasse", { pgid: pgid, produkter: p, produktgrupper: pg, kurv: kurv, total: total, betalt: (total - betalt), lavP: lavP });
});

// opretter en produktgruppe med et unikt gruppeNr og opdaterer "numre" 
// i firebase, så næste produktgruppe også får et unikt nummer
app.post("/opretProduktGruppe", async (request, response) => {
    const { produktGruppeNavn, produktGruppeBeskrivelse } = request.body;
    let nyProduktGruppe = logik.createProductgroup(produktGruppeNavn, produktGruppeBeskrivelse, gruppeNr)
    produktgrupper.push(nyProduktGruppe)
    let nyProduktGruppeFirebase = { navn: produktGruppeNavn, beskrivelse: produktGruppeBeskrivelse, gruppeNr: gruppeNr }
    await setDoc(doc(db, "produktgrupper", `${gruppeNr}`), nyProduktGruppeFirebase)
    gruppeNr++;
    let gruppenrUpdate = { gruppeNr: gruppeNr }
    await setDoc(doc(db, "nummre/gruppeNr"), gruppenrUpdate)
    valgtGruppeNrS = undefined;
    response.sendStatus(201);
});

// sletter en produktgruppe
app.post('/deleteProductGroup', async (request, response) => {
    const { aktuelGroupNr } = request.body;
    await deleteDoc(doc(db, 'produktgrupper', aktuelGroupNr));
    response.sendStatus(201)
    valgtGruppeNrS = undefined;
})
// opdaterer en produktgruppe
app.post('/updateProduktGroup', async (request, response) => {
    const { aktuelGroupNr, produktGruppeNavn, produktGruppeBeskrivelse } = request.body;
    let updatetProduktGroup = { navn: produktGruppeNavn, beskrivelse: produktGruppeBeskrivelse, gruppeNr: aktuelGroupNr }
    await setDoc(doc(db, "produktgrupper/" + aktuelGroupNr), updatetProduktGroup)
    valgtGruppeNrS = undefined;
    response.sendStatus(201)
})

// opretter et produkt, i firebase og giver det et produktnummer
// opdaterer "produktnumre" inde i firebase, så næste produkt får et nyt unikt nr
app.post("/opretProdukt", async (request, response) => {
    const { gruppeNr, produktNavn, produktPris, produktAntal, leveradør, bestillingsnummer } = request.body;
    let nyProdukt = logik.createProduct(produktNavn, produktPris, produktAntal, leveradør, bestillingsnummer, gruppeNr, produktNr)
    produkter.push(nyProdukt)
    ProduktInProduktGoup.push(nyProdukt)
    let nyProduktFirebase = { gruppeNr: gruppeNr, navn: produktNavn, pris: produktPris, antal: produktAntal, leveradør: leveradør, bestillingsnummer: bestillingsnummer, produktNr: produktNr }
    await setDoc(doc(db, "varer", `${produktNr}`), nyProduktFirebase)
    produktNr++;
    let produktnrUpdate = { produktNr: produktNr }
    await setDoc(doc(db, "nummre/produktNr"), produktnrUpdate)
    valgtProduktNrS = undefined;
    response.sendStatus(201);
});

// sletter et produkt
app.post('/deleteProdukt', async (request, response) => {
    const { aktuelProduktNr } = request.body;
    await deleteDoc(doc(db, 'varer', aktuelProduktNr + ""));

    //Her finder jeg hvor i arrayet produkterne befinder sig og sletter dem. 
    for (let i = 0; i < produkter.length; i++) {
        if (produkter[i].produktNr == aktuelProduktNr) {
            produkter.splice(i, 1);
        }
        for (let i = 0; i < ProduktInProduktGoup.length; i++) {
            if (ProduktInProduktGoup[i].produktNr == aktuelProduktNr) {
                ProduktInProduktGoup.splice(i, 1);
            }
        }
    }
    valgtProduktNrS = undefined;
    response.sendStatus(201)
})
// opdaterer et produkt i firebase
app.post('/updateProdukt', async (request, response) => {
    const { aktuelProduktNr, gruppeNr, produktNavn, produktPris, produktAntal, leveradør, bestillingsnummer } = request.body;
    let updatetProdukt = { gruppeNr: gruppeNr, navn: produktNavn, pris: produktPris, antal: produktAntal, leveradør: leveradør, bestillingsnummer: bestillingsnummer, produktNr: aktuelProduktNr }
    await setDoc(doc(db, "varer/" + aktuelProduktNr), updatetProdukt)

    //Her finder jeg hvor i arrayet produkterne befinder sig og opdatere dem. 
    for (let i = 0; i < produkter.length; i++) {
        if (produkter[i].produktNr == aktuelProduktNr) {
            produkter[i] = { gruppeNr: gruppeNr, navn: produktNavn, pris: produktPris, antal: produktAntal, leveradør: leveradør, bestillingsnummer: bestillingsnummer, produktNr: aktuelProduktNr }
        }
    }
    for (let i = 0; i < ProduktInProduktGoup.length; i++) {
        if (ProduktInProduktGoup[i].produktNr == aktuelProduktNr) {
            ProduktInProduktGoup[i] = { gruppeNr: gruppeNr, navn: produktNavn, pris: produktPris, antal: produktAntal, leveradør: leveradør, bestillingsnummer: bestillingsnummer, produktNr: aktuelProduktNr }
        }
    }
    valgtProduktNrS = undefined;
    response.sendStatus(201)
})

// sender brugeren over på "underskrift" siden
// bruges når man vælger "underskrift" som betalingsmetode, i kassen
app.get("/underskrift", async (request, response) => {
    response.render("underskrift", { ordrer: ordrer, fakturaer: fakturaer, produktgrupper: produktgrupper, produktliste: produkter, kurv: kurv, total: total, fakturaNr: fakturaNR });
});
// opdaterer fakturanummer, så den har et unikt ordrenummer
app.post("/underskrift", async (request, response) => {
    let fakturanrUpdate = { fakturaNR: fakturaNR }
    fakturaNR++;
    await setDoc(doc(db, "nummre/fakturaNr"), fakturanrUpdate)
    response.sendStatus(201);
})
// henter CRUD siden (create, update, remove, delete) af:
// produkter, produktgrupper
app.get("/crud/", async (request, response) => {
    produktgrupper = await getAllProductgroups();
    let fromSearch = "0"
    let lavP = lagerStatus();
    response.render("crud", { fakturaer: fakturaer, produktgrupper: produktgrupper, produkter: produkter, ProduktInProduktGoup: ProduktInProduktGoup, valgtGruppeNr: valgtGruppeNrS, valgtProduktNr: valgtProduktNrS, fromSearch: fromSearch, lavP: lavP });
});
// siden til at komme ind på crud, på et specifikt produkt (via søgning)
app.get("/crud/:id&:id2", async (request, response) => {
    valgtGruppeNrS = request.params.id;
    valgtProduktNrS = request.params.id2
    ProduktInProduktGoup = searchProductByGroupNr(valgtGruppeNrS)
    let fromSearch = "1"
    let lavP = lagerStatus();
    response.render("crud", { fakturaer: fakturaer, produktgrupper: produktgrupper, produkter: produkter, ProduktInProduktGoup: ProduktInProduktGoup, valgtGruppeNr: valgtGruppeNrS, valgtProduktNr: valgtProduktNrS, fromSearch: fromSearch, lavP: lavP });
});
// siden til at komme ind på en specifik ordre (fundet via "faktura" oversigten)
app.get("/ordre/:data", async (request, response) => {
    let ordreID = request.params.data;
    let specifikOrdre = getOrdre(ordreID);
    response.render("ordre", { specifikOrdre, ordrer: ordrer, fakturaer: fakturaer, produktgrupper: produktgrupper, produktliste: produkter });
});
// viser alle ordrer (fakturaer)
app.get("/faktura/", async (request, response) => {
    ordrer = await getAllOrdrer();
    response.render("faktura", { ordrer: ordrer, fakturaer: fakturaer, produktgrupper: produktgrupper, produktliste: produkter, kurv: kurv });
});

//Kasse genererer kassen
app.get("/kasse", async (request, response) => {
    let temppgid = request.query.pgroup;
    if (temppgid != undefined) {
        pgid = temppgid
    }
    let p = await searchProductByGroupNr(pgid);
    let pg = await getAllProductgroups();
    //add to kurv
    response.render("kasse", { pgid: pgid, produkter: p, produktgrupper: pg, kurv: kurv, total: total, betalt: (total - betalt) });
});

//Kasse annullér køb (Tømmer kurven)
app.get("/kasseannullere", async (request, response) => {
    let temppgid = request.query.pgroup;
    if (temppgid != undefined) {
        pgid = temppgid
    }
    // let antal = request.query.antal;
    // let produktList = request.query.produktList;
    let p = await searchProductByGroupNr(pgid);
    let pg = await getAllProductgroups();
    //add to kurv
    kurv = [];
    betallinger = [];
    betalt = 0;
    total = 0;
    response.render("kasse", { pgid: pgid, produkter: p, produktgrupper: pg, kurv: kurv, total: total, betalt: (total - betalt) });
});

//Kasse tilføj produkt til kurv
app.get("/kassetilfoej", async (request, response) => {
    let temppgid = request.query.pgroup;
    if (temppgid != undefined) {
        pgid = temppgid
    }
    let antal = request.query.antal;
    let produktList = request.query.produktList;
    let p = await searchProductByGroupNr(pgid);
    let pg = await getAllProductgroups();
    //add to kurv
    if (antal != undefined && produktList != undefined) {
        let splitProduct = produktList.split(".")
        addToKurv(antal, splitProduct[0], splitProduct[1], splitProduct[2]);
        sumTotal();
    }
    response.render("kasse", { pgid: pgid, produkter: p, produktgrupper: pg, kurv: kurv, total: total, betalt: (total - betalt) });
});

//Kasse slet produkt fra kurv
app.get("/kasseslet", async (request, response) => {
    // check if pgid is changed and chang
    let temppgid = request.query.pgroup;
    if (temppgid != undefined) {
        pgid = temppgid
    }
    // let tempkurv = request.query.kurv;
    let p = await searchProductByGroupNr(pgid);
    let pg = await getAllProductgroups();
    //get index of product
    let productIndex = containsOrdre(request.query.kurv)
    //splice
    kurv.splice(productIndex, 1);
    sumTotal();
    response.render("kasse", { pgid: pgid, produkter: p, produktgrupper: pg, kurv: kurv, total: total, betalt: (total - betalt) });
});

//Kasse set rabat på produkt (pris pr stk pris ændring)
app.get("/kasserabat", async (request, response) => {
    // check if pgid is changed and chang
    let temppgid = request.query.pgroup;
    if (temppgid != undefined) {
        pgid = temppgid
    }
    let p = await searchProductByGroupNr(pgid);
    let pg = await getAllProductgroups();
    //get index of product
    let productIndex = containsOrdre(request.query.kurv)
    let rabat = request.query.rabat;
    if (rabat != undefined && productIndex !== false) {
        kurv[productIndex].pris = rabat
        kurv[productIndex].total = Number(kurv[productIndex].pris) * Number(kurv[productIndex].antal)
    }
    sumTotal();
    response.render("kasse", { pgid: pgid, produkter: p, produktgrupper: pg, kurv: kurv, total: total, betalt: (total - betalt) });
});

//Kasse set rabat på produkt (pris pr stk pris ændring)
app.get("/kassebetal", async (request, response) => {
    // check if pgid is changed and chang
    let temppgid = request.query.pgroup;
    if (temppgid != undefined) {
        pgid = temppgid
    }
    let p = await searchProductByGroupNr(pgid);
    let pg = await getAllProductgroups();
    let beloeb = request.query.beloeb;
    let betalling = request.query.betalling;
    if (beloeb != undefined && betalling != undefined) {
        betalBeloeb(beloeb, betalling)
    }
    //genenmføre købet
    if (betalt >= total) {
        //Opretter ordre
        let d = new Date();
        let datoidag = d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();
        let nyOrdreFirebase = { samletpris: total, dato: datoidag, betalingsmetode: betallinger, navn: "", ordreNr: ordreNr, ordrelinjer: kurv, underskrift: false }
        //Sender odre til firebase
        await setDoc(doc(db, "ordrer", `${ordreNr}`), nyOrdreFirebase)
        ordreNr++;
        let ordreNrUpdate = { ordreNr: ordreNr }
        await setDoc(doc(db, "nummre/ordreNr"), ordreNrUpdate)
        // Opdatere lager beholdningen på firebase
        for (let k of kurv) {
            let produkterFB = await getAllProducts();
            let pIndexFB = findIndexOfProduct(produkterFB, k.produktnr, "produktNr")
            let productFB = produkterFB[pIndexFB]
            let nyAntal = produkterFB[pIndexFB].antal - k.antal
            produkterFB[pIndexFB].antal = nyAntal
            await setDoc(doc(db, "varer/" + k.produktnr), productFB)
        }
        //Nulstiller kasse apperatet 
        kurv = [];
        betallinger = [];
        betalt = 0;
        total = 0;
        //Opdater lokal data
        produkter = await getAllProducts();
        ordrer = await getAllOrdrer();
    }
    // Beregner total
    sumTotal();
    // Genindlæser kasse apperatet 
    response.render("kasse", { pgid: pgid, produkter: p, produktgrupper: pg, kurv: kurv, total: total, betalt: (total - betalt) });
});

// finder produkterne, som tilhører et specifikt produktgruppenummer
app.post("/seachProduktinGroup", async (request, response) => {
    const { valgtGruppeNr } = request.body;
    ProduktInProduktGoup = searchProductByGroupNr(valgtGruppeNr)
    valgtGruppeNrS = valgtGruppeNr;
    valgtProduktNrS = undefined;
    response.sendStatus(201);
})

app.post("/aktuelProduktNrTilServer", async (request, response) => {
    const { aktuelProduktNr } = request.body;
    valgtProduktNrS = aktuelProduktNr;
    response.sendStatus(201);
})

// søgesiden, viser søgeresultaterne fra søgefeltet
app.get("/search", async (request, response) => {
    var attribut = request.query.atribut;
    var vaerdi = request.query.value;
    let searchresults = await logik.searchDynamic(produkter, attribut, vaerdi);
    response.render("search", { search: searchresults });
});

// porten til serveren (port 6969)
app.listen(port);


//Metoder--------------------------------------------------------------------------------------------------------------------------------------------------

function searchProductByGroupNr(gruppeNr) {
    //if gruppeNr == visalt return all products
    if (gruppeNr == "visalt") return produkter;
    let list = [];
    //let products = getProducts() // hent alle produkterne, i arrayet "produkter" fra server.js - måske navnet er forkert, eller også er der ingen getProducts, til den?)
    for (let i = 0; i < produkter.length; i++) {
        if (produkter[i].gruppeNr == gruppeNr) {
            list.push(produkter[i]);
        }
    }
    return list;
}

// adds product to cart
// Returns nothing
// Used in ("kassetilfoej")
function addToKurv(antal, pNr, navn, pris) {
    let total = antal * pris;
    let ordre = { produktnr: pNr, antal: antal, navn: navn, pris: pris, total: total };
    let found = containsOrdre(navn);
    //found !== false, update product, total and amount
    if (found !== false) {
        // if price differnt, update total to include the new price
        if (kurv[found].pris != pris) {
            total = antal * kurv[found].pris;
        }
        kurv[found].total += total
        kurv[found].antal = Number(kurv[found].antal) + Number(antal)
    }
    else {
        kurv.push(ordre);
    }
}

// Returns an index of an product for an given value
// Returns an index or false
// Used in ("kasseslet, kasserabat, addToKurv") to find the index of a given product in the cart
// TODO merge containsOrdre and findIndexOfProduct, becuase they do the same.. 
function containsOrdre(searchvalue) {
    let tempkurv = kurv;
    let found = false;
    let index = 0
    while (found === false && index < tempkurv.length) {
        let obj = tempkurv[index]
        if (obj.navn == searchvalue) {
            //changes found to i (index)
            found = index;
        }
        else index++;
    }
    return found;
}

// Calculates total price for items in cart
// Returns nothing
// Used in ("kassetilfoej") to calculates new total price for all items in cart
function sumTotal() {
    total = 0;
    for (let k of kurv) {
        total += k.total;
    }
}
// henter ordre, ud fra en ordres ID (i det lokale array, af ordre, som har data fra firebase)
function getOrdre(ordreID) {
    for (let i = 0; i < ordrer.length; i++) {
        if (ordrer[i].docID == ordreID) {
            return ordrer[i];
        }
    }
}

// Adds a pay objects to an array of pay objects
// Returns nothing
// Used in ("kassebetal") to pay of the total amount of the sale purchase
function betalBeloeb(beloeb, betalling) {
    // updates total amount payed
    betalt += Number(beloeb);
    // pushes pay object
    betallinger.push({ beloeb: beloeb, betalling: betalling });
}

// Returns an index of an product for an given atribute and its value
// Returns an index or false
// Used in ("kassebetal") to find the index of a given product in firebase, the index is partly used to change firebase product amount
function findIndexOfProduct(produkter, soegevaerdi, atribute) {
    let found = false
    let i = 0;
    while (i < produkter.length && found === false) {
        let p = produkter[i];
        if (p[atribute] == soegevaerdi) {
            //changes found to i (index)
            found = i;
        }
        else {
            i++;
        }
    }
    return found;
}

// Checks if storage count is 5 or lowere
// Returns array of products with low count
// Used in view ("") for low product count reminder
function lagerStatus() {
    // insilize empty array for return statement
    let lavLagerStatus = [];
    for (let p of produkter) {
        //Checks count of 5 or lowere, push if true
        if (p.antal <= 5) {
            lavLagerStatus.push(p)
        }
    }
    // Returns array products with 
    return lavLagerStatus;
}

console.log("Serveren er startet op. Lytter på port " + port);