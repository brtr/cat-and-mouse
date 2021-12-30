// const traits = require("../data.json");
const { TRAITS_ADDRESS, HABITAT_ADDRESS, CHEDDAR_ADDRESS, CNMGAME_ADDRESS, CNM_ADDRESS, HOUSEGAME_ADDRESS, HOUSE_ADDRESS } = process.env;
const main = async () => {
  let contractFactory = await hre.ethers.getContractFactory('Traits');
  const traitContract = contractFactory.attach(TRAITS_ADDRESS);

  contractFactory = await hre.ethers.getContractFactory('Habitat');
  const habitatContract = contractFactory.attach(HABITAT_ADDRESS);

  contractFactory = await hre.ethers.getContractFactory('CHEDDAR');
  const cheddarContract = contractFactory.attach(CHEDDAR_ADDRESS);

  contractFactory = await hre.ethers.getContractFactory('CnMGame');
  const cnmGameContract = contractFactory.attach(CNMGAME_ADDRESS);

  contractFactory = await hre.ethers.getContractFactory('CnM');
  const CnMContract = contractFactory.attach(CNM_ADDRESS);

  // contractFactory = await hre.ethers.getContractFactory('HouseGame');
  // const houseGameContract = contractFactory.attach(HOUSEGAME_ADDRESS);

  // contractFactory = await hre.ethers.getContractFactory('House');
  // const houseContract = contractFactory.attach(HOUSE_ADDRESS);

  // for (const trait of traits) {
  //   const traitIds = [...Array(trait.data.length).keys()];
  //   tx = await traitContract.uploadTraits(trait.id, traitIds, trait.data);
  //   tx.wait();
  // }
  // console.log("Uploaded Traits Data");

  await traitContract.setCnM(CNM_ADDRESS);
  console.log("set cnm for traits success");
  await habitatContract.setContracts(CNM_ADDRESS, CHEDDAR_ADDRESS, CNMGAME_ADDRESS, HOUSEGAME_ADDRESS, HOUSE_ADDRESS);
  console.log("set habitat contract success");
  await cheddarContract.addAdmin(HABITAT_ADDRESS);
  console.log("set cheddar admin success");
  await cnmGameContract.setContracts(CHEDDAR_ADDRESS, TRAITS_ADDRESS, CNM_ADDRESS, HABITAT_ADDRESS);
  await cnmGameContract.togglePublicSale();
  await cnmGameContract.setAllowCommits(true);
  console.log("set cnm game contract success");
  await CnMContract.setContracts(TRAITS_ADDRESS, HABITAT_ADDRESS);
  await CnMContract.addAdmin(CNMGAME_ADDRESS);
  console.log("set cnm contract success");
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();