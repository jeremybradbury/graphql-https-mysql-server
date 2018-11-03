This folder is loaded into the project using a small dependancy here.
Below is an example of how it is used in index.js

```const { log } = app.tools = require('auto-load')('src/tools');```

All the module files are named as functions that match the file name loaded into app.tools from ../tools/log.js to pass tools on the whole application.
Then also extract out log from app.tools.log so it can be used shorthand in the index file.

We could also dereference out from app.tools in other files once the app paramter arrives

```const { generateToken, shuffle, newPass, sendEmail } = app.tools;```

Now we pass around tools and extract out what we need for cleaner code.
