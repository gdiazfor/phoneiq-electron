# PhoneIQ Electron

- `package.json` - Points to the app's main file and lists its details and dependencies.
- `main.js` - Starts the app and creates a browser window to render website. This is the app's **main process**.
- `index.html` - A web page to render. This is the app's renderer process.
- `assets/` - Assets for the project (style, scripts)
- `resources/` - Project icons

## Usage

To run this repository you'll need [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone repository
$ git clone https://github.com/gdiazfor/phoneiq-electron

# Navigate to project
$ cd phoneiq-electron

# Instal dev dependencies and npm & yarn addon packages
$ npm install

# Instal yarn (if necessary)
$ yarn

# Run the app
$ npm start
```


### Set project URL

https://anakin.xentricqa.com:4434/?sf=ok
https://test.xentricqa.com:4433/?sf=ok
http://app.getzero.co/

You just need to change the `src` attribute of the `webview` in `index.html` file to display the url you want in your webview.


### Electron packager

"[Electron Builder](https://www.electron.build/) is a command line tool and Node.js library that bundles Electron-based application source code with a renamed Electron executable and supporting files into folders ready for distribution."

```bash
$ yarn dist

```
### Open developer tools for the webview

Paste this line in the main process' devTools.

```bash
$("#webview")[0].openDevTools();
```


## Source

Based on:

- [Electron Packager tutorial](https://www.christianengvall.se/electron-packager-tutorial/)
- [Browser](https://github.com/hokein/electron-sample-apps/tree/master/webview/browser)
- [Printing](https://github.com/hokein/electron-sample-apps/tree/master/printing)

## License

[MIT](LICENSE.md)
