const ethers = require('ethers');
const fs = require('fs');

const network = 'rinkeby';
const HaggWestingV1 = JSON.parse(fs.readFileSync('src/artifacts/src/contracts/HaqqVestingV1.sol/HaqqVestingV1.json', 'utf8'));
const ENV = JSON.parse(fs.readFileSync('env.json', 'utf8'));
const contractAddress = '..........';
// https://docs.ethers.io/v5/api-keys/#api-keys--getDefaultProvider
const provider = ethers.getDefaultProvider(
    network,
    {
        etherscan: ENV.etherscanProjectApiKey,
        infura: {
            projectId: ENV.infuraProjectId,
            projectSecret: ENV.infuraProjectSecret,
        },
    }
)

const contractObj = new ethers.Contract(contractAddress, HaggVestingV1.abi, provider);

const read = async () => {
    const numberOfPaymentsBN = await contractObj.numberOfPayments();
    const numberOfPayments = numberOfPaymentsBN.toNumber();
    console.log(typeof numberOfPayments, numberOfPayments);
}

read()
    .then(r => console.log(r))
    .catch(e => console.error(e));

