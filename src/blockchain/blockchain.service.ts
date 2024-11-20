// src/blockchain/blockchain.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { ethers } from 'ethers';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private signer: ethers.Wallet;

  constructor() {
    try {
      // 여러 가능한 경로 시도
      const possiblePaths = [
        join(process.cwd(), 'artifacts/contracts/Voting.sol/Voting.json'),
        join(__dirname, '../../artifacts/contracts/Voting.sol/Voting.json'),
        join(process.cwd(), '../artifacts/contracts/Voting.sol/Voting.json')
      ];

      let artifactContent = null;
      let usedPath = '';

      // 가능한 경로들을 순회하면서 파일 찾기
      for (const path of possiblePaths) {
        try {
          console.log('Trying path:', path);  // 시도하는 경로 로깅
          artifactContent = readFileSync(path, 'utf8');
          usedPath = path;
          break;
        } catch (err) {
          console.log('Failed to read from path:', path);  // 실패한 경로 로깅
        }
      }

      if (!artifactContent) {
        throw new Error('Could not find Voting.json in any of the expected locations');
      }

      console.log('Successfully found artifact at:', usedPath);  // 성공한 경로 로깅
      
      const artifact = JSON.parse(artifactContent);
      
      if (!process.env.SEPOLIA_URL || !process.env.PRIVATE_KEY || !process.env.VOTE_CONTRACT_ADDRESS) {
        throw new Error('Missing required environment variables');
      }

      this.provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_URL);
      this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
      this.contract = new ethers.Contract(
        process.env.VOTE_CONTRACT_ADDRESS,
        artifact.abi,
        this.signer
      );

      console.log('BlockchainService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize blockchain service:', error);
      throw new Error(`Failed to initialize blockchain service: ${error.message}`);
    }
  }

  async createProposal(id: number, title: string): Promise<void> {
    try {
      const tx = await this.contract.createProposal(id, title);
      await tx.wait();
      
      // 제안 생성 후 활성화
      await this.setProposalStatus(id, true);
    } catch (error) {
      console.error('Create proposal error:', error);
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

  async vote(proposalId: number, userAddress: string): Promise<{txHash: string}> {
    try {
      console.log('Blockchain vote start:', { proposalId, userAddress });
      
      // 제안이 존재하고 활성화되어 있는지 확인
      const isActive = await this.checkProposalExists(proposalId);
      console.log('Proposal active status:', isActive);
      
      if (!isActive) {
        throw new NotFoundException(`Proposal ${proposalId} is not active or does not exist`);
      }

      const hasVoted = await this.contract.hasVoted(proposalId, userAddress);
      console.log('Has voted status:', hasVoted);
      
      if (hasVoted) {
        throw new Error('User has already voted');
      }
      
      console.log('Sending vote transaction...');
      const tx = await this.contract.vote(proposalId);
      console.log('Transaction sent:', tx.hash);
      
      console.log('Waiting for transaction confirmation...');
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      return {
        txHash: receipt.hash
      };
    } catch (error) {
      console.error('Detailed vote error:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
        data: error.data
      });
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