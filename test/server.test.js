import assert from 'chai';
import describe from 'mocha';
import server from '../server.js';
import logik from '../logik.js'

describe('hooks', function () {
    before(function () {
        // runs before all tests in this file regardless where this line is defined.
        let productgroup1 = logik.createProductgroup("Bøf", "Bøf som er lavet af papir", 1);
        let productgroup2 = logik.createProductgroup("Papir", "Papir som er lavet af bøf", 2);
        let productgroup3 = logik.createProductgroup("Ost", "Ost som er lavet af savsmuld", 3);
        //
        let product11 = logik.createProduct("Hat", 34, 655456, "Mowgli inc", 2344432, 1, 101);
        let product12 = logik.createProduct("Blyant", 645, 4354358, "Børge inc", 878769, 1, 103);
        let product13 = logik.createProduct("Mad", 7675, 89798, "Mad A/S", 345234, 1, 105);
        //
        let product21 = logik.createProduct("Kuglepind", 312, 6655, "Børge inc", 3432432, 2, 102);
        let product22 = logik.createProduct("Pensel", 2343, 4324, "Børge inc", 546564, 2, 106);
        let product23 = logik.createProduct("Bil", 234234, 23446, "Mowgli inc", 876868, 2, 107);
        let product24 = logik.createProduct("Kage", 234324, -2, "Mad A/S", 345435, 2, 109);
        //
        let product31 = logik.createProduct("Pizza", 3545, 87987, "Mad A/S", 767678, 3, 104);
        let product32 = logik.createProduct("Pap", 234, 45665, "Mowgli inc", 32436565, 3, 108);
        let product33 = logik.createProduct("Glaskolbe", 324, 4644, "Mowgli inc", 4345676, 3, 110);
        let product34 = logik.createProduct("Katon", 76576, 34534, "Mowgli inc", 767645, 3, 111);
        let product35 = logik.createProduct("Fjerpind", 4234, 4, "Børge inc", 43445765, 3, 113);
        //
        let products = [];
        //
        products.push(product11);
        products.push(product12);
        products.push(product13);
        //
        products.push(product21);
        products.push(product22);
        products.push(product23);
        products.push(product24);
        //
        products.push(product31);
        products.push(product32);
        products.push(product33);
        products.push(product34);
        products.push(product35);
        //
        let productGroups = [];
        //
        productGroups.push(productgroup1);
        productGroups.push(productgroup2);
        productGroups.push(productgroup3);
    });
    after(function () {
        // runs after all tests in this file
    });
    beforeEach(function () {
        // runs before each test in this block
    });
    afterEach(function () {
        // runs after each test in this block
    });

    // test cases
    describe('Test of searchProductByGroupNr', () => {
        it('searchProductByGroupNr', () => {
            let seachcase1 = server.searchProductByGroupNr(1)
            let seachcase2 = server.searchProductByGroupNr(2)
            let seachcase3 = server.searchProductByGroupNr(3)
            //
            let seachcase4 = server.searchProductByGroupNr('visalt')
            //
            assert.equal(seachcase1.length, 3);
            assert.equal(seachcase1[0], product11)
            assert.equal(seachcase1[1], product12)
            assert.equal(seachcase1[2], product13)
            //
            assert.equal(seachcase2.length, 4);
            assert.equal(seachcase2[0], product21)
            assert.equal(seachcase2[1], product22)
            assert.equal(seachcase2[2], product23)
            assert.equal(seachcase2[3], product24)
            //
            assert.equal(seachcase3.length, 5);
            assert.equal(seachcase3[0], product31)
            assert.equal(seachcase3[1], product32)
            assert.equal(seachcase3[2], product33)
            assert.equal(seachcase3[3], product34)
            assert.equal(seachcase3[4], product35)
            //
            assert.equal(seachcase4.length, (seachcase1.length + seachcase2.length + seachcase3.length));
            assert.equal(seachcase4[0], product11)
            assert.equal(seachcase4[1], product12)
            assert.equal(seachcase4[2], product13)
            assert.equal(seachcase4[3], product21)
            assert.equal(seachcase4[4], product22)
            assert.equal(seachcase4[5], product23)
            assert.equal(seachcase4[6], product24)
            assert.equal(seachcase4[7], product31)
            assert.equal(seachcase4[8], product32)
            assert.equal(seachcase4[9], product33)
            assert.equal(seachcase4[10], product34)
            assert.equal(seachcase4[11], product35)
        })
    })
    describe('addToKurv', () => {
        it('addToKurv', () => {
            //TODO add total 
            let kurv = server.kurv

            //case without discount
            server.addToKurv(13, product12.produktNr, product12.navn, product12.pris)
            server.addToKurv(17, product22.produktNr, product22.navn, product22.pris)
            server.addToKurv(9, product32.produktNr, product32.navn, product32.pris)
            assert.equal(kurv[0], { produktNr: product12.produktNr, antal: 13, navn: product12.navn, pris: product12.pris });
            assert.equal(kurv[1], { produktNr: product22.produktNr, antal: 17, navn: product22.navn, pris: product22.pris });
            assert.equal(kurv[2], { produktNr: product32.produktNr, antal: 9, navn: product32.navn, pris: product32.pris });
            assert.equal(kurv[0].total, (13 * product12.pris));
            assert.equal(kurv[1].total, (17 * product22.pris));
            assert.equal(kurv[2].total, (9 * product32.pris));

            //case with discount first
            server.addToKurv(5, product33.produktNr, product33.navn, product33.pris)
            assert.equal(kurv[3], { produktNr: product33.produktNr, antal: 5, navn: product33.navn, pris: product33.pris });
            assert.equal(kurv[3].total, (5 * product33.pris));
            //discount
            kurv[3].pris = 20
            kurv[3].total = Number(kurv[3].pris) * Number(kurv[3].antal)
            assert.equal(kurv[3].pris, 20);
            assert.equal(kurv[3].total, (5 * 20));
            //add same item to cart expect to have new pris, new amount, new total and no new index
            server.addToKurv(3, product33.produktNr, product33.navn, product33.pris)
            assert.equal(kurv[3], { produktNr: product33.produktNr, antal: 8, navn: product33.navn, pris: 20 });
            assert.equal(kurv[3].total, (8 * 20));
            assert.equal(kurv.length, 4);
            assert.equal(kurv[4], undefined);

            //case with discount after
            server.addToKurv(7, product34.produktNr, product34.navn, product34.pris)
            assert.equal(kurv[4], { produktNr: product34.produktNr, antal: 7, navn: product34.navn, pris: product34.pris });
            assert.equal(kurv[4].total, (7 * product34.pris));
            
            //add same item to cart expect to have same pris, new amount, new total and no new index
            server.addToKurv(3, product34.produktNr, product34.navn, product34.pris)
            assert.equal(kurv[4], { produktNr: product34.produktNr, antal: 8, navn: product34.navn, pris: product34.pris });
            assert.equal(kurv[4].antal, (7+3));
            assert.equal(kurv[4].total, (10 * product34.pris));
            assert.equal(kurv.length, 5);
            assert.equal(kurv[5], undefined);
            //discount expect to have new pris, no new amount, new total and no new index
            kurv[4].pris = 30
            kurv[4].total = Number(kurv[4].pris) * Number(kurv[4].antal)
            assert.equal(kurv[4].pris, 30);
            assert.equal(kurv[4].total, (10*30));
            assert.equal(kurv[4].antal, 10);
            assert.equal(kurv.length, 5);
            assert.equal(kurv[5], undefined);

        })
    })
    describe('sumTotal', () => { //gets called on addToKurv (not when given manual discount)
        it('sumTotal', () => {
            let total = server.total
            sumTotal();
            // expected sum of cart to be the sum of each cart items total
            assert.equal(total, (kurv[0].total+kurv[1].total+kurv[2].total+kurv[3].total+kurv[4].total));
        })
    })

    describe('lagerStatus', () => {
        //returns a list of products with a storage amount of 5 or less
        it('lagerStatus', () => {
            let ls = lagerStatus();
            assert.equal(ls[0], product13);
            assert.equal(ls[1], product35);
            assert.equal(ls.length, 2);
        })
    })
    describe('sumTotal', () => { //gets called on addToKurv (not when given manual discount)
        it('sumTotal', () => {
            let total = server.total
            sumTotal();
            // expected sum of cart to be the sum of each cart items total
            assert.equal(total, (kurv[0].total+kurv[1].total+kurv[2].total+kurv[3].total+kurv[4].total));
        })
    })
    describe('sumTotal', () => { //gets called on addToKurv (not when given manual discount)
        it('sumTotal', () => {
            let total = server.total
            sumTotal();
            // expected sum of cart to be the sum of each cart items total
            assert.equal(total, (kurv[0].total+kurv[1].total+kurv[2].total+kurv[3].total+kurv[4].total));
        })
    })
    describe('sumTotal', () => { //gets called on addToKurv (not when given manual discount)
        it('sumTotal', () => {
            let total = server.total
            sumTotal();
            // expected sum of cart to be the sum of each cart items total
            assert.equal(total, (kurv[0].total+kurv[1].total+kurv[2].total+kurv[3].total+kurv[4].total));
        })
    })
});








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

// function getOrdre(ordreID) {
//     console.table(ordrer);
//     console.log(ordrer[0].docID);
//     for (let i = 0; i < ordrer.length; i++) {
//         if (ordrer[i].docID == ordreID) {
//             return ordrer[i];
//         }
//     }
// }

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