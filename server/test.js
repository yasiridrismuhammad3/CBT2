const mongoose = require("mongoose");

const uri =
    "mongodb+srv://yasiridrismuhammad3_db_user:DamaleCBT2026@cluster0.qqu3ojs.mongodb.net/damale_cbt?retryWrites=true&w=majority&appName=Cluster0";

mongoose
    .connect(uri)
    .then(() => {
        console.log("✅ Connected successfully!");
        process.exit(0);
    })
    .catch((err) => {
        console.error("❌ Connection Error:");
        console.error(err);
        process.exit(1);
    });