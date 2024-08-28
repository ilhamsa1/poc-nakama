import { combineKeys, getEthereumSignerServerSide, getLitNodeClientServerSide } from '@poc/lit-protocol/server-side';
import { decryptData2, encryptData2 } from '@poc/lit-protocol/common';


export const test = async () => {
    const ethersSigner = await getEthereumSignerServerSide()
    const litNodeClient = await getLitNodeClientServerSide()
    const { ciphertext, dataToEncryptHash } = await encryptData2({
        ethersSigner,
        litNodeClient,
        textData: 'gegeg',
    })

    // const result = await decryptData2({
    //     ethersSigner,
    //     litNodeClient,
    //     ciphertext,
    //     dataToEncryptHash,
    // })

    const keys = await combineKeys({
        ethersSigner,
        litNodeClient,
    })

    console.log("keys ddddddd", keys)
    return keys
}