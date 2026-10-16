import jwt from "jsonwebtoken";
export const generateToken = (id) => {
    console.log("Generating token for user ID:", id);
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
}