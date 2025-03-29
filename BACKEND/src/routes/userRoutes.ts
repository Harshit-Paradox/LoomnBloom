import express from "express";
import userRepository from "../Repository/userRepository.js";
import AuthRepository from "../Repository/AuthRepository.js";
import { uploadUserProfilePhoto } from "../Repository/multer.js";


const router = express.Router();

router.post('/signup', AuthRepository.signup);
router.post( '/login', AuthRepository.login );
router.get('/logout', AuthRepository.protect,AuthRepository.logout);

router.get('/profile',AuthRepository.protect,userRepository.getMe,userRepository.getUserById)
router.patch('/profile',AuthRepository.protect,userRepository.getMe,userRepository.updateUserById)
router.patch('/profile/img',AuthRepository.protect,userRepository.getMe,uploadUserProfilePhoto,userRepository.updateProfilePhoto)
router.get('/',userRepository.getAllUser);
router.get('/:userId',userRepository.getUserById);
router.post('/',userRepository.createUser);
router.patch('/:userId',userRepository.updateUserById);
router.delete('/:userId',userRepository.deleteUserById);


export default router;