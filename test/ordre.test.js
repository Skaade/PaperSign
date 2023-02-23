import assert from 'chai';
import describe from 'mocha';
import logik from '../logik.js';
import ordre from '../ordre.js'

describe('Test af faktura', () => {
    it('oprettelse af faktura', () => {
        let faktura = new ordre.Faktura("Magnus"); //mangler underskrift
        assert.isNotNull(faktura, false);
        assert.equal(faktura.navn, "Magnus");
        assert.equal(faktura.dato.getFullYear(), 2022);
    })

    it('oprettelse af ordrelinjer, på faktura', () => {
        let faktura = new ordre.Faktura("Jens"); //mangler underskrift
        let produktgruppe = logik.createProductgroup("Udklædning", "alt udklædning, til dine kinky tendenser")
        let p1 = new logik.createProduct("Kaninører", 200, 700, 34565653421, "Velysion-Market", "345654", produktgruppe)
        faktura.addOrdrelinje(p1, 2);
        assert.equal(faktura.ordrelinjer.length, 1);
    })
})