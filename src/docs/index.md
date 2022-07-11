# Solidity API

## Initializable

_This is a base contract to aid in writing upgradeable contracts, or any kind of contract that will be deployed
behind a proxy. Since proxied contracts do not make use of a constructor, it&#x27;s common to move constructor logic to an
external initializer function, usually called &#x60;initialize&#x60;. It then becomes necessary to protect this initializer
function so it can only be called once. The {initializer} modifier provided by this contract will have this effect.
TIP: To avoid leaving the proxy in an uninitialized state, the initializer function should be called as early as
possible by providing the encoded function call as the &#x60;_data&#x60; argument to {ERC1967Proxy-constructor}.
CAUTION: When used with inheritance, manual care must be taken to not invoke a parent initializer twice, or to ensure
that all initializers are idempotent. This is not verified automatically as constructors are by Solidity.
[CAUTION]
&#x3D;&#x3D;&#x3D;&#x3D;
Avoid leaving a contract uninitialized.
An uninitialized contract can be taken over by an attacker. This applies to both a proxy and its implementation
contract, which may impact the proxy. To initialize the implementation contract, you can either invoke the
initializer manually, or you can include a constructor to automatically mark it as initialized when it is deployed:
[.hljs-theme-light.nopadding]
&#x60;&#x60;&#x60;_

### _initialized

```solidity
bool _initialized
```

_Indicates that the contract has been initialized._

### _initializing

```solidity
bool _initializing
```

_Indicates that the contract is in the process of being initialized._

### initializer

```solidity
modifier initializer()
```

_Modifier to protect an initializer function from being invoked twice._

### onlyInitializing

```solidity
modifier onlyInitializing()
```

_Modifier to protect an initialization function so that it can only be invoked by functions with the
{initializer} modifier, directly or indirectly._

### _isConstructor

```solidity
function _isConstructor() private view returns (bool)
```

## ReentrancyGuardUpgradeable

_Contract module that helps prevent reentrant calls to a function.
Inheriting from &#x60;ReentrancyGuard&#x60; will make the {nonReentrant} modifier
available, which can be applied to functions to make sure there are no nested
(reentrant) calls to them.
Note that because there is a single &#x60;nonReentrant&#x60; guard, functions marked as
&#x60;nonReentrant&#x60; may not call one another. This can be worked around by making
those functions &#x60;private&#x60;, and then adding &#x60;external&#x60; &#x60;nonReentrant&#x60; entry
points to them.
TIP: If you would like to learn more about reentrancy and alternative ways
to protect against it, check out our blog post
https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul]._

### _NOT_ENTERED

```solidity
uint256 _NOT_ENTERED
```

### _ENTERED

```solidity
uint256 _ENTERED
```

### _status

```solidity
uint256 _status
```

### __ReentrancyGuard_init

```solidity
function __ReentrancyGuard_init() internal
```

### __ReentrancyGuard_init_unchained

```solidity
function __ReentrancyGuard_init_unchained() internal
```

### nonReentrant

```solidity
modifier nonReentrant()
```

_Prevents a contract from calling itself, directly or indirectly.
Calling a &#x60;nonReentrant&#x60; function from another &#x60;nonReentrant&#x60;
function is not supported. It is possible to prevent this from happening
by making the &#x60;nonReentrant&#x60; function external, and making it call a
&#x60;private&#x60; function that does the actual work._

### __gap

```solidity
uint256[49] __gap
```

_This empty reserved space is put in place to allow future versions to add new
variables without shifting down storage in the inheritance chain.
See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps_

## AddressUpgradeable

_Collection of functions related to the address type_

### isContract

```solidity
function isContract(address account) internal view returns (bool)
```

_Returns true if &#x60;account&#x60; is a contract.
[IMPORTANT]
&#x3D;&#x3D;&#x3D;&#x3D;
It is unsafe to assume that an address for which this function returns
false is an externally-owned account (EOA) and not a contract.
Among others, &#x60;isContract&#x60; will return false for the following
types of addresses:
 - an externally-owned account
 - a contract in construction
 - an address where a contract will be created
 - an address where a contract lived, but was destroyed
&#x3D;&#x3D;&#x3D;&#x3D;
[IMPORTANT]
&#x3D;&#x3D;&#x3D;&#x3D;
You shouldn&#x27;t rely on &#x60;isContract&#x60; to protect against flash loan attacks!
Preventing calls from contracts is highly discouraged. It breaks composability, breaks support for smart wallets
like Gnosis Safe, and does not provide security since it can be circumvented by calling from a contract
constructor.
&#x3D;&#x3D;&#x3D;&#x3D;_

### sendValue

```solidity
function sendValue(address payable recipient, uint256 amount) internal
```

_Replacement for Solidity&#x27;s &#x60;transfer&#x60;: sends &#x60;amount&#x60; wei to
&#x60;recipient&#x60;, forwarding all available gas and reverting on errors.
https://eips.ethereum.org/EIPS/eip-1884[EIP1884] increases the gas cost
of certain opcodes, possibly making contracts go over the 2300 gas limit
imposed by &#x60;transfer&#x60;, making them unable to receive funds via
&#x60;transfer&#x60;. {sendValue} removes this limitation.
https://diligence.consensys.net/posts/2019/09/stop-using-soliditys-transfer-now/[Learn more].
IMPORTANT: because control is transferred to &#x60;recipient&#x60;, care must be
taken to not create reentrancy vulnerabilities. Consider using
{ReentrancyGuard} or the
https://solidity.readthedocs.io/en/v0.5.11/security-considerations.html#use-the-checks-effects-interactions-pattern[checks-effects-interactions pattern]._

### functionCall

```solidity
function functionCall(address target, bytes data) internal returns (bytes)
```

_Performs a Solidity function call using a low level &#x60;call&#x60;. A
plain &#x60;call&#x60; is an unsafe replacement for a function call: use this
function instead.
If &#x60;target&#x60; reverts with a revert reason, it is bubbled up by this
function (like regular Solidity function calls).
Returns the raw returned data. To convert to the expected return value,
use https://solidity.readthedocs.io/en/latest/units-and-global-variables.html?highlight&#x3D;abi.decode#abi-encoding-and-decoding-functions[&#x60;abi.decode&#x60;].
Requirements:
- &#x60;target&#x60; must be a contract.
- calling &#x60;target&#x60; with &#x60;data&#x60; must not revert.
_Available since v3.1.__

### functionCall

```solidity
function functionCall(address target, bytes data, string errorMessage) internal returns (bytes)
```

_Same as {xref-Address-functionCall-address-bytes-}[&#x60;functionCall&#x60;], but with
&#x60;errorMessage&#x60; as a fallback revert reason when &#x60;target&#x60; reverts.
_Available since v3.1.__

### functionCallWithValue

```solidity
function functionCallWithValue(address target, bytes data, uint256 value) internal returns (bytes)
```

_Same as {xref-Address-functionCall-address-bytes-}[&#x60;functionCall&#x60;],
but also transferring &#x60;value&#x60; wei to &#x60;target&#x60;.
Requirements:
- the calling contract must have an ETH balance of at least &#x60;value&#x60;.
- the called Solidity function must be &#x60;payable&#x60;.
_Available since v3.1.__

### functionCallWithValue

```solidity
function functionCallWithValue(address target, bytes data, uint256 value, string errorMessage) internal returns (bytes)
```

_Same as {xref-Address-functionCallWithValue-address-bytes-uint256-}[&#x60;functionCallWithValue&#x60;], but
with &#x60;errorMessage&#x60; as a fallback revert reason when &#x60;target&#x60; reverts.
_Available since v3.1.__

### functionStaticCall

```solidity
function functionStaticCall(address target, bytes data) internal view returns (bytes)
```

_Same as {xref-Address-functionCall-address-bytes-}[&#x60;functionCall&#x60;],
but performing a static call.
_Available since v3.3.__

### functionStaticCall

```solidity
function functionStaticCall(address target, bytes data, string errorMessage) internal view returns (bytes)
```

_Same as {xref-Address-functionCall-address-bytes-string-}[&#x60;functionCall&#x60;],
but performing a static call.
_Available since v3.3.__

### verifyCallResult

```solidity
function verifyCallResult(bool success, bytes returndata, string errorMessage) internal pure returns (bytes)
```

_Tool to verifies that a low level call was successful, and revert if it wasn&#x27;t, either by bubbling the
revert reason using the provided one.
_Available since v4.3.__

## HaqqVesting

### NUMBER_OF_PAYMENTS

```solidity
uint256 NUMBER_OF_PAYMENTS
```

_number of payments to be made to repay a deposit to beneficiary_

### TIME_BETWEEN_PAYMENTS

```solidity
uint256 TIME_BETWEEN_PAYMENTS
```

_Time period (in seconds) to unblock next payment._

### MAX_DEPOSITS

```solidity
uint256 MAX_DEPOSITS
```

### depositsCounter

```solidity
mapping(address &#x3D;&gt; uint256) depositsCounter
```

### Deposit

```solidity
struct Deposit {
  uint256 timestamp;
  uint256 sumInWeiDeposited;
  uint256 sumPaidAlready;
}
```

### deposits

```solidity
mapping(address &#x3D;&gt; mapping(uint256 &#x3D;&gt; struct HaqqVesting.Deposit)) deposits
```

_beneficiary address &#x3D;&gt; deposit_

### DepositMade

```solidity
event DepositMade(address beneficiaryAddress, uint256 depositId, uint256 timestamp, uint256 sumInWeiDeposited, address depositedBy)
```

_Event to be emitted, when deposit was made._

### deposit

```solidity
function deposit(address _beneficiaryAddress) external payable returns (bool success)
```

_Function to make a new deposit._

| Name | Type | Description |
| ---- | ---- | ----------- |
| _beneficiaryAddress | address | address that will receive payments from this deposit |

### totalPayoutsUnblocked

```solidity
function totalPayoutsUnblocked(address _beneficiaryAddress, uint256 _depositId) public view returns (uint256)
```

_Total payouts unlocked in the elapsed time.
One payment is unlocked immediately_

### amountForOneWithdrawal

```solidity
function amountForOneWithdrawal(address _beneficiaryAddress, uint256 _depositId) public view returns (uint256)
```

_Returns amount (in wei on Ethereum) that should be unlocked in one time period for the given deposit_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _beneficiaryAddress | address |  |
| _depositId | uint256 | deposit id |

### amountToWithdrawNow

```solidity
function amountToWithdrawNow(address _beneficiaryAddress, uint256 _depositId) public view returns (uint256)
```

_Returns amount available for withdrawal for given deposit at this time_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _beneficiaryAddress | address |  |
| _depositId | uint256 | deposit id |

### WithdrawalMade

```solidity
event WithdrawalMade(address beneficiary, uint256 sumInWei, address triggeredByAddress)
```

_Event that will be emitted, when withdrawal was made_

### calculateAvailableSumForAllDeposits

```solidity
function calculateAvailableSumForAllDeposits(address _beneficiaryAddress) external view returns (uint256)
```

_Returns sum currently available for withdrawal from all deposits for a given address_

### withdraw

```solidity
function withdraw(address _beneficiaryAddress) external returns (bool success)
```

_Function that transfers the amount currently due to the beneficiary address_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _beneficiaryAddress | address | beneficiary address |

### transferDepositRights

```solidity
function transferDepositRights(address _newBeneficiaryAddress) external
```

_Function that transfers ownership of deposits to new address_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _newBeneficiaryAddress | address | beneficiary address |

