import { getLineAccessToken } from "../services/line.service.js";

export const lineCallback = async (req, res) => {
    try {
        const { code, state } = req.query;

        if (!code) {
            return res.status(400).json({
                message: "LINE authorization code is missing"
            })
        }

        const tokenData = await getLineAccessToken(code);

        const profile = await getLineProfile(tokenData.access_token);
        console.log("profile from authcontroller:", profile)


        return res.json({
            message: "LINE authentication successful",
            user: {
                lineUserId: profile.userId,
                displayName: profile.displayName,
                profileImage: profile.pictureURL
            }
        })
    } catch (error) {
        console.error(
            "LINE Authentication Error:",
            error.response?.data || error.message
        );
        return res.status(500).json({
            message:"LINE authentication failed"
        });
    }
};



