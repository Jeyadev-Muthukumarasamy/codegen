import express from 'express'
;
import {verifyToken }from "../controller/Verify.js"
import {signup} from "../controller/userController.js"
import { deleteProject, postCode, sendCode, sendCodeById, setShowCaseToTrue, updateCode, updatedCode } from '../controller/codeController.js';
import { getShowCase } from '../controller/showController.js';



export const router = express.Router()

router.post("/verifyToken", verifyToken);
router.post("/signup", signup); // Fix: Import controller function directly
router.post("/postCode",postCode)
router.get("/sendCode",sendCode)
router.get("/sendCodeById",sendCodeById)
router.get("/getShowCase",getShowCase)
router.put("/setShowCase",setShowCaseToTrue)
router.delete("/deleteProject",deleteProject)
router.post("/updateCodeById",updateCode)


router.put("/changeshow/:id", updatedCode)
