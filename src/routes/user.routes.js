import { Router } from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
  refreshAccessToken,
  userChangePassword,
  getCurrentuser,
  changeUserInfo,
  saveProduct,
  watchhistory,
  getSavedProducts,
  getWatchedProducts,
  getAllBuyProducts,
  buyHistory,
  deleteUser
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middle.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);


router.route("/save-product/:id").patch(verifyJWT,saveProduct);
router.route("/change-password").patch(verifyJWT,userChangePassword);
router.route("/change-info").patch(verifyJWT,changeUserInfo);
router.route("/watch-history/:id").patch(verifyJWT,watchhistory);
router.route("/buy-history-add").patch(verifyJWT,buyHistory);


router.route("/user").get(verifyJWT,getCurrentuser);
router.route("/save-product").get(verifyJWT, getSavedProducts);
router.route("/watch-history").get(verifyJWT, getWatchedProducts);
router.route("/buy-history").get(verifyJWT, getAllBuyProducts);



router.route("/delete-account").delete(verifyJWT, deleteUser);

export default router;
