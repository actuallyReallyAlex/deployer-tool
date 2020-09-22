import ora from "ora";
import { Browser } from "puppeteer";

import askBranchName from "./askBranchName";

const verifyBranch = async (
  browser: Browser,
  branchName: string
): Promise<boolean> => {
  try {
    const {
      GITLAB_BASE_DIRECTORY,
      GITLAB_BASE_URL,
      GITLAB_PROJECT_ID,
    } = process.env;
    if (!GITLAB_BASE_DIRECTORY || !GITLAB_BASE_URL || !GITLAB_PROJECT_ID) {
      console.error("Environment variables not set up correctly!");
      process.exit(1);
    }
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
      return false;
    }

    return true;
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const checkIfBranchExists = async (
  browser: Browser,
  branchName: string
): Promise<void> => {
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
    let branchNameExists = false;
    let newBranchName = branchName;

    while (!branchNameExists) {
      const checkSpinner = ora(
        `Checking if ${newBranchName} exists in project`
      ).start();
      const verification = await verifyBranch(browser, newBranchName);

      if (verification) {
        checkSpinner.succeed(`${newBranchName} exists!`);
        branchNameExists = true;
      } else {
        checkSpinner.stopAndPersist({
          text: `Branch: ${branchName} - does not exist!`,
        });

        newBranchName = await askBranchName();
      }
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default checkIfBranchExists;
