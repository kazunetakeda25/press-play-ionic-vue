const fs = require("fs");

class TempFiles {
  constructor() {
    this.directories = [];
    this.files = [];
  }

  addDirectory(path) {
    if (this.directories.indexOf(path) === -1) {
      this.directories.push(path);
    }
  }

  addFile(path) {
    if (this.files.indexOf(path) === -1) {
      this.files.push(path);
    }
  }

  clean() {
    // Handle files first
    this.files.forEach(path => {
      if (fs.existsSync(path)) {
        fs.unlinkSync(path);
      }
    });
    // Handle directories last
    this.directories.forEach(path => {
      this.deleteFolderRecursive(path);
    });
  }

  deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach(file => {
        var curPath = path + "/" + file;
        if (fs.lstatSync(curPath).isDirectory()) {
          // recurse
          this.deleteFolderRecursive(curPath);
        } else {
          // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  }
}

module.exports = new TempFiles();
