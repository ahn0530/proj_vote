// --- Debugging contract address issue ---
// The error "Contract Address: undefined" suggests that the contract address is not being properly initialized.
// Let's ensure the contract address is loaded and correctly passed during initialization.

import { Injectable, NotFoundException } from '@nestjs/common';
import { ethers } from 'ethers';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract | null = null;
  private signer: ethers.Wallet;

  constructor() {
    try {
      const abiPath = process.env.ABI_PATH || join(process.cwd(), 'artifacts/contracts/Voting.sol/Voting.json');
      const abi = JSON.parse(readFileSync(abiPath, 'utf8')).abi;

      // Load and validate environment variables
      const { contractAddress, privateKey, rpcUrl } = this.validateEnvVariables();

      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      this.signer = new ethers.Wallet(privateKey, this.provider);

      // Initialize contract
      this.contract = new ethers.Contract(contractAddress, abi, this.signer);
      console.log('Contract initialized successfully with address:', this.contract.address);
    } catch (error) {
      console.error('Error initializing BlockchainService:', error);
      throw error;
    }
  }

  private validateEnvVariables() {
    const contractAddress = process.env.VOTE_CONTRACT_ADDRESS;
    const privateKey = process.env.PRIVATE_KEY;
    const rpcUrl = process.env.SEPOLIA_URL;

    console.log('Environment Variables:');
    console.log('Contract Address:', contractAddress);
    console.log('Private Key Loaded:', !!privateKey);
    console.log('RPC URL:', rpcUrl);

    if (!contractAddress) {
      throw new Error('Contract address is missing. Verify your .env file.');
    }
    if (!privateKey) {
      throw new Error('Private key is missing. Verify your .env file.');
    }
    if (!rpcUrl) {
      throw new Error('RPC URL is missing. Verify your .env file.');
    }

    return { contractAddress, privateKey, rpcUrl };
  }

  async createProposal(id: number, title: string): Promise<void> {
    try {
      console.log(`Creating proposal: ID=${id}, Title="${title}"`);

      // Ensure contract is initialized
      if (!this.contract) {
        throw new Error('Contract is not initialized. Verify the constructor logic.');
      }

      // Debug: Log contract address and functions
      console.log('Contract Address:', this.contract.address);
      console.log('Available contract functions:', Object.keys(this.contract.functions || {}));

      // Validate function existence
      if (typeof this.contract.createProposal !== 'function') {
        throw new Error('createProposal is not available on the contract instance. Verify ABI and deployment.');
      }

      // Send transaction
      const tx = await this.contract.createProposal(id, title);
      console.log(`Transaction Hash: ${tx.hash}`);
      await tx.wait();

      console.log(`Proposal created successfully: ID=${id}`);
    } catch (error) {
      console.error('Blockchain Error:', error);
      throw error;
    }
  }


  async setProposalStatus(id: number, isActive: boolean): Promise<void> {
    try {
      const tx = await this.contract.setProposalStatus(id, isActive);
      await tx.wait();
    } catch (error) {
      console.error('Set proposal status error:', error);
      throw error;
    }
  }

  async checkProposalExists(proposalId: number): Promise<boolean> {
    try {
      const proposal = await this.contract.getProposal(proposalId);
      return proposal.isActive;
    } catch (error) {
      return false;
    }
  }

  async isProposalActive(proposalId: number): Promise<boolean> {
    try {
      console.log(`Checking if proposal ${proposalId} is active...`);

      if (!this.contract) {
        throw new Error('Contract is not initialized. Verify the constructor logic.');
      }

      // Fetch the proposal directly using `getProposal`
      const [id, title, voteCount, isActive] = await this.contract.getProposal(proposalId);
      console.log(`Fetched proposal: { id: ${id}, title: ${title}, voteCount: ${voteCount}, isActive: ${isActive} }`);

      // Ensure the fetched ID matches the input ID
      if (id.toString() !== proposalId.toString()) {
        console.log(`Proposal ID mismatch. Expected ${proposalId}, but got ${id}`);
        return false;
      }

      return isActive;
    } catch (error) {
      console.error('Error checking proposal status:', error);
      return false;
    }
  }

  async vote(proposalId: number, userAddress: string): Promise<void> {
    try {
      console.log(`Casting vote on proposal ${proposalId} by user ${userAddress}`);

      if (!this.contract) {
        throw new Error('Contract is not initialized. Verify the constructor logic.');
      }

      // Validate if the proposal is active
      const isActive = await this.isProposalActive(proposalId);
      if (!isActive) {
        throw new Error(`Cannot vote: Proposal ${proposalId} is not active or does not exist.`);
      }

      // Cast vote
      const tx = await this.contract.vote(proposalId);
      console.log(`Transaction Hash: ${tx.hash}`);
      await tx.wait();

      console.log(`Vote cast successfully on proposal ${proposalId}`);
    } catch (error) {
      console.error('Error casting vote:', error);
      throw error;
    }
  }
  
  async getProposalVotes(proposalId: number): Promise<number> {
    try {
      const proposal = await this.contract.getProposal(proposalId);
      return proposal.voteCount.toNumber();
    } catch (error) {
      console.error('Get votes error:', error);
      throw error;
    }
  }

  async hasVoted(proposalId: number, userAddress: string): Promise<boolean> {
    try {
      return await this.contract.hasVoted(proposalId, userAddress);
    } catch (error) {
      console.error('Check vote status error:', error);
      throw error;
    }
  }
}