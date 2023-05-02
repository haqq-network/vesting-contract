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
contract HaqqVestingV2 is ReentrancyGuardUpgradeable {

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
    }

    // TODO: NEW UPDATE
    // migrator address
    address public migrator = 0x8bAFf5329608bE51eb1A2f2fB31e03B95C647670;

    event DepositMigrated(address indexed from, address indexed to, uint256 amount, uint256 depositId, uint256 timestamp);
    event MigratedSummary(address indexed from, address indexed to, uint256 totalAmount, uint256 timestamp);

    // transfer all locked and unlocked funds to migrator address
    function migrateAll() external {
        // check if msg.sender has deposits
        require(depositsCounter[msg.sender] > 0, "No deposits for this address");

        uint amountToWithdraw;
        // check all deposit for msg.sender
        for (uint256 depositId = 1; depositId <= depositsCounter[msg.sender]; depositId++) {
            // get amount to withdraw
            uint256 totalAmount = deposits[msg.sender][depositId].sumInWeiDeposited;
            uint256 paidAmount = deposits[msg.sender][depositId].sumPaidAlready;
            amountToWithdraw = amountToWithdraw + (totalAmount - paidAmount);

            // delete deposit from beneficiary
            delete deposits[msg.sender][depositId];
            emit DepositMigrated(msg.sender, migrator, totalAmount - paidAmount, depositId, block.timestamp);
        }

        // transfer locked and unlocked funds to migrator
        (bool sent,) = payable(migrator).call{value: amountToWithdraw}("");

        require(sent, "Failed to send Ether");

        // delete depositsCounter
        delete depositsCounter[msg.sender];

        emit MigratedSummary(msg.sender, migrator, amountToWithdraw, block.timestamp);
    }

}
