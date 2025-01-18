import User from '../models/userModel.js';

export const signup = async (req, res) => {
    try {
        const { userDetails } = req.body;
        console.log(userDetails, "userDetails");

        if (!userDetails) {
            return res.status(400).json({ error: 'User details required' });
        }

        // Check if user exists
        let user = await User.findOne({ googleId: userDetails.googleId });

        if (user) {
            return res.status(200).json({ message: "User already exists" });
        }

        // Create new user
        const newUser = new User({
            name: userDetails.name,
            email: userDetails.email,
            picture: userDetails.picture,
            googleId: userDetails.googleId
        });

        await newUser.save();
        console.log("Data saved");
        res.status(200).json({ message: "User Signed Up Successfully" });

    } catch (error) {
        console.error("Error in signup:", error);
        res.status(500).json({ error: 'An error occurred' });
    }
};
