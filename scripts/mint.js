async function main() {
  const NFT = await hre.ethers.getContractFactory("CnM");
  const { CONTRACT_ADDRESS } = process.env;
  const contract = NFT.attach(CONTRACT_ADDRESS);
  await contract.mint();
}
main().then(() => process.exit(0)).catch(error => {
  console.error(error);
  process.exit(1);
});