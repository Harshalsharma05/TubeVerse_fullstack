import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname)
  }
})

export const upload = multer({ 
    storage,
})

// The storage refers to the custom storage configuration you defined earlier using multer.diskStorage(...). It tells Multer where and how to store uploaded files on disk—specifically the destination folder and filename format.

// This object is passed into multer({...}) to configure the upload behavior. Without specifying storage, Multer would use its default in-memory storage, which is not suitable for saving files to disk.
// So, this line ties your custom disk storage settings into Multer's upload process.

// Notes:
// The cb is a callback function:
// It takes two arguments: error and destination.
// cb(null, '/tmp/my-uploads') means:
// No error (null)
// Save the file in the '/tmp/my-uploads' directory.