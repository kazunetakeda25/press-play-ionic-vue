const os = require("os");
const path = require("path");
const sharp = require("sharp");

const tempFiles = require("./tempFiles");

class Avatar {
  constructor() {
    this.thumbDimensions = [
      {
        size: "xl",
        width: 256,
        height: 256
      },
      {
        size: "lg",
        width: 128,
        height: 128
      },
      {
        size: "md",
        width: 64,
        height: 64
      },
      {
        size: "sm",
        width: 48,
        height: 48
      },
      {
        size: "xs",
        width: 32,
        height: 32
      }
    ];
    this.thumbPrefix = "-t-";
  }

  // Returns a plain object for avatar storage in Firestore
  getObject() {
    return {
      original: "",
      xl: "",
      lg: "",
      md: "",
      sm: "",
      xs: ""
    };
  }

  // Get local avatar temp files and directories
  getTempAssets(filePath) {
    const tempLocalFile = path.join(os.tmpdir(), filePath);
    return {
      fileDir: path.dirname(filePath),
      fileName: path.basename(filePath),
      tempLocalFile: tempLocalFile,
      tempLocalDir: path.dirname(tempLocalFile)
    };
  }

  // Get local avatar thumb temp files and directories
  getThumbTempAssets(filePath, dimension) {
    const { fileDir, fileName } = this.getTempAssets(filePath);
    const thumbFilePath = path.normalize(
      path.join(fileDir, this.getThumbPath(fileName, dimension))
    );
    return {
      thumbFilePath: thumbFilePath,
      tempLocalThumbFile: path.join(os.tmpdir(), thumbFilePath)
    };
  }

  // Gets avatar thumb dimension string
  getThumbDimensions(dimension) {
    return `${dimension.width}x${dimension.height}`;
  }

  // Gets an avatar thumb path string
  getThumbPath(filename, dimension) {
    return `${filename}${this.thumbPrefix}${this.getThumbDimensions(
      dimension
    )}`;
  }

  // Resize avatar by file path
  async resize(filePath, contentType) {
    const { tempLocalFile } = this.getTempAssets(filePath);
    let files = [];

    // Cycle through thumbnail dimensions
    await Promise.all(
      this.thumbDimensions.map(async dimension => {
        // File and directory paths.
        const { tempLocalThumbFile } = this.getThumbTempAssets(
          filePath,
          dimension
        );

        // Generate thumbnail using sharp
        await sharp(tempLocalFile)
          .resize({ width: dimension.width, height: dimension.height })
          .toFile(tempLocalThumbFile);

        files.push({
          local: tempLocalThumbFile,
          remote: this.getThumbPath(filePath, dimension),
          contentType: contentType,
          size: dimension.size
        });

        // Add to temp files list
        tempFiles.addFile(tempLocalThumbFile);
      })
    );
    return files;
  }
}

module.exports = new Avatar();
