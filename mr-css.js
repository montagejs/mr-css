
var Gonzales = require("gonzales");

module.exports = compile;
function compile(module) {
    var css = translate(module.text, module);
    var dependencies = module.dependencies;
    module.factory = function () {
        dependencies.forEach(function (dependency) {
            module.require(dependency);
        });
        var style = document.createElement("style");
        var text = document.createTextNode("/* " + module.id + " */\n" + css);
        style.appendChild(text);
        document.querySelector("head").appendChild(style);
    };
}

function translate(text, module) {
    var input = Gonzales.srcToCSSP(text);
    var dependencies = module.dependencies = module.dependencies || [];
    var output = [input[0]], j = 1;
    for (var i = 1; i < input.length; i++) {
        var term = input[i];
        var match = matchesImport(term);
        if (match) {
            module.dependencies.push(match);
        } else {
            output[j++] = term;
        }
    }
    return Gonzales.csspToSrc(output);
}

function matchesImport(term) {
    term = normalize(term);
    if (term[0] !== "atrules") return;
    var terms = term[1];
    if (!terms) return;
    var atkeyword = terms[0];
    if (atkeyword[0] !== "atkeyword") return;
    var ident = atkeyword[1];
    if (!ident) return;
    if (ident[0] !== "ident") return;
    if (ident[1] !== "import") return;
    var uri = terms[1];
    if (!uri) return;
    uri = normalize(uri);
    if (uri[0] !== "uri") return;
    var uriTerms = uri[1];
    if (!uriTerms || uriTerms.length !== 1) return;
    var raw = uriTerms[0];
    if (!raw) return;
    if (!raw[0] === "raw") return;
    var id = raw[1];
    return id;
}

function normalize(term) {
    return [term[0], term.slice(1).filter(function (term) {
        return term[0] !== "s";
    })];
}

