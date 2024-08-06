// import multer from "multer"

// const storage = multer.diskStorage({
//     destination: function (req,file,cb) {
//         cb(null, './public/temp')
//     },
//     filename: (req, file, cb) => {
    
//         cb(null, file.originalname); // Set the filename
//       }
// })

// export const upload = multer({storage : storage})
import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/temp');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // You can customize the filename if needed
  },
});

export const upload = multer({ storage });
