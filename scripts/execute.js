const { ethers } = require("hardhat")
const { FUNCTION, NEW_STORE_VALUE, PROPOSAL_DESCRIPTION } = require("../helper-hardhat-config")

async function execute() {
    const args = [NEW_STORE_VALUE]
    const functionToCall = FUNCTION
    const box = await ethers.getContract("Box")
    const encodedFunctionCall = box.interface.encodeFunctionData(functionToCall, args)
    const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION))

    const governor = await ethers.getContract("GovernorContract")
    console.log("Executing...")
    const executeTx = await governor.execute(
        [box.address],
        [0],
        [encodedFunctionCall],
        descriptionHash
    )
    await executeTx.wait(1)
    console.log(`Box value: ${await box.retrieve()}`)
}

execute()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
