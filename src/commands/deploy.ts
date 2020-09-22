import ora from "ora";
import path from "path";
import { Browser } from "puppeteer";

import { Environment } from "../types";

const deploy = async (
  browser: Browser,
  environment: Environment
): Promise<void> => {
  try {
    // * Do deploy
    const page = await browser.newPage();
    await page.goto(environment.url, { waitUntil: "networkidle0" });

    const buildButton = await page.$(environment.buildSelector);

    if (!buildButton) {
      console.log("");
      ora(
        `Deploying ${process.env.PROJECT_NAME} to ${environment.name}`
      ).fail();
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
      ora(
        `Deploying ${process.env.PROJECT_NAME} to ${environment.name}`
      ).fail();
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
      ora(
        `Deploying ${process.env.PROJECT_NAME} to ${environment.name}`
      ).fail();
      await page.screenshot({
        path: path.join(__dirname, "../../in-progress-icon-error.png"),
      });
      console.log("");
      console.error("Could not find in progress icon");
      process.exit(1);
    }

    const buildSuccessIcon = await page.waitForSelector(
      "#buildHistory > div.row.pane-content > table > tbody > tr:nth-child(2) > td > div.pane.build-name > div > a > img[alt='Success > Console Output']",
      { timeout: 1800000 } // * 30 minute timeout
    );

    if (!buildSuccessIcon) {
      ora(
        `Deploying ${process.env.PROJECT_NAME} to ${environment.name}`
      ).fail();
      await page.screenshot({
        path: path.join(__dirname, "../../build-success-icon-error.png"),
      });
      console.log("");
      console.error("Could not find build success icon");
      process.exit(1);
    }

    await page.close();
    ora(
      `Deployed ${process.env.PROJECT_NAME} to ${environment.name} successfully!`
    );
  } catch (error) {
    ora(`Deploying ${process.env.PROJECT_NAME} to ${environment.name}`).fail();
    console.log("");
    console.error(error);
    process.exit(1);
  }
};

export default deploy;
