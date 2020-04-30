const types = require('../services/types.service'); 
const supertest = require('supertest');

describe("Utils tests", () => {


    describe("Types test", () => {
        it("Test check_date must be true", () =>{
            const fields = {
                date_test: {
                    type: 'date'
                },
                name: {
                    type: 'string'
                }
            };
            return expect(types.check_date(fields)).resolves.toBe(true);
        });

        it("Test check_date must be false", () =>{
            const fields = {
                date_test: {
                    type: 'string'
                },
                name: {
                    type: 'string'
                }
            };
            return expect(types.check_date(fields)).resolves.toBe(false);
        });
    });

    describe("Length attr test", () => {
        it("Test check_date must be true", () =>{
            const fields = {
                date_test: {
                    type: 'date'
                },
                name: {
                    type: 'string'
                }
            };
            return expect(types.check_length_many(fields)).resolves.toBe(true);
        });

        it("Test check_date must be false", () =>{
            const fields = {
                '@timestamp': {
                    type: 'string'
                },
                date_test: {
                    type: 'string'
                }
            };
            return expect(types.check_length_many(fields)).resolves.toBe(false);
        });
    });
    
});