import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      phone: user.phone,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_AUTH_TOKEN || "heregoesyoursecret",
    {
      expiresIn: "30d",
    }
  );
};
