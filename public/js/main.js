import { cnmGameAddress, cnmNFTAddress, cheddarAddress, cnmGameABI, cnmNFTABI, cheddarABI } from "./data.js";

(function() {
  let loginAddress = localStorage.getItem("loginAddress");
  let currentPrice;
  let mintPrice;
  let mintAmount = 1;
  const TargetChain = {
    id: "5",
    name: "goerli"
  };

  const provider = new ethers.providers.Web3Provider(web3.currentProvider);
  const signer = provider.getSigner();
  const cnmNFTContract = new ethers.Contract(cnmNFTAddress, cnmNFTABI, provider);
  const cnmGameContract = new ethers.Contract(cnmGameAddress, cnmGameABI, provider);
  const CheddarContract = new ethers.Contract(cheddarAddress, cheddarABI, provider);
  const loginButton = document.getElementById('btnLogin');
  const btnLoginBlock = document.getElementById('btnLoginBlock');
  const address = document.getElementById('address');
  const chedAmount = document.getElementById('chedAmount');
  const mintPriceEl = document.getElementById('mintPrice');
  const mintAmountEl = document.getElementById('mintAmount');
  const currentPriceEl = document.getElementById('currentPrice');
  const addBtn = document.getElementById('addBtn');
  const subBtn = document.getElementById('subBtn');
  const mintButton = document.getElementById('mintBtn');
  const mintStakeButton = document.getElementById('mintStakeBtn');

  const toggleLoader = function() {
    const x = document.getElementById('loader');
    if (x.style.display === "none") {
      x.style.display = "block";
    } else {
      x.style.display = "none";
    }
  }

  const toggleLoginBtns = function() {
    if (loginAddress == null) {
      btnLoginBlock.style.display = "block"
      address.style.display = "none"
    } else {
      btnLoginBlock.style.display = "none"
      address.textContent = loginAddress;
      address.style.display = "block"
    }
  }

  const login = async function () {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    if (accounts.length > 0) {
      localStorage.setItem("loginAddress", accounts[0]);
      loginAddress = accounts[0];
    } else {
      localStorage.removeItem("loginAddress");
      loginAddress = null;
    }

    checkLogin();
  }

  const checkLogin = function() {
    toggleLoginBtns();
    toggleLoader();
    if (loginAddress) {
      getCheddarBalance();
      getCurrentPrice();
    }
  }

  const getCheddarBalance = async function () {
    let balance = await CheddarContract.balanceOf(loginAddress);
    balance = ethers.utils.formatEther(balance)
    chedAmount.textContent = parseFloat(balance).toFixed(4);
  }

  const getCurrentPrice = async function () {
    const price = await cnmGameContract.MINT_PRICE();
    currentPrice = ethers.utils.formatEther(price)
    currentPriceEl.textContent = currentPrice;

    getMintPrice();
  }

  const getMintPrice = function () {
    mintPrice = currentPrice * parseInt(mintAmount);
    mintPriceEl.textContent = mintPrice;
  }

  const mint = async function(stake) {
    const claimable = await cnmNFTContract.isClaimable();
    const price = claimable ? 0 : mintPrice;
    const cnmGameWithSigner = cnmGameContract.connect(signer);
    toggleLoader();
    const commit = await cnmGameWithSigner.mintCommit(mintAmount, stake, {value: ethers.utils.parseUnits(price.toString(), "ether")});
    console.log("mint commit receipt: ", commit);
    await commit.wait();
    cnmGameWithSigner.mintReveal()
    .then(function(receipt) {
      console.log("mint reveal receipt: ", receipt);
      toggleLoader();
      alert("Mint success");
    })
  }

  if (window.ethereum) {
    loginButton.addEventListener('click', function() {
      toggleLoader();
      login();
    })

    mintButton.addEventListener('click', function() {
      mint(false);
    })

    mintStakeButton.addEventListener('click', function() {
      mint(true);
    })

    checkLogin();

    addBtn.addEventListener('click', function() {
      if (mintAmount < 4) {
        mintAmount = mintAmount + 1;
        mintAmountEl.textContent = mintAmount;
        getMintPrice();
      }
    })

    subBtn.addEventListener('click', function() {
      if (mintAmount > 1) {
        mintAmount = mintAmount - 1;
        mintAmountEl.textContent = mintAmount;
        getMintPrice();
      }
    })

    // detect Metamask account change
    ethereum.on('accountsChanged', function (accounts) {
      console.log('accountsChanges',accounts);
      if (accounts.length > 0) {
        localStorage.setItem("loginAddress", accounts[0]);
        loginAddress = accounts[0];
      } else {
        localStorage.removeItem("loginAddress");
        loginAddress = null;
      }
      toggleLoginBtns();
    });

     // detect Network account change
    ethereum.on('chainChanged', function(networkId){
      console.log('networkChanged',networkId);
      if (networkId != parseInt(TargetChain.id)) {
        alert("We don't support this chain, please switch to " + TargetChain.name);
      }
    });
  } else {
    console.warn("No web3 detected.");
  }
})();
