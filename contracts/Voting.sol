// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {
    // uint256 대신 uint96 사용하여 storage 최적화
    struct Proposal {
        uint96 id;          // 제안 ID (reduced from uint256)
        string title;       // 제안 제목
        uint32 voteCount;   // 투표 수 (reduced from uint256)
        bool isActive;      // 활성화 상태
        mapping(address => bool) voters; // 투표자 주소 매핑
    }

    mapping(uint96 => Proposal) public proposals;
    uint32 public proposalCount;  // reduced from uint256

    event ProposalCreated(uint96 indexed proposalId, string title);
    event Voted(uint96 indexed proposalId, address indexed voter);
    event ProposalStatusChanged(uint96 indexed proposalId, bool isActive);

    // 배치 처리를 위한 함수 추가
    function createProposals(uint96[] calldata _ids, string[] calldata _titles) external onlyOwner {
        require(_ids.length == _titles.length, "Arrays length mismatch");
        
        for(uint i = 0; i < _ids.length; i++) {
            require(!proposals[_ids[i]].isActive, "Proposal already exists");
            
            Proposal storage newProposal = proposals[_ids[i]];
            newProposal.id = _ids[i];
            newProposal.title = _titles[i];
            newProposal.isActive = true;
            
            emit ProposalCreated(_ids[i], _titles[i]);
        }
        proposalCount += uint32(_ids.length);
    }

    // 단일 제안 생성 (기존 호환성 유지)
    function createProposal(uint96 _id, string calldata _title) external onlyOwner {
        require(!proposals[_id].isActive, "Proposal already exists");
        
        Proposal storage newProposal = proposals[_id];
        newProposal.id = _id;
        newProposal.title = _title;
        newProposal.isActive = true;
        
        proposalCount++;
        emit ProposalCreated(_id, _title);
    }

    // 배치 투표 처리를 위한 함수 추가
    function batchVote(uint96[] calldata _proposalIds) external {
        for(uint i = 0; i < _proposalIds.length; i++) {
            require(proposals[_proposalIds[i]].isActive, "Proposal is not active");
            require(!proposals[_proposalIds[i]].voters[msg.sender], "Already voted");
            
            proposals[_proposalIds[i]].voters[msg.sender] = true;
            proposals[_proposalIds[i]].voteCount++;
            
            emit Voted(_proposalIds[i], msg.sender);
        }
    }

    // 단일 투표 (기존 호환성 유지)
    function vote(uint96 _proposalId) external {
        require(proposals[_proposalId].isActive, "Proposal is not active");
        require(!proposals[_proposalId].voters[msg.sender], "Already voted");
        
        proposals[_proposalId].voters[msg.sender] = true;
        proposals[_proposalId].voteCount++;
        
        emit Voted(_proposalId, msg.sender);
    }

    function setProposalStatus(uint96 _proposalId, bool _isActive) external onlyOwner {
        require(proposals[_proposalId].id == _proposalId, "Proposal does not exist");
        proposals[_proposalId].isActive = _isActive;
        emit ProposalStatusChanged(_proposalId, _isActive);
    }

    // 여러 제안 상태 한번에 변경
    function batchSetProposalStatus(uint96[] calldata _proposalIds, bool[] calldata _isActive) external onlyOwner {
        require(_proposalIds.length == _isActive.length, "Arrays length mismatch");
        
        for(uint i = 0; i < _proposalIds.length; i++) {
            require(proposals[_proposalIds[i]].id == _proposalIds[i], "Proposal does not exist");
            proposals[_proposalIds[i]].isActive = _isActive[i];
            emit ProposalStatusChanged(_proposalIds[i], _isActive[i]);
        }
    }

    // View 함수들
    function getProposal(uint96 _proposalId) external view returns (
        uint96 id,
        string memory title,
        uint32 voteCount,
        bool isActive
    ) {
        Proposal storage proposal = proposals[_proposalId];
        return (
            proposal.id,
            proposal.title,
            proposal.voteCount,
            proposal.isActive
        );
    }

    function hasVoted(uint96 _proposalId, address _voter) external view returns (bool) {
        return proposals[_proposalId].voters[_voter];
    }

    function getProposalCount() external view returns (uint32) {
        return proposalCount;
    }
}