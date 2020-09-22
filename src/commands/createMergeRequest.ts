import ora from "ora";
import { Browser } from "puppeteer";

import { MergeRequestInputs } from "../types";

const createMergeRequest = async (
  browser: Browser,
  branchName: string,
  mergeRequestInputs: MergeRequestInputs
): Promise<number> => {
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
    console.error("Environment variables not set up correctly!");
    process.exit(1);
  }
  try {
    const mergeRequestSpinner = ora("Creating merge request").start();
    currentSpinner = mergeRequestSpinner;

    const page = (await browser.pages())[0];
    await page.goto(
      `${encodeURI(GITLAB_BASE_URL)}/${encodeURI(
        GITLAB_PROJECT_ID
      )}/${encodeURI(
        GITLAB_BASE_DIRECTORY
      )}/-/merge_requests/new?utf8=%E2%9C%93&merge_request%5Bsource_project_id%5D=${encodeURI(
        GITLAB_PROJECT_ID
      )}&merge_request%5Bsource_branch%5D=${encodeURI(
        branchName
      )}&merge_request%5Btarget_project_id%5D=${encodeURI(
        GITLAB_PROJECT_ID_NUMBER
      )}&merge_request%5Btarget_branch%5D=${encodeURI(GITLAB_TARGET_BRANCH)}`,
      { waitUntil: "networkidle0" }
    );

    // * Enter inputs
    const titleInput = await page.$("#merge_request_title");
    const descriptionInput = await page.$("#merge_request_description");
    const assigneeToMeLink = await page.$(".assign-to-me-link");
    const deleteAfterMergeCheckbox = await page.$(
      "#merge_request_force_remove_source_branch"
    );
    const mergeSubmitButton = await page.$("input[type='submit'");

    if (
      !titleInput ||
      !descriptionInput ||
      !assigneeToMeLink ||
      !deleteAfterMergeCheckbox ||
      !mergeSubmitButton
    ) {
      console.error("Necessary elements not present!");
      console.log({
        titleInput,
        descriptionInput,
        assigneeToMeLink,
        deleteAfterMergeCheckbox,
        mergeSubmitButton,
      });
      process.exit(1);
    }

    // * Clear Title input
    await page.evaluate(() => {
      const title: any = document.querySelector("#merge_request_title");
      if (!title) {
        console.error("NO TITLE INPUT IN EVALUTATION");
        process.exit(1);
      }

      title.value = "";
    });

    await titleInput.type(mergeRequestInputs.title);
    await descriptionInput.type(mergeRequestInputs.description);
    await assigneeToMeLink.click();
    if (mergeRequestInputs.deleteAfterMerge) {
      await deleteAfterMergeCheckbox.click();
    }
    await mergeSubmitButton.click();
    await page.waitForNavigation({ waitUntil: "networkidle0" });
    mergeRequestSpinner.succeed("Merge request created successfully!");

    const mergeRuquestNumber = Number(page.url().split("merge_requests/")[1]);

    return mergeRuquestNumber;
  } catch (error) {
    if (currentSpinner) {
      currentSpinner.fail();
    }
    console.error(error);
    process.exit(1);
  }
};

export default createMergeRequest;
