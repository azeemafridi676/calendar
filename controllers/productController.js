const testApi = (req, res) => {
    res.status(200).json({
        success: true,
        message: "saad api is working"
    });
};

module.exports = {
    testApi
}; 