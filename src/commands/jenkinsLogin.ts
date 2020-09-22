import ora from "ora";
import { Browser } from "puppeteer";

const jenkinsLogin = async (
  browser: Browser,
  username: string,
  password: string
): Promise<void> => {
  let currentSpinner;
  const { JENKINS_BUILD_URL } = process.env;
  if (!JENKINS_BUILD_URL) {
    console.error("Environment variables not set up properly!");
    process.exit(1);
  }
  try {
    const jenkinsLoginSpinner = ora("Logging into Jenkins").start();
    currentSpinner = jenkinsLoginSpinner;

    const page = (await browser.pages())[0];

    await page.goto(`${encodeURI(JENKINS_BUILD_URL)}/login`, {
      waitUntil: "networkidle0",
    });

    const usernameInput = await page.$("#j_username");
    const passwordInput = await page.$("input[name='j_password']");
    const submitButton = await page.$("input[type='submit'");

    if (!usernameInput || !passwordInput || !submitButton) {
      jenkinsLoginSpinner.fail();
      console.error("Necessary elements not present!");
      console.log({ usernameInput, passwordInput, submitButton });
      process.exit(1);
    }

    await usernameInput.type(username);
    await passwordInput.type(password);
    await submitButton.click();
    await page.waitForNavigation({ waitUntil: "networkidle0" });

    jenkinsLoginSpinner.succeed("Logged into Jenkins successfully!");
  } catch (error) {
    if (currentSpinner) {
      currentSpinner.fail();
    }
    console.log("");
    console.error(error);
    process.exit(1);
  }
};

export default jenkinsLogin;
