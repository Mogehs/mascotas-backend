const { JWT } = require("google-auth-library");
const axios = require("axios");

const SCOPES = ["https://www.googleapis.com/auth/firebase.messaging"];

const client = new JWT({
  email: "firebase-adminsdk-fbsvc@appmascotas-44762.iam.gserviceaccount.com",
  key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC2QHsc9iHSAIkn\n+lZEaCffoBuCC3Ur+96Zf63YQ7j74pmUFbrWJr5GXMUQtz30Qf5+qrKyT+M/cbgL\nAgY0tBtrIdVhotNGj0a3WAEiXJL+8PPFzxZ1pC9ZMVEzi+XH8hq/d6Jo1SDLqAI4\nwwEskHPXwLPSyBBmzJP+7eTfaNUJU7GNoo/DTrKcRStu/hWe7B8hbu1Ne8yDBJS1\noi0LPLCSiI4gTO2rJcEJmIxUPz0F6Lh4Mbz/66cSPlIoU28OmV9AiESHdez6TE5v\nnBowmgDt2tMJvNMGic4pvCHR22rZXiEMSsFx2x+CofZxHGXgx8dTY0x+OZH09j8M\nvDnduoCnAgMBAAECggEAA/3ylGZRxFNNrcn+dL4hTXUo1RbiKKX6MLuKt8d3+FB0\n07kMIB+2ID1s9ZpF6aE+bVDY3C4CyMN5aAhR0Xq2dQjHLz3NSejegCqVz8ZeU+Y8\nOLN6BvajMN1zLWFdlZ0Yd+QrcwdkEgHqloqy7mJ1nx6x8aZ/MXk+rqFQV5JoxCz/\nEPuiOgdBqy11wy7cP4OxMfhw87mIHa7fVBdX/YRKB/go9ZIKLDEA7fZoeIgyyH7m\nnQckwETBWYyqEY1MbiA1wtkwh421HlJprA7EKMGFxpulVD0+t8SrTOAixWEnX+8D\n9FAbBXGw76wfXxv1wtGqolWNXyM3x9IYJtO/FYUi0QKBgQD52kr3pEWs/FuSsIha\naIoRJt8I4Fi0+X1msfT22Iyh1RIUbhX/ZRLKVFKf4evGYsUxN22OAuZZfzQ80sIH\nTSBUupFO03kBzkidolJOJ4lUIPrhv8jyLGc0+iuqTwAO2izjmTHA0+FYOyDINpMm\nuNCCGD+Ttx3EKwkqpc4xGRFGEQKBgQC6vGbN8xQh/d9DkD/MFmHtlPnWTumEo9Wl\nJhCHogIVStkyUi5qnwgnIdGpOZXWR4fpWZknsToog/exmztFy+FjJToJGSaeTeR7\nqc+Cd94zVLDfkKY4lzDDiEwjbGZqVlQf4GgIz8hP0bQtNNwEbyJvleD83i/hk7wK\n4AmaVM5DNwKBgFTk8ywJyRLp/ENvcCUn+CGzz3y4neuACjfmp5FoKwCh4S7H6PmK\nYkQVOq3Qmcgir1X1u2fRXGt0aU9xXTQV5LJlYhIikK8oZEwLZ2Pe0y6etiAWhjSj\nGb5KcqO/jAl/4FjFKL6YP603CgB9aqpxiYdqrc+HHLoW1VqEU/ciyVfBAoGAalP+\n4cRIsXZCW9FWUlpoVoTeocX7N9imPUxoWyLHtuIQvJOI9JMrbETYglhU1leSry+i\ngrRqnklOj+YJIRwPcYnv+uBEWh2WPUga7XpdnrLZp+NQkqacUKpaWE1QH7qaWjBI\nbMQLlk+dHaScpzW00P7xxmqprvOVPkgFj8g8To8CgYBXHqRpP5i5uAEReufdZywF\ng35HdY9WznKC7axRbK/0+fmxDy/to+3d9q6wIkbxpDFBSlnT3sirMXKhSQoaJjid\nVRm+cbI/Jui9zsnpdMR7/RbrrWyVW0ZBDVea64jNuBdrPsyLK+Hy2wirEDtL0UtN\n/Zc5D2IGUO8Z159eje6aIQ==\n-----END PRIVATE KEY-----\n",
  scopes: SCOPES,
});

const sendPushNotification = async (deviceToken, notification) => {
  const tokens = await client.authorize();
  const message = {
    token: deviceToken,
    notification: {
      title: notification.title,
      body: notification.body,
    },
    data: {
      type: "reminder",
    },
  };

  const headers = {
    Authorization: `Bearer ${tokens.access_token}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.post(
      "https://fcm.googleapis.com/v1/projects/appmascotas-44762/messages:send",
      { message },
      { headers }
    );
    console.log("Notification sent:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error sending notification:",
      error.response?.data || error.message
    );
    throw error;
  }
};

module.exports = {
  sendPushNotification,
};
