const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
const contractABI = [
    // BudgetVoting 컨트랙트의 ABI를 여기에 붙여넣으세요
    //BudgetVoting deployed to: 0xee2c622ae7453F46008DFf81324Dc0f56bb0bb02
    //Contract owner: 0x4b195dC3E7fc01F7332e2f35d8862c012B38b3F9
];

let provider, signer, contract;

const connectButton = document.getElementById('connectButton');
const accountArea = document.getElementById('accountArea');
const accountSpan = document.getElementById('accountSpan');
const addProposalButton = document.getElementById('addProposalButton');
const getProposalsButton = document.getElementById('getProposalsButton');
const proposalInput = document.getElementById('proposalInput');
const proposalsList = document.getElementById('proposalsList');
const statusDiv = document.getElementById('status');

connectButton.addEventListener('click', connectMetaMask);
addProposalButton.addEventListener('click', addProposal);
getProposalsButton.addEventListener('click', getProposals);

async function connectMetaMask() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            contract = new ethers.Contract(contractAddress, contractABI, signer);
            
            const account = await signer.getAddress();
            accountSpan.textContent = account;
            connectButton.style.display = 'none';
            accountArea.style.display = 'block';
            
            setStatus('Connected to MetaMask');
        } catch (error) {
            setStatus('Error connecting to MetaMask: ' + error.message);
        }
    } else {
        setStatus('MetaMask is not installed');
    }
}

async function addProposal() {
    if (!contract) {
        setStatus('Please connect to MetaMask first');
        return;
    }
    const proposalName = proposalInput.value;
    if (!proposalName) {
        setStatus('Please enter a proposal name');
        return;
    }
    try {
        const tx = await contract.addProposal(proposalName);
        setStatus('Adding proposal... Please wait');
        await tx.wait();
        setStatus('Proposal added successfully');
        proposalInput.value = '';
    } catch (error) {
        setStatus('Error adding proposal: ' + error.message);
    }
}

async function getProposals() {
    if (!contract) {
        setStatus('Please connect to MetaMask first');
        return;
    }
    try {
        const count = await contract.getProposalCount();
        let proposals = '';
        for (let i = 0; i < count; i++) {
            const [name, voteCount] = await contract.getProposal(i);
            proposals += `${name}: ${voteCount} votes<br>`;
        }
        proposalsList.innerHTML = proposals;
        setStatus('Proposals retrieved successfully');
    } catch (error) {
        setStatus('Error getting proposals: ' + error.message);
    }
}

function setStatus(message) {
    statusDiv.innerHTML = message;
}