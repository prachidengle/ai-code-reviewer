const aiService = require("../services/ai.service");

module.exports.getReview = async (req, res) => {
    const code = req.body?.code;

    if (!code || typeof code !== "string") {
        return res.status(400).send("Please provide code to review.");
    }

    try {
        const response = await aiService(code);
        return res.status(200).send(response);
    } catch (error) {
        console.error("Code review failed:", error.status, error.message);

        if (error.status === 429) {
            return res.status(429).send(
                "Gemini rate limit reached. Wait about 60 seconds, then try again."
            );
        }

        if (error.status === 503) {
            return res.status(503).send(
                "Gemini is temporarily busy. Please try again shortly."
            );
        }

        return res.status(500).send(
            "Code review failed. Check the backend terminal for details."
        );
    }
};