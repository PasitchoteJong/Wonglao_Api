import axios from "axios";

const LINE_TOKEN_URL = "https://api.line.me/oauth2/v2.1/token";
const LINE_PROFILE_URL = "https://api.line.me/v2/profile";

export const getLineAccessToken = async (code) => {
  const response = await axios.post(
    LINE_TOKEN_URL,
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_url: process.env.LINE_CALLBACK_URL,
      client_id: process.env.LINE_CHANNEL_ID,
      client_secret: process.env.LINE_CHANNEL_SECRET,
    }),
    {
      headers: { "Contect-Type": "application/x-www-form-urlencoded", }
    }
  );
  return response.data;
};

export const getLineProfile = async(accessToken)=>{
  const response = await axios.get(LINE_PROFILE_URL,{
    headers:{Authorization:`Bearer ${accessToken}`}
  });
  return response.data;
}