$(function () {
    $(window).load(function () {
        PrepareNetwork();
    });
});


var VerifySigContract = null;
var web3 = null;
var JsonVerifySig = null;
var CurrentAccount = null;
var Content = null;
var networkDataVerifySig = null;
var signature = null;
var msg = null;


async function PrepareNetwork() {

    await loadWeb3();
    await LoadDataSmartContract();
    setStatus();
    getResultOfPoll();
}

async function loadWeb3() {

    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum); // MetaMask
        await ethereum.request({ method: 'eth_requestAccounts' }).then(function (accounts) {
            CurrentAccount = accounts[0];
            web3.eth.defaultAccount = CurrentAccount;
            console.log('current account: ' + CurrentAccount);
            SetCurrentAccount();
        });
    } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
    } else {
        window.alert('Non-Ethreum browser detected!');
    }

    ethereum.on('accoontChange', handleAccountChange); // from MetaMask API 
    ethereum.on('chainChange', handleChainChange);

}


function SetCurrentAccount() {
    $('#account').text(CurrentAccount);
}


async function handleAccountChange() {
    await ethereum.request({ method: 'eth-reqqusetAccount' }).then(function (accounts) {
        CurrentAccount = accounts[0];
        web3.eth.defaultAccount = CurrentAccount;
        console.log('current account: ' + CurrentAccount);
        window.location.reload();
        SetCurrentAccount();
    });
}

async function handleChainChange(_chainId) {
    windoe.location.reload();
    console.log('cahin changed ', _chainId);
}


async function LoadDataSmartContract() {

    await $.getJSON('Poll.json', function (contractData) {
        Poll = contractData;
    });
    // console.log("Poll: ",Poll);

    web3 = await window.web3;

    const networkId = await web3.eth.net.getId();
    // console.log("networkId: ",networkId)

    networkDataPoll = await Poll.networks[networkId];
    // console.log("networkDataPoll:",  networkDataPoll);

    if (networkDataPoll) {
        console.log("Poll.abi:", Poll.abi);
        console.log("networkDataPoll.address:", networkDataPoll.address);
        PollContract = new web3.eth.Contract(Poll.abi, networkDataPoll.address);
    }


    $('#result').hide();
    $(document).on('click', '#startPoll', createPoll);
    $(document).on('click', '#submitVote', submitVote);
    $(document).on('click', '#revealPoll', revealPoll);


}

async function createPoll() {

    const description = $('#description').val();

    if (description.trim() == '') {
        window.alert('fill the box plz!');
        return;
    }

    await PollContract.methods.createPoll(description).send({ from: CurrentAccount }).catch((err) => {
        console.error(err);
    });

    $('#descrip').html('description:' + ' ' + message);


}

async function setStatus() {

    var status = await PollContract.methods.getStatus().call();

    if (status == 0) {
        $("#statusFill").text(" Creating Poll ");
    } else if (status == 1) {
        $("#statusFill").text(" Poll Active ");
    } else if (status == 2) {
        $("#statusFill").text(" Poll Ended ");
    } else if (status == 3) {
        $("#statusFill").text(" Result Realise ");
    }
}

async function activePoll() {
    await PollContract.methods.activePoll().send({ from: CurrentAccount }).catch((err) => {
        console.error(err);
    });
}

async function closePoll() {
    await PollContract.methods.closePoll().send({ from: CurrentAccount }).catch((err) => {
        console.error(err);
    });
}

async function anuonceResult() {
    await PollContract.methods.anuonceResult().send({ from: CurrentAccount }).catch((err) => {
        console.error(err);
    });
}

async function getHash() {
    hash = await PollContract.methods.getHash(6482361978461237482172346392617986991).call();
    console.log(hash)
}

async function submitVote() {
    hash = $('#hashfillforpolling').val();

    if (hash.trim() == '') {
        window.alert('fill the box plz!');
        return;
    }

    await PollContract.methods.submitVote(hash).send({ from: CurrentAccount }).catch((err) => {
        console.error(err);
    });
}

function getHashKeccak256ByWeb3() {
    var hash = web3.eth.accounts.hashMessage($('#RandomNumber').val());
    $('#hash').html('hash:' + ' ' + hash);
    alert('hash:' + ' ' + hash)
}

async function revealPoll() {
    ///###*** when js console log somthing it s return as string***###\\\
    salt = $('#saltFill').val();
    saltStr = salt.toString();
    // console.log(typeof(salt),salt.length)

    str = salt.length.toString() + saltStr;
    console.log(str)

    if (salt.trim() == '') {
        window.alert('fill the box plz!');
        return;
    }

    await PollContract.methods.sendPoll(str, salt).send({ from: CurrentAccount }).catch((err) => {
        console.error(err);
    });

    // hash = await PollContract.methods.getHash(str).call();
    // alert(hash)
}

async function getResultOfPoll() {
    var result = await PollContract.methods.getResultOfPoll().call();
    if (result != 0) {
        $('#result').show();
        $("#resultFill").text(result);
    }
}