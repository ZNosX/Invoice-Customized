# HTML Invoice Generator

This Invoice Generator will easily transform your HTML invoice template in fully functional invoice editor.

## Setup

To make changes to the generator you'll need Node.js with npm so make sure it is installed on your machine. After this install grunt command line tool globally with:

`npm install -g grunt-cli`

And from the project's root install the dependencies with:

`npm install`

### Development
For easier development you can watch all files for changes and use auto livereload with the default task `grunt`.

### Build

To build the generator just run `grunt dev` or `grunt prod` on the command line. Those will produce fully functional template and generator files in the `dist` folder. The production version will produce minimized JavaScript and CSS files unlike the development version which is meant for easier debugging.

## Supported browsers

The generator script is tested and confirmed that is fully functional in:

* Chrome
* Firefox
* Safari 6+
* Opera 15+
* Internet Explorer 10+