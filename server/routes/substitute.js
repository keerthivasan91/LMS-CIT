    const express = require("express");
    const router = express.Router();
    const sessionAuth = require("../middleware/authMiddleware");

    const {
    substituteRequestsForUser,
    acceptSubstitute,
    rejectSubstitute,
    getBlockedDates
    } = require("../controllers/substituteController");

    router.get("/requests",sessionAuth(), substituteRequestsForUser);
    router.get("/blocked-dates", sessionAuth(), getBlockedDates);
    router.post("/accept/:arrangementId", sessionAuth(), acceptSubstitute);
    router.post("/reject/:arrangementId", sessionAuth(), rejectSubstitute);

    module.exports = router;
