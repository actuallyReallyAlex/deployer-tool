import ora from "ora";
import { Browser } from "puppeteer";

const signIn = async (
  browser: Browser,
  username: string,
  password: string
): Promise<void> => {
  let currentSpinner;
  const { GITLAB_BASE_URL } = process.env;
  if (!GITLAB_BASE_URL) {
    console.error("Environment variables not set up correctly!");
    process.exit(1);
  }
  try {
    const signInSpinner = ora("Signing in to GitLab").start();
    currentSpinner = signInSpinner;

    const page = (await browser.pages())[0];

    await page.goto(`${encodeURI(GITLAB_BASE_URL)}/users/sign_in`, {
      waitUntil: "networkidle0",
    });

    const usernameInput = await page.$("#username");
    const passwordInput = await page.$("#password");
    const submitButton = await page.$("input[type='submit'");

    if (!usernameInput || !passwordInput || !submitButton) {
      signInSpinner.fail();
      console.error("Necessary elements not present!");
      console.log({ usernameInput, passwordInput, submitButton });
      process.exit(1);
    }

    await usernameInput.type(username);
    await passwordInput.type(password);
    await submitButton.click();
    await page.waitForNavigation({ waitUntil: "networkidle0" });
    signInSpinner.succeed("Signed in to GitLab successfully!");
  } catch (error) {
    if (currentSpinner) {
      currentSpinner.fail();
    }
    console.error(error);
    process.exit(1);
  }
};

export default signIn;
