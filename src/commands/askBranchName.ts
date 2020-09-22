import inquirer from "inquirer";

const askBranchName = async (): Promise<string> => {
  try {
    const { branchName } = await inquirer.prompt({ type: "input", name: "branchName", message: "What branch would you like to merge?" });
    return branchName;
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default askBranchName;
