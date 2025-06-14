let web3;
let contract;
let accounts = [];
const tokenAddress = "0x65e47d9bd03c73021858ab2e1acb2cab38d9b039";
let selectedTierDays = 180;

window.addEventListener("load", async () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        accounts = await web3.eth.getAccounts();
        contract = new web3.eth.Contract(contractABI, contractAddress);

        document.getElementById("app").innerHTML = `
            <p><strong>Wallet:</strong> ${accounts[0]}</p>
            <p><strong>Tier:</strong>
                <button onclick="selectTier(180)">180d</button>
                <button onclick="selectTier(240)">240d</button>
                <button onclick="selectTier(365)">365d</button>
            </p>
            <p><input type='number' id='amount' placeholder='Amount to stake (G3X)'/></p>
            <button onclick='stake()'>📥 Stake</button>
            <button onclick='claim()'>🎁 Claim</button>
            <button onclick='unstake()'>📤 Withdraw</button>
        `;
    } else {
        alert("Please install MetaMask.");
    }
});

function selectTier(days) {
    selectedTierDays = days;
    alert("Selected Tier: " + days + " days");
}

async function stake() {
    const amount = document.getElementById("amount").value;
    if (!amount || parseFloat(amount) <= 0) {
        alert("❌ Enter valid amount.");
        return;
    }

    const tokenContract = new web3.eth.Contract(
        [{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"amount","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"type":"function"},
         {"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"type":"function"},
         {"constant":true,"inputs":[{"name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"type":"function"}],
        tokenAddress);

    const amountWei = web3.utils.toWei(amount, "ether");
    const allowance = await tokenContract.methods.allowance(accounts[0], contractAddress).call();
    if (BigInt(allowance) < BigInt(amountWei)) {
        await tokenContract.methods.approve(contractAddress, web3.utils.toWei("1000000000", "ether")).send({ from: accounts[0] });
        alert("✅ Approved");
    }
    
    await contract.methods.stake(amountWei, selectedTierDays).send({ from: accounts[0] });
    alert("✅ Staked");
}

async function claim() {
    await contract.methods.claim(0).send({ from: accounts[0] });
    alert("✅ Claimed");
}

async function unstake() {
    await contract.methods.unstake(0).send({ from: accounts[0] });
    alert("✅ Unstaked");
}
