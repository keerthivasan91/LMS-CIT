    const express = require("express");
    const router = express.Router();
    const auth = require("../middleware/authMiddleware");

    const {
    substituteRequestsForUser,
    acceptSubstitute,
    rejectSubstitute
    } = require("../controllers/substituteController");

    router.get("/requests", auth(), substituteRequestsForUser);
    router.post("/accept/:arrangementId", auth(), acceptSubstitute);
    router.post("/reject/:arrangementId", auth(), rejectSubstitute);

    module.exports = router;
