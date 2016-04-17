var chai = require("chai"),
    expect = require("chai").expect,
    db = require("../src/scripts")(require("./test-graph.json"));

describe("immutability", function() {
    var pData = {
            entity_id: 11,
            first_name: "Sebastien",
            last_name: "Daniel",
            gender: "m",
            created_by: 1,
            created_on: "2015-01-01T12:30:59"
        },
        p = db.Person.post(pData);

    it("should silently ignore property changes", function() {
        "use strict";

        expect(p.first_name).to.eql("Sebastien");
        expect(p.id).to.eql(11);

        p.first_name = "Bobby";
        p.id = 22;

        expect(p.first_name).to.eql("Sebastien");
        expect(p.id).to.eql(11);
    });

    it("should create a new data object on PUT", function() {
        expect(p).to.eql(p);

        var p2 = db.Person.put({
            first_name: "Bobby",
            last_name: "McGinnee"
        }, 11);

        expect(p).to.not.eql(p2);
        expect(db.Person.get(11).first_name).to.eql("Bobby");
        expect(db.Person.get(11).last_name).to.eql("McGinnee");
        expect(db.Person.get(11).gender).to.eql("m");
        expect(db.Person.get(11).created_by).to.eql(1);
        expect(db.Person.get(11).created_on).to.eql("2015-01-01T12:30:59Z");
    });

    it("identical GET should return the same reference", function() {
        expect(db.Person.get()).to.equal(db.Person.get());
        expect(db.Person.get(11)).to.equal(db.Person.get(11));
    });

    it("should create a new collection on POST", function() {
        var pastAll = db.Person.get(),
            pastSpecific = db.Person.get(11);

        db.Person.post({
            entity_id: 22,
            first_name: "Kelly",
            last_name: "Parnia",
            gender: "f",
            created_by: 1,
            created_on: "2015-02-02T12:22:22"
        });

        expect(db.Person.get()).to.not.equal(pastAll);
        expect(db.Person.get(11)).to.equal(pastSpecific);
    });

    it("should create a new collection on PUT", function() {
        var past = db.Person.get();

        db.Person.put({
            first_name: "ginette"
        }, 11);

        expect(past).to.not.equal(db.Person.get());
    });

    it("should look in data bundle if no pkValue is provided", function() {
        var p2 = db.Person.put({
            entity_id: 11,
            first_name: "Majin",
            last_name: "Buu"
        });

        expect(p).to.not.eql(p2);
        expect(db.Person.get(11).first_name).to.eql("Majin");
        expect(db.Person.get(11).last_name).to.eql("Buu");
        expect(db.Person.get(11).gender).to.eql("m");
        expect(db.Person.get(11).created_by).to.eql(1);
        expect(db.Person.get(11).created_on).to.eql("2015-01-01T12:30:59Z");
    });

    it("should change a child's prototype if the prototype is PUT", function() {
        db.Entity.put({
            id: 11,
            deleted: 1
        });

        expect(db.Person.get(11).deleted).to.equal(1);
    });

    it("an entry should dispatch \"Put\" to it's prototype if necessary", function() {
        db.Person.put({
            entity_id: 11,
            deleted_on: "2015-01-01 12:00:00"
        });

        expect(db.Entity.get(11).deleted_on).to.equal("2015-01-01T12:00:00Z");
    });

    it("should not refer to creation data when getting value", function() {
        var p3 = {
            entity_id: 12,
            first_name: "Seb",
            last_name: "Dan",
            gender: "m",
            created_by: 1,
            created_on: "2015-01-01T12:30:59"
        };

        db.Person.post(p3);
        expect(db.Person.get(12).first_name).to.eql("Seb");
        p3.first_name = "Mike";
        expect(db.Person.get(12).first_name).to.eql("Seb");
    });
});
