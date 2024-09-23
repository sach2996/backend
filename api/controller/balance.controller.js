const balanceService = require("../services/balance.service");

const getBalance = async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res
      .status(400)
      .json({ message: "Missing required fields: username" });
  }

  try {
    const balance = await balanceService.getBalance(username);

    res.status(200).json({
      message: "Balance retrived successfully",
      balance,
    });
  } catch (error) {
    console.error("Error retrieving balance:", error.message);
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getBalance };
