import unirest from "unirest";

export const sendText = async ({ otp, numbers }) => {
  const request = unirest("GET", "https://www.fast2sms.com/dev/bulkV2");

  request.query({
    authorization: process.env.FAST_2_SMS_API,
    variables_values: otp.toString(),
    route: "otp",
    numbers,
  });

  request.headers({
    "cache-control": "no-cache",
  });

  request.end(function (res) {
    if (res.error) {
      throw new Error(res.error);
    }
  });
};
