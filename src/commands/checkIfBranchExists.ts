import ora from "ora";
import { Browser } from "puppeteer";

const checkIfBranchExists = async (
  browser: Browser,
  branchName: string
): Promise<void> => {
  let currentSpinner;
  const {
    GITLAB_BASE_DIRECTORY,
    GITLAB_BASE_URL,
    GITLAB_PROJECT_ID,
  } = process.env;
  if (!GITLAB_BASE_DIRECTORY || !GITLAB_BASE_URL || !GITLAB_PROJECT_ID) {
    console.error("Environment variables not set up correctly!");
    process.exit(1);
  }
  try {
    const checkSpinner = ora("Checking if branch exists in project").start();
    currentSpinner = checkSpinner;

    const page = (await browser.pages())[0];
    await page.goto(
      `${encodeURI(GITLAB_BASE_URL)}/${encodeURI(
        GITLAB_PROJECT_ID
      )}/${encodeURI(GITLAB_BASE_DIRECTORY)}/-/tree/${encodeURI(branchName)}`,
      { waitUntil: "networkidle0" }
    );

    const pageText = await page.$eval(
      "html",
      (element: Element) => element.textContent
    );

    if (pageText?.includes("Page Not Found")) {
      checkSpinner.fail();
      console.log("");
      console.error(`Branch: ${branchName} - does not exist!`);
      process.exit(1);
    }

    checkSpinner.succeed("Branch exists!");
  } catch (error) {
    if (currentSpinner) {
      currentSpinner.fail();
    }
    console.error(error);
    process.exit(1);
  }
};

export default checkIfBranchExists;
