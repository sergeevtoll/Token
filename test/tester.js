const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token Contract", async () => {
  let TOKEN

  beforeEach(async () => {
    // Get owner as signer, account as customer and robinHood as robinHoodWallet 
    [owner, account, robinHood] = await ethers.getSigners();

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


  describe("RobinHood", () => {
    it('"robinHood" MUST BE as "zero account"',async()=>{
      expect(await TOKEN.robinHoodWallet()).equal(ethers.constants.AddressZero)
    })

    it('"robinHoodWaller" MUST BE as "robinHood" address', async () => {
      // change robinHoodWallet
      await TOKEN.changeRobinHoodWallet(robinHood.address)

      expect(await TOKEN.robinHoodWallet()).equal(robinHood.address)
    })
  });
  

  describe('Blacklist', () => {
    it('"account" MUST BE NOT Blacklisted', async () => {
      expect(await TOKEN.isBlacklisted(account.address)).equal(false)
    })

    describe('"account" is Blacklisted', async () => {
      const amountToFundAccount = '1000'
      beforeEach(async () => {
        // mint amountToFundAccount tokens
        await TOKEN.mint(amountToFundAccount)
        // adds account to blacklist
        await TOKEN.addToBlacklist(account.address)
        // funds account
        await TOKEN.transfer(account.address, amountToFundAccount)
        // set robinHood wallet
        await TOKEN.changeRobinHoodWallet(robinHood.address)
      })

      it('"account" MUST BE Blacklisted', async () => {
        expect(await TOKEN.isBlacklisted(account.address)).equal(true)
      })

      it('"account" MUST HAVE tokens amount as "amountToFundAccount"', async () => {
        expect(await TOKEN.balanceOf(account.address)).equal(amountToFundAccount)
      })

      it('"account" MUST BE NOT able to send tokens', async () => {
        await expect(TOKEN.connect(account).transfer(owner.address, amountToFundAccount))
          .to.be.revertedWith('BEP20: account is blacklisted')
      })

      it('"account" MUST BE able to send tokens', async () => {
        // remove account from blacklist
        await TOKEN.removeFromBlacklist(account.address)

        // send tokens
        await expect(TOKEN.connect(account).transfer(owner.address, amountToFundAccount))
          .to.emit(TOKEN, "Transfer");
      })

      it('"account" MUST HAVE tokens amount as "0"', async () => {
        // take tokens from account
        await TOKEN.takeBlackFunds(account.address, amountToFundAccount)

        expect(await TOKEN.balanceOf(account.address)).equal('0')
      })

      it('"robinHood" MUST HAVE tokens amount as "amountToFundAccount"', async () => {
        // take tokens from account
        await TOKEN.takeBlackFunds(account.address, amountToFundAccount)

        expect(await TOKEN.balanceOf(robinHood.address)).equal(amountToFundAccount)
      })
    })
  })
});
