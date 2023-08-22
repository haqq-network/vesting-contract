// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

// https://docs.openzeppelin.com/contracts/4.x/api/security#ReentrancyGuard
// Inheriting from ReentrancyGuard will make the nonReentrant modifier available,
// which can be applied to functions to make sure there are no nested (reentrant) calls to them.
// import "@openzeppelin/contracts/security/ReentrancyGuard.sol"; //
// ReentrancyGuardUpgradeable is Initializable and contains uint256[49] private __gap;
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

/*
* @title HaqqVesting
* This smart contract allows making deposits with 'vesting', i.e. each deposit can be repaid to beneficiary in
* fixed amount of portions (defined in 'numberOfPayments' variable), each payment will be unblocked after fixed period
* of time (defined in 'timeBetweenPayments' variable).
* Payments can be cumulative. That is, if the time has passed for which the beneficiary could have already received
* three payments, then the current transfer will pay the amount of three payments.
* Any address can make a deposit, and any address can trigger next payment to beneficiary.
* There can be many deposits for the same beneficiary address.
*/
contract HaqqVestingV3 is ReentrancyGuardUpgradeable {

    /// @dev number of payments to be made to repay a deposit to beneficiary
    uint256 public constant NUMBER_OF_PAYMENTS = 24;

    /// @dev Time period (in seconds) to unblock next payment.
    uint256 public constant TIME_BETWEEN_PAYMENTS = 30 days;

    uint256 public constant MAX_DEPOSITS = 5;

    mapping(address => uint256) public depositsCounter;

    struct Deposit {
        uint256 timestamp;
        uint256 sumInWeiDeposited;
        uint256 sumPaidAlready;
    }

    /// @dev beneficiary address => deposit
    mapping(address => mapping(uint256 => Deposit)) public deposits;

    // Indexed deposits keys
    address[] public keyArray;

    /// @dev Event to be emitted, when deposit was made.
    event DepositMade (
        address indexed beneficiaryAddress,
        uint256 indexed depositId,
        uint256 indexed timestamp,
        uint256 sumInWeiDeposited,
        address depositedBy
    );

    /// @dev Function to make a new deposit.
    /// @param _beneficiaryAddress address that will receive payments from this deposit
    function deposit(address _beneficiaryAddress) external payable nonReentrant returns (bool success) {
        require(_beneficiaryAddress != address(0), "HaqqVesting: beneficiary address is zero");
        require(msg.value > 0, "HaqqVesting: deposit sum is zero");
        // new deposit id for this deposit
        uint256 depositId = ++depositsCounter[_beneficiaryAddress];
        require(depositId <= MAX_DEPOSITS, "Max deposit number for this address reached");

        // make the first withdrawal
        // if beneficiary address can not receive ETH, there will be no deposit for this address
        uint256 firstWithdrawalAmount = msg.value / NUMBER_OF_PAYMENTS;
        (bool sent,) = payable(_beneficiaryAddress).call{value: firstWithdrawalAmount}("");
        require(sent, "Failed to send Ether");
        emit WithdrawalMade(_beneficiaryAddress, firstWithdrawalAmount, msg.sender);

        // after the first withdrawal succeeded, make records to this deposit:
        deposits[_beneficiaryAddress][depositId] = Deposit({timestamp: block.timestamp, sumInWeiDeposited: msg.value,
            sumPaidAlready: firstWithdrawalAmount});
        // emit event:

        emit DepositMade(
            _beneficiaryAddress,
            depositId,
            block.timestamp,
            msg.value,
            msg.sender
        );

        // add to index new key
        // TODO: return back!
//        if (!contains(_beneficiaryAddress)) {
//            keyArray.push(_beneficiaryAddress);
//        }

        return true;
    }

    /// @dev Total payouts unlocked in the elapsed time.
    /// @dev One payment is unlocked immediately
    /// @param _beneficiaryAddress address that will receive payments from this deposit
    function totalPayoutsUnblocked(address _beneficiaryAddress, uint256 _depositId) public view returns (uint256){
        require(deposits[_beneficiaryAddress][_depositId].timestamp > 0, "No deposit with this ID for this address");

        uint256 totalPayoutsUnblocked_ = ((block.timestamp - deposits[_beneficiaryAddress][_depositId].timestamp) /
            TIME_BETWEEN_PAYMENTS) + 1;
        return totalPayoutsUnblocked_ > NUMBER_OF_PAYMENTS ? NUMBER_OF_PAYMENTS : totalPayoutsUnblocked_;
    }

    /// @dev Returns amount (in wei on Ethereum) that should be unlocked in one time period for the given deposit
    /// @param _depositId deposit id
    /// @param _beneficiaryAddress address of beneficiary
    /// @return amount (in wei on Ethereum) that should be unlocked in one time period for the given deposit
    function amountForOneWithdrawal(address _beneficiaryAddress, uint256 _depositId) public view returns (uint256){
        return deposits[_beneficiaryAddress][_depositId].sumInWeiDeposited / NUMBER_OF_PAYMENTS;
    }

    /// @dev Returns amount available for withdrawal for given deposit at this time
    /// @param _depositId deposit id to check
    /// @param _beneficiaryAddress address of beneficiary
    function amountToWithdrawNow(address _beneficiaryAddress, uint256 _depositId) public view returns (uint256){

        uint256 totalAmount;
        uint256 unblocked = totalPayoutsUnblocked(_beneficiaryAddress, _depositId);
        if (unblocked == NUMBER_OF_PAYMENTS) {
            totalAmount = deposits[_beneficiaryAddress][_depositId].sumInWeiDeposited;
        } else {
            totalAmount = unblocked * amountForOneWithdrawal(_beneficiaryAddress, _depositId);
        }
        return totalAmount - deposits[_beneficiaryAddress][_depositId].sumPaidAlready;

    }

    /// @dev Event that will be emitted, when withdrawal was made
    event WithdrawalMade(
        address indexed beneficiary,
        uint256 sumInWei,
        address indexed triggeredByAddress
    );

    /// @dev Returns sum currently available for withdrawal from all deposits for a given address
    /// @param _beneficiaryAddress address to check
    function calculateAvailableSumForAllDeposits(address _beneficiaryAddress) external view returns (uint256){

        uint256 sum;

        if (depositsCounter[_beneficiaryAddress] > 0) {

            for (uint256 depositId = 1; depositId <= depositsCounter[_beneficiaryAddress]; depositId ++) {

                sum = sum + amountToWithdrawNow(_beneficiaryAddress, depositId);

            }
        }

        return sum;
    }

    /// @dev Function that transfers the amount currently due to the beneficiary address
    /// @param _beneficiaryAddress beneficiary address
    function withdraw(address _beneficiaryAddress) external nonReentrant returns (bool success) {

        uint256 sumToWithdraw;

        require(depositsCounter[_beneficiaryAddress] > 0, "No deposits for this address");

        for (uint256 depositId = 1; depositId <= depositsCounter[_beneficiaryAddress]; depositId ++) {

            uint256 amountToWithdrawNow_ = amountToWithdrawNow(_beneficiaryAddress, depositId);

            sumToWithdraw = sumToWithdraw + amountToWithdrawNow_;

            deposits[_beneficiaryAddress][depositId].sumPaidAlready = deposits[_beneficiaryAddress][depositId].sumPaidAlready + amountToWithdrawNow_;

        }

        require(
            sumToWithdraw > 0,
            "Sum to withdraw should be > 0"
        );

        // payable(_beneficiaryAddress).transfer(sumToWithdraw);
        // changed to .call
        // see https://solidity-by-example.org/sending-ether/
        (bool sent,) = payable(_beneficiaryAddress).call{value: sumToWithdraw}("");
        require(sent, "Failed to send Ether");

        emit WithdrawalMade(
            _beneficiaryAddress,
            sumToWithdraw,
            msg.sender
        );

        return true;
    }

    /// @dev Function that transfers ownership of deposits to new address
    /// @param _newBeneficiaryAddress beneficiary address
    function transferDepositRights(address _newBeneficiaryAddress) external {
        require(depositsCounter[msg.sender] > 0, "No deposits for this address");
        require(depositsCounter[_newBeneficiaryAddress] == 0, "Only empty account is allowed");

        for (uint256 depositId = 1; depositId <= depositsCounter[msg.sender]; depositId ++) {
            deposits[_newBeneficiaryAddress][depositId] = deposits[msg.sender][depositId];
            delete deposits[msg.sender][depositId];
            emit DepositMade(
                _newBeneficiaryAddress,
                depositId,
                deposits[_newBeneficiaryAddress][depositId].timestamp,
                deposits[_newBeneficiaryAddress][depositId].sumInWeiDeposited,
                msg.sender
            );
        }
        depositsCounter[_newBeneficiaryAddress] = depositsCounter[msg.sender];

        delete depositsCounter[msg.sender];
        removeKey(msg.sender); // remove old key

        // add to index new key
        if (!contains(_newBeneficiaryAddress)) {
            keyArray.push(_newBeneficiaryAddress);
        }
    }

    /// @dev Returns the total amount of tokens remaining for withdrawal from all deposits for a given address
    function calculateTotalRemainingForAllDeposits(address _beneficiaryAddress) external view returns (uint256){
        uint256 totalRemaining = 0;

        if (depositsCounter[_beneficiaryAddress] > 0) {
            for (uint256 depositId = 1; depositId <= depositsCounter[_beneficiaryAddress]; depositId ++) {
                uint256 remainingForThisDeposit = deposits[_beneficiaryAddress][depositId].sumInWeiDeposited - deposits[_beneficiaryAddress][depositId].sumPaidAlready;
                totalRemaining = totalRemaining + remainingForThisDeposit;
            }
        }
        return totalRemaining;
    }

    /// @dev Returns if the key exists in the keyArray array
    /// @param _beneficiaryAddress address to check
    function contains(address _beneficiaryAddress) public view returns (bool) {
        // let's check if the key exists in the keyArray array
        for (uint256 i = 0; i < keyArray.length; i++) {
            if (keyArray[i] == _beneficiaryAddress) {return true;}
        }

        // if we reach here, then the key doesn't exist
        return false;
    }

    /// @dev Removes a key from the keyArray array
    /// @param _beneficiaryAddress address to remove
    function removeKey(address _beneficiaryAddress) private returns (bool) {
        if (!contains(_beneficiaryAddress)) {return false;}
        // create a new keyArray array, remove key from it, and set it as the new keyArray array
        address[] memory newkeyArray = new address[](keyArray.length - 1);
        uint256 j = 0;
        for (uint256 i = 0; i < keyArray.length; i++) {
            if (keyArray[i] != _beneficiaryAddress) {
                newkeyArray[j] = keyArray[i];
                j++;
            }
        }
        // set the new keyArray array
        keyArray = newkeyArray;

        return true;
    }

    /// @dev Returns the size of the keyArray array
    function indexSize() public view returns (uint256) {
        return keyArray.length;
    }

    /// @dev Returns all keys in the keyArray array
    function indexKeys() public view returns (address[] memory) {
        return keyArray;
    }

    struct ExtendedDeposit {
        address owner;
        uint256 timestamp;
        uint256 sumInWeiDeposited;
        uint256 sumPaidAlready;
        uint256 sumLeftToPay;
    }

    /// @dev Returns all deposits for all addresses
    function getAllDeposits() external view returns (ExtendedDeposit[] memory allDeposits) {
        uint256 totalDepositsCount = 0;

        // Calculate the total number of deposits
        for (uint256 i = 0; i < keyArray.length; i++) {
            totalDepositsCount += depositsCounter[keyArray[i]];
        }

        // Initialize the return array
        allDeposits = new ExtendedDeposit[](totalDepositsCount);
        uint256 counter = 0;

        // Iterate through each address in keyArray
        for (uint256 i = 0; i < keyArray.length; i++) {
            address owner = keyArray[i];

            // Iterate through each deposit for the address
            for (uint256 j = 1; j <= depositsCounter[owner]; j++) {
                Deposit memory depositDetail = deposits[owner][j];
                allDeposits[counter] = ExtendedDeposit({
                    owner: owner,
                    timestamp: depositDetail.timestamp,
                    sumInWeiDeposited: depositDetail.sumInWeiDeposited,
                    sumPaidAlready: depositDetail.sumPaidAlready,
                    sumLeftToPay: depositDetail.sumInWeiDeposited - depositDetail.sumPaidAlready
                });
                counter++;
            }
        }
        return allDeposits;
    }

    /// @dev Creates an index of all addresses that have made deposits
    /// @param depositors The list of addresses to index
    function createIndex(address[] calldata depositors) external {
        require(keyArray.length == 0, "keyArray is already initialized");
        for (uint256 i = 0; i < depositors.length; i++) {
            require(depositsCounter[depositors[i]] > 0, "No deposits for this address");
            if (!contains(depositors[i])) {
                keyArray.push(depositors[i]);
            }
        }
    }
}
