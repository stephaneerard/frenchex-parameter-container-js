## parameter-container##

Resolvable parameters container

```
var ParametersContainer = require("@frenchex/parameter-container");

var myParams = new ParametersContainer();

myParams.set("user.home", "/home/me");
myParams.set("user.ssh.config.file", "%user.home%/.ssh/config");

console.dir(myParams.get("user"));

// output

{
    "user": {
        "home": "/home/me",
        "ssh": {
            "config": {
                "file": "/home/me/.ssh/config"
            }
        }
    }
}
```


Thanks to Steven Bazyl for his binder.js code found on google code (see binder.js header)