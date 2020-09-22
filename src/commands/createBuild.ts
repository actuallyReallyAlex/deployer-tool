import ora from "ora";
import path from "path";
import { Browser } from "puppeteer";

const createBuild = async (browser: Browser): Promise<void> => {
  let currentSpinner;
  const {
    JENKINS_BUILD_URL,
    JENKINS_MAIN_BRANCH_ID,
    JENKINS_ORG_ID,
    JENKINS_PROJECT_ID,
  } = process.env;
  if (
    !JENKINS_BUILD_URL ||
    !JENKINS_MAIN_BRANCH_ID ||
    !JENKINS_ORG_ID ||
    !JENKINS_PROJECT_ID
  ) {
    console.error("Environment variables not set up correctly!");
    process.exit(1);
  }
  try {
    const createBuildSpinner = ora(
      `Creating ${process.env.PROJECT_NAME} Build`
    ).start();
    currentSpinner = createBuildSpinner;

    const page = (await browser.pages())[0];

    await page.goto(
      `${encodeURI(JENKINS_BUILD_URL)}/job/${encodeURI(
        JENKINS_ORG_ID
      )}/job/${encodeURI(JENKINS_PROJECT_ID)}/job/${encodeURI(
        JENKINS_MAIN_BRANCH_ID
      )}/job/BuildJob/`,
      {
        waitUntil: "networkidle0",
      }
    );

    const buildButton = await page.$(
      `a[href='/job/${encodeURI(JENKINS_ORG_ID)}/job/${encodeURI(
        JENKINS_PROJECT_ID
      )}/job/${encodeURI(
        JENKINS_MAIN_BRANCH_ID
      )}/job/BuildJob/build?delay=0sec']`
    );

    if (!buildButton) {
      currentSpinner.fail();
      console.log("");
      console.error("Necessary elements not present!");
      await page.screenshot({
        path: path.join(__dirname, "../../build-button-error.png"),
      });
      console.log({ buildButton });
      process.exit(1);
    }

    await buildButton.click();

    await page.waitForNavigation({ waitUntil: "networkidle0" });

    const finalBuildButton = await page.$("#yui-gen1-button");

    if (!finalBuildButton) {
      currentSpinner.fail();
      console.log("");
      console.error("Necessary elements not present!");
      await page.screenshot({
        path: path.join(__dirname, "../../final-build-button-error.png"),
      });
      console.log({ finalBuildButton });
      process.exit(1);
    }

    await finalBuildButton.click();

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
      { timeout: 600000 } // * 10 minute timeout
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
      `${process.env.PROJECT_NAME} Build created successfully!`
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

export default createBuild;
