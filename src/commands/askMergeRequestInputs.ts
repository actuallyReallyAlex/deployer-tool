import inquirer from "inquirer";

import { MergeRequestInputs } from "../types";

const askMergeRequestInputs = async (
  branchName: string
): Promise<MergeRequestInputs> => {
  try {
    const { title } = await inquirer.prompt({
      type: "input",
      name: "title",
      message: "What would you like to title the merge request?",
      default: branchName,
      suffix: "Required",
      validate: (input: any) => !!input,
    });
    const { description } = await inquirer.prompt({
      type: "input",
      name: "description",
      message:
        "What would you like to write for the description of the merge request?",
      suffix: " *Not required",
    });
    const { deleteAfterMerge } = await inquirer.prompt({
      type: "confirm",
      name: "deleteAfterMerge",
      message: `Would you like to delete ${branchName} after merging?`,
    });
    return { deleteAfterMerge, description, title };
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default askMergeRequestInputs;
