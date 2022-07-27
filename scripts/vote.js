const fs = require("fs")
const { network, ethers } = require("hardhat")
const { proposalsFile, VOTING_PERIOD } = require("../helper-hardhat-config")
const { moveBlocks } = require("../utils/move-blocks")

const index = 0

async function main(proposalIndex) {
    const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"))
    // You could swap this out for the ID you want to use too
    const proposalId = proposals[network.config.chainId][proposalIndex]
    // 0 = Against, 1 = For, 2 = Abstain for this example
    const voteWay = 1
    const reason = "Mercury in retrograde"
    await vote(proposalId, voteWay, reason)
}

// 0 = Against, 1 = For, 2 = Abstain for this example
async function vote(proposalId, voteWay, reason) {
    console.log("Voting...")
    const governor = await ethers.getContract("GovernorContract")
    const voteTx = await governor.castVoteWithReason(proposalId, voteWay, reason)
    const voteTxReceipt = await voteTx.wait(1)
    console.log(voteTxReceipt.events[0].args.reason)
    const proposalState = await governor.state(proposalId)
    console.log(`Current Proposal State: ${proposalState}`)

    if (network.config.chainId == 31337) {
        await moveBlocks(VOTING_PERIOD + 1)
    }
}

main(index)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
