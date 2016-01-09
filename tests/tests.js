var assert = require("assert")
    , Config = require("../index")
    ;

var config = new Config();

var temoin = {
    test: {
        value: {
            world: "Hello %test.value.hello%",
            hello: "world",
            an_array: ["first", "%test.value.world%"],
            deep_obj: {
                i: {
                    am: {
                        very: {
                            deep: "hu"
                        }
                    }
                }
            }
        }
    }
};

config.set("test.value", temoin.test.value);

var result = config.get("test.value");
var resultJsonStr = JSON.stringify(result, null, 4);

var hint =
    `{
    "test": {
        "value": {
            "world": "Hello world",
            "hello": "world",
            "an_array": [
                "first",
                "Hello world"
            ],
            "deep_obj": {
                "i": {
                    "am": {
                        "very": {
                            "deep": "hu"
                        }
                    }
                }
            }
        }
    }
}`;

var equal = hint === resultJsonStr;

if (!equal) {
    console.log("fail", {hint: hint, result: resultJsonStr});
}
else console.log("ok");

// test merge
config.set("test.value", {some: "more"});
console.log(config.bound.target.test.value.some === "more" ? "ok" : "fail");

//test no merge

config.set("test.value", {some: "more"}, false);
console.log(config.bound.target.test.value.hello === "world" ? "fail" : "ok");
