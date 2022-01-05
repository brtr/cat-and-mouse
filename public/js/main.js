import { cnmGameAddress, cnmNFTAddress, HabitatAddress, cnmGameABI, cnmNFTABI, HabitatABI } from "./data.js";

(function() {
  let loginAddress;
  const TargetChain = {
    id: "5",
    name: "goerli"
  };

  const provider = new ethers.providers.Web3Provider(web3.currentProvider);
  const signer = provider.getSigner();
  const cnmNFTContract = new ethers.Contract(cnmNFTAddress, cnmNFTABI, provider);
  const HabitatContract = new ethers.Contract(HabitatAddress, HabitatABI, provider);
  const habitatWithSigner = HabitatContract.connect(signer);
  const loginButton = document.getElementById('btn-login');
  const logoutButton = document.getElementById('btn-logout');
  const address = document.getElementById('address');
  const mintButton = document.getElementById('btn-mint');
  const stakeButton = document.getElementById('btn-stake');
  const claimButton = document.getElementById('btn-claim');

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
      loginButton.style.display = "block"
      logoutButton.style.display = "none"
      address.style.display = "none"
    } else {
      loginButton.style.display = "none"
      logoutButton.style.display = "block"

      address.textContent = loginAddress;
      address.style.display = "block"
    }
  }

  const checkLogin = async function() {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    if (accounts.length > 0) {
      loginAddress = accounts[0];
    } else {
      loginAddress = null;
    }
    toggleLoginBtns();
    toggleLoader();
  }

  if (window.ethereum) {
    loginButton.addEventListener('click', function() {
      toggleLoader();
      checkLogin();
    })

    logoutButton.addEventListener('click', function() {
      loginAddress = null;
      toggleLoginBtns();
    })

    mintButton.addEventListener('click', async function() {
      const cnmGameContract = new ethers.Contract(cnmGameAddress, cnmGameABI, provider);
      const claimable = await cnmNFTContract.isClaimable();
      const amount = document.getElementById("mintCount").value;
      const price = claimable ? 0 : amount * 0.001
      const cnmGameWithSigner = cnmGameContract.connect(signer);
      toggleLoader();
      const commit = await cnmGameWithSigner.mintCommit(amount, true, {value: ethers.utils.parseUnits(price.toString(), "ether")});
      console.log("mint commit receipt: ", commit);
      await commit.wait();
      cnmGameWithSigner.mintReveal()
      .then(function(receipt) {
        console.log("mint reveal receipt: ", receipt);
        toggleLoader();
        alert("Mint success");
      })
    })

    stakeButton.addEventListener('click', function() {
      const tokenId = document.getElementById("stakeTokenId").value;
      habitatWithSigner.addManyToStakingPool(loginAddress, [tokenId])
      .then(function(receipt) {
        console.log("stake receipt: ", receipt);
        alert("Stake success");
      })
    })

    claimButton.addEventListener('click', async function() {
      const claimable = await cnmNFTContract.isClaimable();
      console.log("claimable is ", claimable);
      if (claimable) {
        const tokenId = document.getElementById("claimTokenId").value;
        console.log("token ids: ", [tokenId]);
        habitatWithSigner.claimManyFromHabitatAndYield([tokenId], false)
        .then(function(receipt) {
          console.log("claim receipt: ", receipt);
          alert("Claim success");
        })
      } else {
        alert("Not all genesis tokens are minted");
      }
    })

    checkLogin();

    // detect Metamask account change
    ethereum.on('accountsChanged', function (accounts) {
      console.log('accountsChanges',accounts);
      loginAddress = accounts[0];
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
