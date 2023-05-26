const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token Contract", async () => {
  let TOKEN

  beforeEach(async () => {
    // Get owner as signer, account as customer 
    [owner, account,] = await ethers.getSigners();

    // Deploy smart contract
    const Token = await ethers.getContractFactory("BEPBSG");
    TOKEN = await Token.deploy();
    await TOKEN.deployed();
  })

  it('Total supply MUST BE equal to "0"',async()=>{
    expect(await TOKEN.totalSupply()).equal("0")
  })
  
  describe("Mint", () => {
    const amountToMint = 10000
    beforeEach(async()=>{
      // mint amountToMint tokens
      await TOKEN.mint(amountToMint)
    })

    it('"totalSupply" MUST BE equal to "amountToMint"',async()=>{
      expect(await TOKEN.totalSupply()).equal(amountToMint)
    })

    it('"Owner" MUST HAVE balance equal to "amountToMint"',async()=>{
      expect(await TOKEN.balanceOf(owner.address)).equal(amountToMint)
    })
  });

  describe('Mint over cap',()=>{
    it('MUST revert with "BEP20: cap exceeded"',async()=>{
      // get total cap
      const cap = await TOKEN.cap()

      // mint more than total cap
      await expect(TOKEN.mint(cap+1)).to.be.revertedWith('BEP20: cap exceeded')
    })
  })
});
