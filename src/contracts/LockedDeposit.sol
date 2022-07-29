// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `from` to `to` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}

interface IVesting {
    function deposit(address _beneficiaryAddress) external payable returns (bool success);
}

interface ILockedDeposit /* is ERC165 */ {

    struct ApproveDepositPermit {
        uint256 amount;
        uint256 createdAt;
        uint256 deadline; // now + 30 days
        address investor; // investor address where ISLM should be sent
        address team; // team address where USDC should be sent
        address currency; // ISLM - 0x0000000000000000000000000000000000000000, USDC - 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
        address vestingContractAddress; // deposit contract address
        uint256 chainId;
    }

    struct Signature {
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    enum PermitStatus {Created, WaitPermitSignature, Permitted, Claimed, Refunded} // Permit state

    // The team or investor initialize the deal.
    function createDeal(ApproveDepositPermit calldata permit) external;

    // Deposit ERC20 or native coin
    function deposit(ApproveDepositPermit calldata permit) payable external;

    // Approve 
    function approve(ApproveDepositPermit calldata permit, Signature calldata signature) external;

    // Claim with signature from another chain
    function claimDeposit(ApproveDepositPermit calldata permit, Signature calldata signature) external;

    // claimOnDeadline return funds if deadline is passed and status unClaimed
    function claimOnDeadline(ApproveDepositPermit calldata permit) external;
}

contract LockedDeposit is ILockedDeposit {
    // The EIP-712 Domain separator for this contract
    bytes32 private DOMAIN_SEPARATOR;

    //    uint8 public MAINNET_CHAIN_ID = 1; // TODO: production
    uint8 public constant MAINNET_CHAIN_ID = 3; // for test net ropsten

    /*=========== EIP-712 types ============*/
    struct EIP712Domain {
        string name;
        string version;
        uint256 chainId;
        address verifyingContract;
    }

    //keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    bytes32 public constant EIP712DOMAIN_TYPEHASH =
    0x8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f;

    //keccak256("ApproveDepositPermit(uint256 amount,uint256 createdAt,uint256 deadline,address investor,address team,address currency,address vestingContractAddress,uint256 chainId)");
    bytes32 public constant APPROVE_DEPOSIT_PERMIT_TYPEHASH =
    0x0374bae21ef58575e7c0e5d107704d9981f29a9d9652ec0ce44439cb904338f9;

    // for easy check existing permits
    mapping(address => ApproveDepositPermit[]) public permitsLookUp;
    // permits by hash
    mapping(bytes32 => ApproveDepositPermit) public permits;
    mapping(bytes32 => PermitStatus) public permitsStatus;
    mapping(bytes32 => Signature) public permitSignatures;

    LockedDeposit private _thisAsOperator;

    uint256 immutable chainIdPublic;

    address public immutable vestingContractAddress;

    constructor(string memory _name, address _vestingContract) {
        require(_vestingContract != address(0));

        vestingContractAddress = _vestingContract;

        uint256 chainId;

        assembly {
            chainId := chainid()
        }

        chainIdPublic = chainId;

        DOMAIN_SEPARATOR = _hash(
            EIP712Domain({
        name : _name,
        version : "1",
        chainId : chainId,
        verifyingContract : address(this)
        })
        );

        _thisAsOperator = LockedDeposit(address(this));
    }

    modifier onlyCreatedStatus(ApproveDepositPermit calldata permit) {
        bytes32 hash = hashStruct(permit);
        require(permitsStatus[hash] == PermitStatus.Created, "LockedDeposit: state mismatch, only created status.");
        _;
    }

    modifier onlyExpiredDeadline(ApproveDepositPermit calldata permit) {
        bytes32 hash = hashStruct(permit);
        require(permits[hash].deadline <= block.timestamp, "LockedDeposit: deadline not expired.");
        require(permitsStatus[hash] == PermitStatus.WaitPermitSignature, "LockedDeposit: state mismatch, only wait permit signature status.");
        _;
    }

    /**
     * @dev see https://eips.ethereum.org/EIPS/eip-712#definition-of-domainseparator
     */
    function _hash(EIP712Domain memory eip712Domain)
    internal
    pure
    returns (bytes32)
    {
        return
        keccak256(
            abi.encode(
                EIP712DOMAIN_TYPEHASH,
                keccak256(bytes(eip712Domain.name)),
                keccak256(bytes(eip712Domain.version)),
                eip712Domain.chainId,
                eip712Domain.verifyingContract
            )
        );
    }

    /**
     * @dev see https://eips.ethereum.org/EIPS/eip-712#definition-of-encodedata
     */
    function hashStruct(ApproveDepositPermit memory permit)
    public
    pure
    returns (bytes32 hash)
    {
        return
        keccak256(
            abi.encode(
                APPROVE_DEPOSIT_PERMIT_TYPEHASH,
                permit.amount,
                permit.createdAt,
                permit.deadline,
                permit.investor,
                permit.team,
                permit.currency,
                permit.vestingContractAddress,
                permit.chainId
            )
        );
    }

    /**
     * @dev validate signature of permit and match with current network id
     * @param permit - permit to validate
     * @param signature - signature of permit
     */
    modifier requireApproveDepositPermit(
        ApproveDepositPermit calldata permit, Signature calldata signature
    ) {
        // EIP712 encoded
        bytes32 hash = hashStruct(permit);
        bytes32 digest =
        keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, hash)
        );

        // check signature
        (address signer, ECDSA.RecoverError error) = ECDSA.tryRecover(digest, signature.v, signature.r, signature.s);
        require(
            error == ECDSA.RecoverError.NoError,
            "Error while recovering signer address"
        );

        if (chainIdPublic == MAINNET_CHAIN_ID) {
            require(permit.investor == signer, "LockedDeposit: permit is not signed by investor.");
            require(permit.team == msg.sender, "LockedDeposit: sender address is wrong.");
        } else {
            require(permit.team == signer, "LockedDeposit: permit is not signed by team.");
            require(permit.investor == msg.sender, "LockedDeposit: sender address is wrong.");
        }
        _;
    }

    /**
     * @dev initialize a new deal for investor and team
     * @param permit - permit to initialize
     */
    function createDeal(ApproveDepositPermit memory permit) external {
        require(permit.amount > 0, "LockedDeposit: amount can't be zero.");
        require(permit.chainId > 0, "LockedDeposit: chain id can't be zero.");
        require(permit.investor != address(0), "LockedDeposit: investors address invalid.");
        require(permit.team != address(0), "LockedDeposit: teams address invalid.");
        require(permit.createdAt > 0, "LockedDeposit: timestamp invalid.");
        require(permit.deadline > block.timestamp + 30 days, "LockedDeposit: deadline invalid.");
        require(permit.vestingContractAddress == vestingContractAddress, "LockedDeposit: vesting contract address invalid.");

        // get final hash and check if permit already exists
        bytes32 hash = hashStruct(permit);
        require(permits[hash].chainId == 0, "LockedDeposit: permit already initialized.");

        // store ready to proceed
        permits[hash] = permit;
        // store in look up for investor and team
        permitsLookUp[permit.investor].push(permit);
        permitsLookUp[permit.team].push(permit);

        // updated status
        permitsStatus[hash] = PermitStatus.Created;
    }


    /**
     * @dev deposit required amount of funds in the locked deposit contract
     * @param permit - permit to deposit
     */
    function deposit(ApproveDepositPermit calldata permit) payable onlyCreatedStatus(permit) external {
        bytes32 hash = hashStruct(permit);

        permitsStatus[hash] = PermitStatus.WaitPermitSignature;
        // mainnet so we proceed with USDC deposit from investor
        if (chainIdPublic == MAINNET_CHAIN_ID) {
            require(permit.investor == msg.sender, "LockedDeposit: only investor allowed.");
            IERC20 token = IERC20(permit.currency);
            // check allowance
            require(token.allowance(permit.investor, address(_thisAsOperator)) >= permit.amount, "LockedDeposit: allowance amount is not enough.");
            _safeTransferFrom(token, permit.investor, address(_thisAsOperator), permit.amount);
            return;
        }

        require(permit.team == msg.sender, "LockedDeposit: only team allowed.");
        require(msg.value >= permit.amount, "LockedDeposit: amount less than expected.");

    }

    /**
     * @dev approve permit and save signature for another chain
     * @param permit - permit to approve
     * @param signature - signature of permit
     */
    function approve(ApproveDepositPermit calldata permit, Signature calldata signature)
    external
    {
        bytes32 hash = hashStruct(permit);
        require(permitsStatus[hash] != PermitStatus.Permitted, "LockedDeposit: permit already approved.");
        if (chainIdPublic == MAINNET_CHAIN_ID) {
            require(permit.team == msg.sender, "LockedDeposit: only team can approve permit.");
            permitsStatus[hash] = PermitStatus.Permitted;
            permitSignatures[hash] = signature;
            return;
        } else {
            require(permit.investor == msg.sender, "LockedDeposit: only investor can approve permit.");
            permitsStatus[hash] = PermitStatus.Permitted;
            permitSignatures[hash] = signature;
        }
    }

    /**
     * @dev claim deposit with permit from another chain
     * @param permit - permit to claim
     * @param signature - signature of permit signed by other party
     */
    function claimDeposit(ApproveDepositPermit calldata permit, Signature calldata signature)
    requireApproveDepositPermit(permit, signature)
    external {
        bytes32 hash = hashStruct(permit);
        require(permitsStatus[hash] != PermitStatus.Claimed, "LockedDeposit: permit already claimed.");

        permitsStatus[hash] = PermitStatus.Claimed;

        if (chainIdPublic == MAINNET_CHAIN_ID) {
            IERC20 token = IERC20(permit.currency);
            _safeTransfer(token, permit.team, permit.amount);
            return;
        }

        IVesting vestingContract = IVesting(permit.vestingContractAddress);
        require(vestingContract.deposit{value : permit.amount}(permit.investor), "LockedDeposit: failed to send deposit.");
    }

    /**
     * @dev claim deposit if permit deadline has passed
     * @param permit - permit to withdraw
     */
    function claimOnDeadline(ApproveDepositPermit calldata permit) external onlyExpiredDeadline(permit) {
        bytes32 hash = hashStruct(permit);
        require(permitsStatus[hash] != PermitStatus.Refunded, "VerifiedDeposit: permit already refunded.");
        permitsStatus[hash] = PermitStatus.Refunded;
        if (chainIdPublic == MAINNET_CHAIN_ID) {
            IERC20 token = IERC20(permit.currency);
            _safeTransfer(token, permit.investor, permit.amount);
            return;
        }

        (bool sent,) = payable(permit.team).call{value : permit.amount}("");
        require(sent, "LockedDeposit: failed to send ether on claim on deadline.");
    }

    /**
     * @dev get signature by permit hash
     * @param permit struct
     */
    function getSignatureByPermit(ApproveDepositPermit calldata permit) public view returns (Signature memory signature) {
        bytes32 hash = hashStruct(permit);
        return permitSignatures[hash];
    }

    /**
     * @dev recover signer address from permit and signature
     * @param permit struct
     * @param signature struct
     */
    function getSigner(ApproveDepositPermit calldata permit, Signature calldata signature) public view returns (address) {
        // EIP712 encoded
        bytes32 hash = hashStruct(permit);
        bytes32 digest =
        keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, hash)
        );

        address signer = ecrecover(digest, signature.v, signature.r, signature.s);
        return signer;
    }

    function _safeTransferFrom(
        IERC20 token,
        address sender,
        address recipient,
        uint amount
    ) private {
        bool sent = token.transferFrom(sender, recipient, amount);
        require(sent, "LockedDeposit: token transfer from failed.");
    }

    function _safeTransfer(
        IERC20 token,
        address recipient,
        uint amount
    ) private {
        bool sent = token.transfer(recipient, amount);
        require(sent, "LockedDeposit: token transfer failed.");
    }

}