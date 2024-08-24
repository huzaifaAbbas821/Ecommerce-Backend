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

const storage = multer.memoryStorage();

export const upload = multer({ storage });
