const dashboard = async (): Promise<void> => {
  try {
    console.log("DASHBOARD");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default dashboard;
