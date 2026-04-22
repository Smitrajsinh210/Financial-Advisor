import "dotenv/config";
import app from "./src/app.js";
import initDatabase from "./src/config/db.js";
import { scheduleFamilySummaryJob } from "./src/services/familySummaryService.js";

const port = process.env.PORT || 5000;

initDatabase()
  .then(() => {
    scheduleFamilySummaryJob();
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Database initialization failed:", error.message);
    process.exit(1);
  });
