import { createConnection } from "typeorm";
import { ReportType } from "./entity/ReportType";

export const populateDB = async () => {
  await createConnection();

  // TODO: Come up with final report types
  const reportTypes = [
    "Spam",
    "Did not give right content",
    "Plagirized work",
    "Bullying or harassment",
    "Other",
  ].map((name) => {
    const reportType = new ReportType();
    reportType.name = name;
    return reportType.save();
  });

  await Promise.all(reportTypes);
};

(async () => {
  try {
    await populateDB();
    console.log("Successfully added initial data");
  } catch (err) {
    console.log("There was an error adding initial data");
    console.log(err);
  } finally {
    process.exit();
  }
})();
