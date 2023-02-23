import logik from './logik.js';

let ordrelinjenr = 1;
let fakturanr = 0;
let følgdeseddelnr = 0;

let fakturaer = [];
let følgesedler = [];
let ordrelinjer=[];

// faktura (ordre) indeholder flere ordrelinjer
class Faktura {
  constructor(navn) {
    this.dato = new Date();
    this.ordrelinjer = [];
    this.fakturanr = fakturanr;
    this.navn = navn;
    fakturaer.push(this);
  }

  addOrdrelinje(orderLinje) {
    // ordrelinje er de enkelte linjer på en faktura
    if (antal >= 1 && produkt instanceof logik.Product) {
      let ordrelinje = orderLinje;
      this.ordrelinjer.push(ordrelinje);
    }
  }
}
class Ordrelinje {
  constructor(produkt, antal) {
    this.produkt = produkt;
    this.antal = antal;
    this.total = antal * produkt.pris;
    this.ordrelinjenr = ordrelinjenr;
    ordrelinjer.push(this)
  }
  
}
// følgeseddel indeholder flere fakturaer (det er dem, som skal sendes til økonomiafdelingen)
class Følgeseddel {
  constructor() {
    // navn på personen som skriver under
    this.dato = new Date();
    this.følgeseddelnr = følgeseddelnr;
    this.fakturaer = [];
    følgesedler.push(this);
  }
  addFaktura(faktura) {
    fakturaer.push(faktura);
  }
  removeFaktura(faktura) {
    let index = fakturaer.indexOf(faktura);
    fakturaer.splice(index, 1);
  }
}
function createFaktura(navn){
  let faktura= new Faktura(navn);
  return faktura
}
function createFølgeseddel(){
  let følgeseddel= new Følgeseddel();
  return følgeseddel
}
function createOrdrelinje(produkt,antal,ordelinjeNr){
let ordrelinje=new Ordrelinje(produkt,antal,ordelinjeNr);
return ordrelinje;
}
export default{Faktura,Følgeseddel,createFaktura,createFølgeseddel,createOrdrelinje}
