let web3;
let contract;
let tokenContract;
let account;
let selectedTier = 90;

window.addEventListener("load", async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await ethereum.request({ method: "eth_requestAccounts" });
    account = (await web3.eth.getAccounts())[0];
    contract = new web3.eth.Contract(contractABI, contractAddress);
    const tokenAddress = await contract.methods.g3xToken().call();
    tokenContract = new web3.eth.Contract([
      { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "type": "function" },
      { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "", "type": "uint256" }], "type": "function" },
      { "constant": true, "inputs": [{ "name": "owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "type": "function" }
    ], tokenAddress);

    document.getElementById("app").innerHTML = `
      <p><strong>Wallet:</strong> ${account}</p>
      <p><strong>Tier:</strong> 
        <button onclick="selectTier(90)">90d</button>
        <button onclick="selectTier(180)">180d</button>
        <button onclick="selectTier(270)">270d</button>
        <button onclick="selectTier(365)">365d</button></p>
      <p><input type="number" id="amount" placeholder="Amount to stake"></p>
      <button onclick="stake()">Stake</button>
    `;
  } else {
    alert("Please install MetaMask.");
  }
});

function selectTier(days) { selectedTier = days; }

async function stake() {
  const amount = document.getElementById("amount").value;
  const amountWei = web3.utils.toWei(amount, "ether");

  const allowance = await tokenContract.methods.allowance(account, contractAddress).call();
  if (BigInt(allowance) < BigInt(amountWei)) {
    await tokenContract.methods.approve(contractAddress, web3.utils.toWei("100000000", "ether")).send({ from: account });
  }
  await contract.methods.stake(amountWei, selectedTier).send({ from: account });
}
