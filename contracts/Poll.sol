// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "./String.sol";

contract Poll {

    enum Status {
        PollCreated, 
        PollActive, 
        PollEnded,
        ResultAnuoncment
    }

    // only one poll
    Status public status;

    uint public agreementCounter;
    uint public disagreementCounter;

    string public pollDescription; // "send 1 if you  agree otherwise 2"

    mapping(address => bytes32) private voterHashPoll; 

    function activePoll() external {
        require(status == Status.PollCreated, "Poll: status must be Poll Created!");
        status = Status.PollActive;
    }

    function closePoll() external {
        require(status == Status.PollActive, "Poll: status must be Poll Active!");
        status = Status.PollEnded;
    }

    function anuonceResult() external {
        require(status == Status.PollEnded, "Poll: status must be Poll Ended!");
        status = Status.ResultAnuoncment;
    }

    function getStatus() external view returns(Status) {
        return(status);
    }

    function createPoll(string memory _description) external {
        pollDescription = _description;
        status = Status.PollCreated;
    }

    // hash poll is hash of 256 random digist + your poll number. 324378...1 = salt
    function submitVote(bytes32  _hashPoll) external {
        require(status == Status.PollActive, "Poll: status must be Poll Active!");
        voterHashPoll[msg.sender] = _hashPoll;
    }

    function sendPoll(string memory _str, uint _salt) external {
        require(status == Status.PollEnded, "Poll: status must be Poll Ended!");
        uint vote = revealVote(_str, _salt);
        if(vote == 1) {
            agreementCounter++;
        } else if (vote == 2) {
            disagreementCounter++;
        }
    }

    function revealVote(string memory _str, uint _salt) internal view returns (uint) {
        require(status == Status.PollEnded, "Poll: status must be Poll Ended!");
        bool succses = hashWithConcat(_str) == voterHashPoll[msg.sender];
        if(succses == true){
            return(_salt % 10);
        } else {
            revert("Poll: error!");
        }
    }

    function hashWithConcat(string memory _str) internal pure returns (bytes32) {
        string memory eth =  "\x19Ethereum Signed Message:\n";
        string memory pack = concatenate(eth, _str);
        return keccak256(abi.encodePacked(pack));
    }

        
    function concatenate(string memory a,string memory b) public pure returns (string memory){
        return string(bytes.concat(bytes(a), bytes(b)));
    } 


    function getResultOfPoll() external view returns (string memory){
        require(status == Status.ResultAnuoncment, "Poll: status must be Result Anuoncment!");
        if(agreementCounter > disagreementCounter) {
            return "agreement counter";
        } else if(agreementCounter < disagreementCounter) {
            return "disagreement counter";
        }else {
            return "equal";
        }      

    }

    function getHash(string memory str) external pure returns (bytes32) {
        return(keccak256(abi.encodePacked(str)));
    }

} 

// 0xc4e8036a01f1b83ad304f8738e5cf0cf99dbe114cb05083ec89ce18c5860844e == 1212 || 
