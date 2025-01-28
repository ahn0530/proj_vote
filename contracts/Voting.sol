// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {
    struct Proposal {
        uint256 id; // Proposal ID
        string title; // Proposal title
        uint32 voteCount; // Total votes received
        bool isActive; // Whether the proposal is active
    }

    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount; // Count of proposals

    event ProposalCreated(uint256 indexed id, string title);
    event Voted(uint256 indexed id, address indexed voter);
    event ProposalStatusUpdated(uint256 indexed id, bool isActive);
    event VoteRecorded(uint256 indexed id, address indexed voter); // Event for recording votes

    function createProposal(uint256 id, string memory title) external onlyOwner {
        require(proposals[id].id == 0, "Proposal ID already exists");
        require(bytes(title).length > 0, "Title cannot be empty");

        Proposal storage proposal = proposals[id];
        proposal.id = id;
        proposal.title = title;
        proposal.isActive = true;

        proposalCount++;
        emit ProposalCreated(id, title);
    }

    function vote(uint256 id) external {
        Proposal storage proposal = proposals[id];
        require(proposal.id != 0, "Proposal does not exist");
        require(proposal.isActive, "Proposal is not active");
        
        // Record vote with an event instead of storing on-chain
        emit VoteRecorded(id, msg.sender);

        proposal.voteCount++;

        emit Voted(id, msg.sender);
    }

    function setProposalStatus(uint256 id, bool isActive) external onlyOwner {
        Proposal storage proposal = proposals[id];
        require(proposal.id != 0, "Proposal does not exist");

        proposal.isActive = isActive;
        emit ProposalStatusUpdated(id, isActive);
    }

    function getProposal(uint256 id) external view returns (
        uint256,
        string memory,
        uint32,
        bool
    ) {
        Proposal memory proposal = proposals[id];
        require(proposal.id != 0, "Proposal does not exist");

        return (
            proposal.id,
            proposal.title,
            proposal.voteCount,
            proposal.isActive
        );
    }

    function hasVoted(uint256, address) external pure returns (bool) {
        return false; // Explicitly state no voting record is stored
    }
}
