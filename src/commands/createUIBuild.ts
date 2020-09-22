import ora from "ora";
import path from "path";
import { Browser } from "puppeteer";

import { UIBuildType } from "../types";

const createUIBuild = async (
  browser: Browser,
  type: UIBuildType
): Promise<void> => {
  let currentSpinner;
  const {
    JENKINS_BASE_URL,
    JENKINS_MAIN_BRANCH_ID,
    JENKINS_ORG_ID,
    JENKINS_PROJECT_ID,
  } = process.env;
  if (
    !JENKINS_BASE_URL ||
    !JENKINS_MAIN_BRANCH_ID ||
    !JENKINS_ORG_ID ||
    !JENKINS_PROJECT_ID
  ) {
    console.error("Environment variables are not set up correctly!");
    process.exit(1);
  }
  const page = (await browser.pages())[0];
  try {
    const createBuildSpinner = ora(
      `Creating ${type.toLocaleUpperCase()} UI Build`
    ).start();
    currentSpinner = createBuildSpinner;

    const urls = {
      consumed: `${encodeURI(JENKINS_BASE_URL)}/job/${encodeURI(
        JENKINS_ORG_ID
      )}/job/${encodeURI(JENKINS_PROJECT_ID)}/job/${encodeURI(
        JENKINS_MAIN_BRANCH_ID
      )}/job/Build UI - Consumed/`,
      standalone: `${encodeURI(JENKINS_BASE_URL)}/job/${encodeURI(
        JENKINS_ORG_ID
      )}/job/${encodeURI(JENKINS_PROJECT_ID)}/job/${encodeURI(
        JENKINS_MAIN_BRANCH_ID
      )}/job/Build UI - Standalone/`,
    };

    const buttonSelectors = {
      consumed: `a[href='/job/${encodeURI(JENKINS_ORG_ID)}/job/${encodeURI(
        JENKINS_PROJECT_ID
      )}/job/${encodeURI(
        JENKINS_MAIN_BRANCH_ID
      )}/job/Build%20UI%20-%20Consumed/build?delay=0sec']`,
      standalone: `a[href='/job/${encodeURI(JENKINS_ORG_ID)}/job/${encodeURI(
        JENKINS_PROJECT_ID
      )}/job/${encodeURI(
        JENKINS_MAIN_BRANCH_ID
      )}/job/Build%20UI%20-%20Standalone/build?delay=0sec']`,
    };

    await page.goto(urls[type], { waitUntil: "networkidle0" });

    const buildButton = await page.$(buttonSelectors[type]);

    if (!buildButton) {
      currentSpinner.fail();
      console.log("");
      console.error("Necessary elements not present!");
      await page.screenshot({
        path: path.join(__dirname, "../../build-button-error.png"),
      });
      console.log({ buildButton, type });
      process.exit(1);
    }

    await buildButton.click();

    const inProgressIcon = await page.waitForSelector(
      "#buildHistory > div.row.pane-content > table > tbody > tr:nth-child(2) > td > div.pane.build-name > div > a > img[alt='In progress > Console Output']",
      { timeout: 15000 } // * 15 second timeout
    );

    if (!inProgressIcon) {
      currentSpinner.fail();
      await page.screenshot({
        path: path.join(__dirname, "../../in-progress-icon-error.png"),
      });
      console.log("");
      console.error("Could not find in progress icon");
      process.exit(1);
    }

    const buildSuccessIcon = await page.waitForSelector(
      "#buildHistory > div.row.pane-content > table > tbody > tr:nth-child(2) > td > div.pane.build-name > div > a > img[alt='Success > Console Output']",
      { timeout: 300000 } // * 5 minute timeout
    );

    if (!buildSuccessIcon) {
      currentSpinner.fail();
      await page.screenshot({
        path: path.join(__dirname, "../../build-success-icon-error.png"),
      });
      console.log("");
      console.error("Could not find build success icon");
      process.exit(1);
    }

    createBuildSpinner.succeed(
      `${type.toLocaleUpperCase()} UI Build created successfully!`
    );
  } catch (error) {
    if (currentSpinner) {
      currentSpinner.fail();
    }
    await page.screenshot({
      path: path.join(__dirname, "../../create-ui-build-error.png"),
    });
    console.log("");
    console.error(error);
    process.exit(1);
  }
};

export default createUIBuild;
