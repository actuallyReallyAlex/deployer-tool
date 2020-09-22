import ora from "ora";
import { Browser } from "puppeteer";

const mergeMergeRequest = async (
  browser: Browser,
  mergeRequestNumber: number
): Promise<void> => {
  let currentSpinner;
  const {
    GITLAB_BASE_DIRECTORY,
    GITLAB_BASE_URL,
    GITLAB_PROJECT_ID,
  } = process.env;
  if (!GITLAB_BASE_DIRECTORY || !GITLAB_BASE_URL || !GITLAB_PROJECT_ID) {
    console.error("Environment variables set up incorrectly!");
    process.exit(1);
  }
  try {
    const mergeSpinner = ora(`Merging request #${mergeRequestNumber}`).start();
    currentSpinner = mergeSpinner;

    const page = (await browser.pages())[0];

    await page.goto(
      `${encodeURI(GITLAB_BASE_URL)}/${encodeURI(
        GITLAB_PROJECT_ID
      )}/${encodeURI(GITLAB_BASE_DIRECTORY)}/-/merge_requests/${encodeURI(
        mergeRequestNumber.toString()
      )}`,
      {
        waitUntil: "networkidle0",
      }
    );

    const approveButton = await page.$(
      "button[data-qa-selector='approve_button']"
    );

    if (!approveButton) {
      currentSpinner.fail();
      console.log("");
      console.error("Necessary elements not present!");
      console.log({ approveButton });
      process.exit(1);
    }

    await approveButton.click();

    await page.waitForSelector("#remove-source-branch-input");

    const mergeButton = await page.$(".accept-merge-request");

    if (!mergeButton) {
      currentSpinner.fail();
      console.error("Necessary elements not present!");
      console.log({ mergeButton });
      process.exit(1);
    }

    await mergeButton.click();

    await page.waitForSelector("a[href='#modal-revert-commit']");

    mergeSpinner.succeed(`Request #${mergeRequestNumber} merged successfully!`);
  } catch (error) {
    if (currentSpinner) {
      currentSpinner.fail();
    }
    console.error(error);
    process.exit(1);
  }
};

export default mergeMergeRequest;
