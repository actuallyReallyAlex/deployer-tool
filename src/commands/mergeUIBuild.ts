import ora from "ora";
import { Browser } from "puppeteer";

import { UIBuildType } from "../types";

const mergeUIBuild = async (
  browser: Browser,
  type: UIBuildType
): Promise<void> => {
  let currentSpinner;
  const {
    GITLAB_BASE_DIRECTORY,
    GITLAB_BASE_URL,
    GITLAB_PROJECT_ID,
    GITLAB_PROJECT_ID_NUMBER,
    GITLAB_TARGET_BRANCH,
  } = process.env;
  if (
    !GITLAB_BASE_DIRECTORY ||
    !GITLAB_BASE_URL ||
    !GITLAB_PROJECT_ID ||
    !GITLAB_PROJECT_ID_NUMBER ||
    !GITLAB_TARGET_BRANCH
  ) {
    console.error("Environment variables set up incorrectly!");
    process.exit(1);
  }
  try {
    const mergeSpinner = ora(
      `Merging ${type.toLocaleUpperCase()} UI Build`
    ).start();
    currentSpinner = mergeSpinner;

    const page = (await browser.pages())[0];

    await page.goto(
      `${encodeURI(GITLAB_BASE_URL)}/${encodeURI(
        GITLAB_PROJECT_ID
      )}/${encodeURI(
        GITLAB_BASE_DIRECTORY
      )}/-/merge_requests/new?utf8=%E2%9C%93&merge_request%5Bsource_project_id%5D=${encodeURI(
        GITLAB_PROJECT_ID_NUMBER
      )}&merge_request%5Bsource_branch%5D=ui-build-${type}&merge_request%5Btarget_project_id%5D=${encodeURI(
        GITLAB_PROJECT_ID_NUMBER
      )}&merge_request%5Btarget_branch%5D=${encodeURI(GITLAB_TARGET_BRANCH)}`,
      {
        waitUntil: "networkidle0",
      }
    );

    const assigneeToMeLink = await page.$(".assign-to-me-link");
    const deleteAfterMergeCheckbox = await page.$(
      "#merge_request_force_remove_source_branch"
    );
    const mergeSubmitButton = await page.$("input[type='submit'");

    if (!assigneeToMeLink || !deleteAfterMergeCheckbox || !mergeSubmitButton) {
      currentSpinner.fail();
      console.log("");
      console.error("Necessary elements not present!");
      console.log({
        assigneeToMeLink,
        deleteAfterMergeCheckbox,
        mergeSubmitButton,
      });
      process.exit(1);
    }

    await assigneeToMeLink.click();
    await deleteAfterMergeCheckbox.click();
    await mergeSubmitButton.click();

    await page.waitForNavigation({ waitUntil: "networkidle0" });

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

    mergeSpinner.succeed(
      `Merged ${type.toLocaleUpperCase()} UI Build successfully!`
    );
  } catch (error) {
    if (currentSpinner) {
      currentSpinner.fail();
    }
    console.log("");
    console.error(error);
    process.exit(1);
  }
};

export default mergeUIBuild;
