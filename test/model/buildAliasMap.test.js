var bam = require("../../src/scripts/model/buildAliasMap"),
    chai = require("chai"),
    expect = require("chai").expect,
    compileModel = require("../../src/scripts/model/buildModelGraph"),
    graph = require("../data/mixed-graph.json"),
    model = compileModel(graph);

describe("getAliasMap", function() {
    it("should have own aggregate relations", function() {
        expect(bam(model["Organization"]).Organizations).to.eql("Organization");
        expect(bam(model["Organization"]).Persons).to.eql("Person");
        expect(bam(model["Organization"]).RefIndustry).to.eql("RefIndustry");
    });

    it("should contain all aggregate relations in the inheritance chain", function() {
        expect(bam(model["Entity"])).to.eql({
            "ExternalLinks": "ExternalLink",
            "ContactValues": "ContactValue",
            "ExternalEntity": "ExternalEntity"
        });

        expect(bam(model["ExternalEntity"])).to.eql({
            "ExternalLinks": "ExternalLink",
            "ContactValues": "ContactValue",
            "Person": "Person",
            "Entity": "Entity",
            "Organization": "Organization"
        });

        expect(bam(model["Organization"])).to.eql({
            "ExternalLinks": "ExternalLink",
            "ContactValues": "ContactValue",
            "ExternalEntity": "ExternalEntity",
            "Persons": "Person",
            "ParentOrganization": "Organization",
            "RefIndustry": "RefIndustry",
            "Organizations": "Organization"
        });
    });

    it("should not have the distant ancestor relation", function() {
        expect(bam(model["Organization"])).to.not.have.property("Entity");
    });
});
