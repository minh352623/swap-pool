import {
    Box,
    Select,
    Button,
    FormControl,
    FormLabel,
    NumberInput,
    NumberInputField,
} from "@chakra-ui/react"
import { FC, useState } from "react"
import * as Web3 from "@solana/web3.js"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import {
    kryptMint,
    ScroogeCoinMint,
    tokenSwapStateAccount,
    swapAuthority,
    poolKryptAccount,
    poolScroogeAccount,
    poolMint,
    feeAccount,
} from "../utils/constants"
import { TokenSwap } from "@solana/spl-token-swap"
import * as token from "@solana/spl-token"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"

export const SwapToken: FC = () => {
    const [amount, setAmount] = useState(0)
    const [mint, setMint] = useState("")

    const { connection } = useConnection()
    console.log("🚀 ~ connection:", connection)
    const { publicKey, sendTransaction } = useWallet()

    const handleSwapSubmit = (event: any) => {
        event.preventDefault()
        handleTransactionSubmit()
    }

    const handleTransactionSubmit = async () => {
        if (!publicKey) {
            alert("Please connect your wallet!")
            return
        }
        const kryptMint = new Web3.PublicKey("FARX2rDGAPR918yMYkPdytPgBZVhjDdy6qAxoVk1ynLU");
        const ScroogeCoinMint = new Web3.PublicKey("3SKskRrrSyL2pLS7kqjUxvtU2zK7RS4rmyrqk2rgxFcu");
        const poolMint = new Web3.PublicKey("7pTefmpKRBbqHmBQuAGjbmC5Vtou9RU7HshQupQ2HSoo")
        const poolKryptAccount = new Web3.PublicKey("Xx5zqbHMsCF2vMp1HmPRrL3toHYygXG424LiqW223JC")
        const poolScroogeAccount = new Web3.PublicKey("H1o4E2YqT7t1WbCeWxWkRcRjzy3KdqYdbMUiYsFivwz1")
        const tokenSwapStateAccount = new Web3.PublicKey("8TWS6JYfuUzbm29tPDojYJNLmbZNmU535tdrZN18rF4G")
        const swapAuthority = new  Web3.PublicKey("v6kiac1wBPZKeB2HDo4bmC1yDUG2EuEBJHuCCp6P9ka")
        const feeAccount = new Web3.PublicKey("Bivkw61WGpjCG65wqPyKQKGr8MTsY5c2dBZVhobFLRBK")
        const TOKEN_SWAP_PROGRAM_ID = new Web3.PublicKey(
            'SwapsVeCiPHMUAtzQWZw7RjsKjgCjhwU55QGu4U1Szw',
          );

        const kryptMintInfo = await token.getMint(connection, kryptMint)
        const ScroogeCoinMintInfo = await token.getMint(
            connection,
            ScroogeCoinMint
        )

        const kryptATA = await token.getAssociatedTokenAddress(
            kryptMint,
            publicKey
        )
        const scroogeATA = await token.getAssociatedTokenAddress(
            ScroogeCoinMint,
            publicKey
        )
        const tokenAccountPool = await token.getAssociatedTokenAddress(
            poolMint,
            publicKey
        )

        const transaction = new Web3.Transaction()

        let account = await connection.getAccountInfo(tokenAccountPool)

        if (account == null) {
            console.log("account null");
            
            const createATAInstruction =
                token.createAssociatedTokenAccountInstruction(
                    publicKey,
                    tokenAccountPool,
                    publicKey,
                    poolMint
                )
            transaction.add(createATAInstruction)
        }

        if (mint == "option1") {
            const instruction = TokenSwap.swapInstruction(
                tokenSwapStateAccount,
                swapAuthority,
                publicKey,
                kryptATA,
                poolKryptAccount,
                poolScroogeAccount,
                scroogeATA,
                poolMint,
                feeAccount,
                null,
                TOKEN_SWAP_PROGRAM_ID,
                TOKEN_PROGRAM_ID,
                amount * 10 ** kryptMintInfo.decimals,
                0
            )

            transaction.add(instruction)
        } else if (mint == "option2") {
            const instruction = TokenSwap.swapInstruction(
                tokenSwapStateAccount,
                swapAuthority,
                publicKey,
                scroogeATA,
                poolScroogeAccount,
                poolKryptAccount,
                kryptATA,
                poolMint,
                feeAccount,
                null,
                TOKEN_SWAP_PROGRAM_ID,
                TOKEN_PROGRAM_ID,
                amount * 10 ** ScroogeCoinMintInfo.decimals,
                0
            )

            transaction.add(instruction)
        }
                console.log("🚀 ~ handleTransactionSubmit ~ TOKEN_PROGRAM_ID:", TOKEN_PROGRAM_ID.toBase58())
                console.log("🚀 ~ handleTransactionSubmit ~ TOKEN_SWAP_PROGRAM_ID:", TOKEN_SWAP_PROGRAM_ID.toBase58())

        try {
            let txid = await sendTransaction(transaction, connection)
            alert(
                `Transaction submitted: https://explorer.solana.com/tx/${txid}?cluster=testnet`
            )
            console.log(
                `Transaction submitted: https://explorer.solana.com/tx/${txid}?cluster=testnet`
            )
        } catch (e) {
            console.log(JSON.stringify(e))
            alert(JSON.stringify(e))
        }
    }

    return (
        <Box
            p={4}
            display={{ md: "flex" }}
            maxWidth="32rem"
            margin={2}
            justifyContent="center"
        >
            <form onSubmit={handleSwapSubmit}>
                <FormControl isRequired>
                    <FormLabel color="gray.200">Swap Amount</FormLabel>
                    <NumberInput
                        max={1000}
                        min={1}
                        onChange={(valueString) =>
                            setAmount(parseInt(valueString))
                        }
                    >
                        <NumberInputField id="amount" color="gray.400" />
                    </NumberInput>
                    <div style={{ display: "felx" }}>
                        <Select
                            display={{ md: "flex" }}
                            justifyContent="center"
                            placeholder="Token to Swap"
                            color="white"
                            variant="outline"
                            dropShadow="#282c34"
                            onChange={(item) =>
                                setMint(item.currentTarget.value)
                            }
                        >
                            <option
                                style={{ color: "#282c34" }}
                                value="option1"
                            >
                                {" "}
                                Krypt{" "}
                            </option>
                            <option
                                style={{ color: "#282c34" }}
                                value="option2"
                            >
                                {" "}
                                Scrooge{" "}
                            </option>
                        </Select>
                    </div>
                </FormControl>
                <Button width="full" mt={4} type="submit">
                    Swap ⇅
                </Button>
            </form>
        </Box>
    )
}
