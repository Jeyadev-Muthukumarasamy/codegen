import Code from "../models/Codemodel.js";
export const getShowCase = async (req, res) => {
    try {
        console.log("here")
        const { email } = req.query;  // Get email from query parameter
        console.log(email)

        if (!email) {  // Check if email is missing
            return res.status(400).json({ error: "Email is required" });  // Return 400 if email is missing
        }

        // Find showcase projects for a specific user
        const response = await Code.find({ showcase: true, email });
        console.log(response, "here")
        console.log(response, "response")

        if (response.length === 0) {
            return res.status(404).json({ message: "No showcase projects found for this user" });
        }

        res.status(200).json({
            message: "Successfully fetched data",
            data: response
        });
    } catch (error) {
        console.error("Error fetching showcase projects:", error);
        res.status(500).json({ error: "An error occurred while fetching showcase projects" });
    }
};
