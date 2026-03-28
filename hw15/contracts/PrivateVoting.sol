// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract PrivateVoting {
    enum Phase { Commit, Reveal, Tally }

    struct Voter {
        bytes32 commitment;
        bool revealed;
        uint8 vote;
    }

    address public owner;
    string public topic;
    string[] public candidates;
    Phase public phase;

    mapping(address => Voter) public voters;
    mapping(address => bool) public allowedVoters;
    mapping(uint8 => uint256) public voteCounts;
    uint256 public totalRevealed;

    event VoteCommitted(address indexed voter);
    event VoteRevealed(address indexed voter, uint8 candidateIndex);
    event PhaseChanged(Phase newPhase);

    modifier onlyOwner() {
        require(msg.sender == owner, unicode"Только владелец");
        _;
    }

    modifier inPhase(Phase _phase) {
        require(phase == _phase, unicode"Неверная фаза");
        _;
    }

    constructor(string memory _topic, string[] memory _candidates, address[] memory _voters) {
        require(_candidates.length >= 2, unicode"Нужно как минимум 2 кандидата");
        require(_voters.length > 0, unicode"Нужно как минимум 1 голосующий");

        owner = msg.sender;
        topic = _topic;
        candidates = _candidates;
        phase = Phase.Commit;

        for (uint256 i = 0; i < _voters.length; i++) {
            allowedVoters[_voters[i]] = true;
        }
    }

    function getCommitment(uint8 _candidateIndex, bytes32 _salt) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_candidateIndex, _salt));
    }

    function commitVote(bytes32 _commitment) external inPhase(Phase.Commit) {
        require(allowedVoters[msg.sender], unicode"Нет права голосовать");
        require(voters[msg.sender].commitment == bytes32(0), unicode"Голос уже зафиксирован");

        voters[msg.sender].commitment = _commitment;
        emit VoteCommitted(msg.sender);
    }

    function revealVote(uint8 _candidateIndex, bytes32 _salt) external inPhase(Phase.Reveal) {
        Voter storage v = voters[msg.sender];
        require(v.commitment != bytes32(0), unicode"Голос не зафиксирован");
        require(!v.revealed, unicode"Голос уже раскрыт");
        require(_candidateIndex >= 1 && _candidateIndex <= candidates.length, unicode"Неверный кандидат");

        bytes32 check = keccak256(abi.encodePacked(_candidateIndex, _salt));
        require(check == v.commitment, unicode"Несоответствие фиксации");

        v.revealed = true;
        v.vote = _candidateIndex;
        voteCounts[_candidateIndex]++;
        totalRevealed++;

        emit VoteRevealed(msg.sender, _candidateIndex);
    }

    function nextPhase() external onlyOwner {
        require(phase != Phase.Tally, unicode"Уже в финальной фазе");
        if (phase == Phase.Commit) {
            phase = Phase.Reveal;
        } else {
            phase = Phase.Tally;
        }
        emit PhaseChanged(phase);
    }

    function candidateCount() external view returns (uint256) {
        return candidates.length;
    }

    function getVoteCount(uint8 _candidateIndex) external view returns (uint256) {
        return voteCounts[_candidateIndex];
    }
}
