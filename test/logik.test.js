import assert from 'chai';
import describe from 'mocha';
import logik from '../logik.js';

describe('Test af createProduct', () => {
    let productgroup = null;
    // attributter (navn, pris, antal, EAN, leverandør, bestillingsnummer, produktgruppe) {
    it('createProduct', () => {
        productgroup = logik.createProductgroup("Papir", "papir som er lavet af papir");
        let product = logik.createProduct("A4", 20, 10, 4567890, "Mowgli inc", 932005, productgroup);
        assert.equal(product.navn, "A4");
        assert.equal(product.pris, 20);
        assert.equal(product.antal, 10);
        assert.equal(product.EAN, 4567890);
        assert.equal(product.leverandør, "Mowgli inc");
        assert.equal(product.bestillingsnummer, 932005);
        assert.equal(product.produktgruppe.navn,"Papir");
        assert.equal(product.produktgruppe.beskrivelse,"papir som er lavet af papir");
    })
})
describe('getProduct', () => {
    it('sdfsdgsfgdfghdfgh', () => {
        productgroup = logik.createProductgroup("Bøf", "Ost som er lavet af papir");

        let product2 = logik.createProduct("Hat", 20, 10, 4567890, "Mowgli inc", 932005, productgroup);
        let product3 = logik.createProduct("blyant", 20, 10, 4567890, "Mowgli inc", 932005, productgroup);

        let product = logik.getProduct(000001);
        let productc = logik.getProduct(000002);
        assert.equal(product.varenr, "000001");  
        assert.equal(product.navn, "Hat");  
        assert.equal(productc.varenr, "000002");  
        assert.equal(productc.navn, "blyant");     
    })
    it('getProduct, ud fra varenr - men ikke som string', () => {
        let product = logik.getProduct(000000);
        assert.equal(product.varenr, "000000");  
        assert.equal(product.navn, "A4");      
    })

})
describe('Test af createProductgroup', () => {
    it('createProduktGroup', () => {
        prodgrup2 = logik.createProductgroup("Papir", "papir som er lavet af papir");
        assert.equal(prodgrup2.navn, "Papir");
        assert.equal(prodgrup2.beskrivelse, "papir som er lavet af papir");
    })
})

describe('searchDynamic (Søger produkter og deres produktgrupper) with attribute and value', () => {
    it('find produkt med attribut(pris) og value 20', () => {
        let produktliste = logik.getProducts();
        
        assert.equal(produktliste[0].navn, "A4");
        assert.equal(produktliste[0].pris, 20);
        assert.equal(produktliste[1].navn, "Hat");
        assert.equal(produktliste[1].produktgruppe.navn, "Bøf"); // lavet på linje 23
    })
    it('find produkt med attribut(produktgruppe.navn) og value "papir', () => {
        let produkter = logik.getProducts();
        let soegteProduktgrupper = logik.searchDynamic(produkter, "produktgruppe.navn", "Papir")
        assert.equal(soegteProduktgrupper[0].produktgruppe.navn, "Papir");
        assert.equal(soegteProduktgrupper[0].produktgruppe.beskrivelse, "papir som er lavet af papir");
    })
})

