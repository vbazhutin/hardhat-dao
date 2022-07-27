const { ethers, network } = require("hardhat")
const {
    FUNCTION,
    NEW_STORE_VALUE,
    PROPOSAL_DESCRIPTION,
    VOTING_DELAY,
    proposalsFile,
} = require("../helper-hardhat-config")
const fs = require("fs")
const { moveBlocks } = require("../utils/move-blocks")

async function propose(args, functionToCall, proposalDescription) {
    const chainId = network.config.chainId
    const governor = await ethers.getContract("GovernorContract")
    const box = await ethers.getContract("Box")
    const encodedFunctionCall = box.interface.encodeFunctionData(functionToCall, args)

    console.log(`Proposing ${functionToCall} on ${box.address} with ${args}`)
    console.log(`Proposal Description: ${proposalDescription}`)
    const proposeTx = await governor.propose(
        [box.address],
        [0],
        [encodedFunctionCall],
        proposalDescription
    )

    if (chainId == 31337) {
        await moveBlocks(VOTING_DELAY + 1)
    }

    const proposeReceipt = await proposeTx.wait(1)
    const proposalId = proposeReceipt.events[0].args.proposalId
    console.log(`Proposed with proposal ID: ${proposalId}`)

    let proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"))
    proposals[chainId.toString()].push(proposalId.toString())

    fs.writeFileSync(proposalsFile, JSON.stringify(proposals))
}

propose([NEW_STORE_VALUE], FUNCTION, PROPOSAL_DESCRIPTION)
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
