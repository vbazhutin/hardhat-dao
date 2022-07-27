const { deployments, getNamedAccounts, network, ethers } = require("hardhat")
// const { verify } = require("../utils/verify")

module.exports = async () => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("--------------------")
    const args = []
    const governorToken = await deploy("GovernanceToken", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations,
    })

    if (network.config.chainId !== 31337 && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(governorToken.address, args)
    }

    await delegate(governorToken.address, deployer)
    console.log("Delegated!")
}

const delegate = async (governanceTokenAddress, delegatedAccount) => {
    const governorToken = await ethers.getContractAt("GovernanceToken", governanceTokenAddress)
    const tx = await governorToken.delegate(delegatedAccount)
    await tx.wait(1)
    console.log(`Checkpoints ${await governorToken.numCheckpoints(delegatedAccount)}`)
}
