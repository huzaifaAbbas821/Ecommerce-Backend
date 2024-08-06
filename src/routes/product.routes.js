import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middle.js";
import {upload} from "../middlewares/multer.js"
// import multer from "multer"
import { createProduct, getProduct, deleteProduct , getAllProducts , soldAndRating } from "../controllers/product.controllers.js"

// const upload = multer({dest: "/public/temp"})
const router = Router();

router.route("/all-product").get(getAllProducts);
router.route("/create-product").post(verifyJWT,upload.single("featuredImage"),createProduct);
router.route("/product/:id").get(getProduct);
router.route("/product/:id").delete(verifyJWT,deleteProduct);
router.route("/rating-product").patch(verifyJWT,soldAndRating);
// router.route("/upload").post(upload.single("featuredImage"), async (req,res) => {
//     res.json(req.file?.path);
// })

export default router;