import createHttpError from "http-errors";
import {
    getLineAccessToken,
    getLineProfile
} from "../services/line.service.js";
import {
    findUserByLineId,
    createUser
} from "../services/user.service.js";
import {
    generateToken,
    verifyToken
} from "../utils/jwt.js";

export const lineCallback = async (req, res, next) => {
    // console.log("callback")
    // console.log("Query:", req.query)

    try {

        const { code, state } = req.query;
        // console.log("Test Code:", code)
        // console.log("Callback:", process.env.LINE_CALLBACK_URL);

        if (!code) {
            return res.status(400).json({
                message: "LINE authorization code is missing"
            })
        }

        const tokenData = await getLineAccessToken(code);
        // console.log("Token:", tokenData)

        const profile = await getLineProfile(tokenData.access_token);
        // console.log("profile from authcontroller:", profile)


        const user = await findUserByLineId(profile.userId);
        console.log("User:", user);



        if (user) {
            const payloadToken = {
                userId: user.Id,
                lineUserId: user.LineUserId
            }
            const token = generateToken(payloadToken, "14d");



            return res.redirect(
                `http://localhost:5173/login-success?token=${token}`
            );
        }



        const payloadRegisterToken = {
            lineUserId: profile.userId,
            displayName: profile.displayName,
            profileImage: profile.pictureUrl
        }

        const registerToken = generateToken(payloadRegisterToken, "10m");

        return res.redirect(
            `http://localhost:5173/register-line?token=${registerToken}`
        )

    } catch (error) {
        console.error(
            "LINE Authentication Error:",
            error.response?.data || error.message
        );
        return res.status(500).json({
            message: "LINE authentication failed"
        });
    }
};

export const registerLine = async (req, res, next) => {
    try {
        const { registerToken, email, birthDay, promtpay } = req.body;
        const qrPayment = req.file;

        console.log("BODY:", req.body);
        console.log("FILE:", req.file);

        if (!registerToken) {
            return res.status(400).json({
                message: "Register token is required"
            })
        };

        let lineData;

        try{
            lineData = verifyToken(registerToken)
        // const lineData = jwt.verify(registerToken, process.env.JWT_SECRET)
        }catch(error){
            throw createHttpError(401,"Invalid or expired register token")
        }
        console.log("lineData:", lineData)

        if (!qrPayment && !promtpay) {
            return res.status(400).json({
                message: "QRPayment or Promtpay is required"
            })
        };

        const existingUser = await findUserByLineId(lineData.lineUserId)

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            })
        };


        const user = await createUser({
            lineUserId: lineData.lineUserId,
            displayName: lineData.displayName,
            profileImage: lineData.profileImage,
            email,
            birthDay: new Date(birthDay),
            qrPayment,
            promtpay
        });


        const payloadToken = {
            userId: user.Id,
            lineUserId: user.LineUserId
        }
        const token = generateToken(payloadToken,"14d")


        return res.status(201).json({
            message: "Registration successful",
            token,
            user
        });
    } catch (error) {
        console.error("Line Register Error:", error)

        next(error.status ? error : createHttpError(500,"Registration failed"));
    }

};



