const { deployments, getNamedAccounts, network, ethers } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async () => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const args = []

    log("\n--------------------")
    const box = await deploy("Box", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations,
    })

    const timeLock = await ethers.getContract("TimeLock")
    const boxContract = await ethers.getContract("Box")
    const transferOwnerTx = await boxContract.transferOwnership(timeLock.address)
    await transferOwnerTx.wait(1)

    log("Ownership of Box contract transfered to TimeLock contract")

    if (network.config.chainId !== 31337 && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(governorToken.address, args)
    }
}

module.exports.tags = ["box"]
