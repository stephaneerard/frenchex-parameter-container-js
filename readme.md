## parameter-container##

The main goal of this module is to provide developers an object with ```.get()``` and ```.set()``` methods that can resolve parameters when ```.get()```'*ing*a fragment of the object by the mean of a path.

Basically, resolving parameters
```
"path": "%user.home%/.ssh/config"
```

means will ```.get()``` will resolve first the value for ```%user.home%``` before concatenating it with ```/.ssh/config```

*detailed example*
```
var params = require("@frenchex/parameter-container");

params.set("", {
	"user": {
		"home": "/home/me/",
		"ssh": {
			"config":  {
				"path": "%user.home%/.ssh/config"
			}
		}
	}
});

var userHome = params.get("user.home");
var sshConfigFilePath = params.get("user.ssh.config.path");
	// returns "/home/me/.ssh/config"

```

```.set()``` method will merge an object with given value if it already exists until you asks not to by providing
```false``` as a third parameter to the ```.set()``` call.


Thanks to Steven Bazyl for his binder.js code found on google code (see binder.js header)