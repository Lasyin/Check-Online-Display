# Check-Online-Display
Check-Online-Display displays the data gathered by Check-Online in a NodeJS website.

**IMPORTANT**
* This script displays the results of [Check-Online which can be found here.](https://github.com/Lasyin/Check-Online) Therefore, it is required
before running this script.

## Getting Started
Download
```
git clone https://github.com/Lasyin/Check-Online-Display.git
```

Install Prerequisites
```
npm install
```

Edit Script
In file 'app.js' in function 'fetchCheckOnlineData' in variable 'options', change 'scriptPath' to point to the folder housing the script.
So, if your script was stored in a folder called 'Check-Online-Display' on
your desktop, the edit would be...
```
var options = {
  ...
  scriptPath: /Path/to/desktop/Check-Online-Display
  ...
}
```

Launch
```
npm start
```

View Results
```
localhost:3005
```

### Prerequisites
* [NodeJS](https://nodejs.org/en/)
* [Express](https://expressjs.com/)
* Optional: [Prettyjson](https://www.npmjs.com/package/prettyjson)
* [Python-Shell](https://www.npmjs.com/package/python-shell)
* [Socket.io](https://socket.io/)

### Author
Bryan Collins
