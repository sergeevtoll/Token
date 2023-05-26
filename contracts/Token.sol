// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BEPBSG is ERC20, Ownable, ERC20Burnable, ERC20Permit {
    uint256 private _cap;
    mapping(address => uint256) private _balances;

    event ChangeRobinHoodWallet(
        address indexed oldWallet,
        address indexed newWallet
    );

    constructor() ERC20("BlochChessGame", "BCG") ERC20Permit("BEPBCG") {
        _cap = 100_000_000 * 10**18;
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
}
