// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BEPBSG is ERC20, Ownable, ERC20Burnable, ERC20Permit {
    uint256 private _cap;
    address private _robinHoodWallet;
    mapping(address => uint256) private _balances;
    mapping(address => bool) private blacklisted;

    event Blacklisted(address indexed account);
    event UnBlacklisted(address indexed account);

    event ChangeRobinHoodWallet(
        address indexed oldWallet,
        address indexed newWallet
    );

    constructor() ERC20("BlochChessGame", "BSG") ERC20Permit("BEPBSG") {
        _cap = 100_000_000 * 10**18;
        _robinHoodWallet = address(0);
    }

    
    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        address _owner = _msgSender();
        if (_owner != owner()) {
            require(!isBlacklisted(_owner) && !isBlacklisted(to), "BEP20: account is blacklisted");
        }
        _transfer(_owner, to, amount);
        return true;
    }

    function cap() public view returns (uint256) {
        return _cap;
    }

    function mint(uint256 amount) public onlyOwner {
        uint256 _totalSupply = totalSupply();
        _balances[_msgSender()] = _balances[_msgSender()] + amount;
        require(_totalSupply + amount <= _cap, "BEP20: cap exceeded");
        _mint(_msgSender(), amount);
    }

    /**
     * @dev Get robinHoodWallet address
     */
    function robinHoodWallet() public view returns(address) {
        return _robinHoodWallet;
    }

    /**
     * @dev Change robinHoodWallet address
     */
    function changeRobinHoodWallet(address newRobinHoodWallet)
        external
        onlyOwner
        returns (bool)
    {
        require(newRobinHoodWallet != owner(), "BEP20: not owner wallet");

        emit ChangeRobinHoodWallet(_robinHoodWallet, newRobinHoodWallet);

        _robinHoodWallet = newRobinHoodWallet;
        return true;
    }

    /**
     * @dev Checks if account is blacklisted
     */
    function isBlacklisted(address account) public view returns (bool) {
        return blacklisted[account];
    }

    /**
     * @dev Adds account to blacklist
     */
    function addToBlacklist(address account) external onlyOwner returns (bool) {
        require(account != address(0), "BEP20: blacklisted zero address");
        require(account != owner(), "BEP20: blacklisted owner");
        require(!blacklisted[account], "BEP20: already blacklisted");
        blacklisted[account] = true;
        emit Blacklisted(account);
        return true;
    }

    /**
     * @dev Removes account from blacklist
     */
    function removeFromBlacklist(address account)
        external
        onlyOwner
        returns (bool)
    {
        require(blacklisted[account], "BEP20: not yet blacklisted");
        blacklisted[account] = false;
        emit UnBlacklisted(account);
        return true;
    }

    /**
    * @dev Takes `amount` tokens from `target`. Target must be blacklisted.
    * Requirements
    *
    * - `msg.sender` must be the token owner
    */
    function takeBlackFunds(address target, uint256 amount) external onlyOwner returns(bool) {
        require(isBlacklisted(target), "BEP20: target must be blacklisted");
        _transfer(target, _robinHoodWallet, amount);
        return true;
    }
}
