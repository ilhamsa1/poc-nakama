
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { LIT_RPC, LitNetwork } from "@lit-protocol/constants";
import { AuthMethodScope, AuthMethodType } from '@lit-protocol/constants';
import { checkAndSignAuthMessage } from '@lit-protocol/lit-node-client';

import { LitNodeClient } from "@lit-protocol/lit-node-client";
import {
  LitAbility,
  LitAccessControlConditionResource,
  generateAuthSig,
  createSiweMessageWithRecaps, 
  LitActionResource,
  LitPKPResource
  } from "@lit-protocol/auth-helpers";

//   import { LitContracts } from '@lit-protocol/contracts-sdk';


import * as ethers from "ethers";

declare global {
  interface Window{
    ethereum: ethers.providers.ExternalProvider;
  }
}

// interface LitConnection {
//    litNodeClient: LitJsSdk.LitNodeClient;
//    chain: string;
// }

// export function litProtocol(): string {
//   return 'lit-protocol';
// }

// async function connectToLit(chain: string): Promise<LitConnection> {
//   const litNodeClient = new LitJsSdk.LitNodeClient({
//      litNetwork: LitNetwork.DatilDev,
//   });
//   await litNodeClient.connect();

//   return {
//      litNodeClient,
//      chain,
//   };
// }

// export const getContractClient = async () => {

//   const dAppOwnerWallet = new ethers.Wallet('4ba23c46fb90baa9ca829f683beafe7a59dcfadab59b587de46a5b01c11f8362');
  
//   const client = new LitContracts({
//     signer: dAppOwnerWallet,
//     network: LitNetwork.DatilDev,
//     rpc: LIT_RPC.CHRONICLE_YELLOWSTONE,
//   });
  
//   await client.connect();
// }

export async function getSessionSigs(litNodeClient, ethersSigner) {
  console.log("Getting Session Signatures...");
  return await litNodeClient.getSessionSigs({
    chain: "ethereum",
    expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
    resourceAbilityRequests: [
      {
        resource: new LitPKPResource("*"),
        ability: LitAbility.PKPSigning,
      },
      {
        resource: new LitActionResource("*"),
        ability: LitAbility.LitActionExecution,
      },
    ],
    authNeededCallback: getAuthNeededCallback(litNodeClient, ethersSigner),
  });
}


function getAuthNeededCallback(litNodeClient, ethersSigner) {
  return async ({ resourceAbilityRequests, expiration, uri }) => {
    const toSign = await createSiweMessageWithRecaps({
      uri,
      expiration,
      resources: resourceAbilityRequests,
      walletAddress: await ethersSigner.getAddress(),
      nonce: await litNodeClient.getLatestBlockhash(),
      litNodeClient,
    });

    const authSig = await generateAuthSig({
      signer: ethersSigner,
      toSign,
    });

    return authSig
  };
}

export const encryptData = async (textData: string) => {
  const ethersSigner = await getEthereumSigner();
  const litNodeClient = await getLitNodeClient();
  const sessionSigs = await getSessionSigs(litNodeClient, ethersSigner);

    const chain = 'ethereum';
    // const accessControlConditions = 

  console.log('sessionSigs===================', sessionSigs)

  const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
    {
      accessControlConditions: [
        {
          contractAddress: '',
          standardContractType: '',
          chain,
          method: 'eth_getBalance',
          parameters: [':userAddress', 'latest'],
          returnValueTest: {
            comparator: '>=',
            value: '0',
          },
        },
      ],
      // sessionSigs, // your session
      // chain,
      dataToEncrypt: textData,
    },
    litNodeClient
  );

  console.log("cipher text:", ciphertext, "hash:", dataToEncryptHash);
  return { ciphertext, dataToEncryptHash };
}
    
export const decryptData = async (ciphertext: string, dataToEncryptHash: string) => {
  const chain = 'ethereum';

  const ethersSigner = await getEthereumSigner();
  const litNodeClient = await getLitNodeClient();

  const sessionSigs = await getSessionSigs(litNodeClient, ethersSigner);
  const code = `(async () => {
    const resp = await Lit.Actions.decryptAndCombine({
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      authSig: null,
      chain: 'ethereum',
    });
  
    Lit.Actions.setResponse({ response: resp });
  })();`

  const accessControlConditions = [
    {
      contractAddress: '',
      standardContractType: '',
      chain,
      method: 'eth_getBalance',
      parameters: [':userAddress', 'latest'],
      returnValueTest: {
        comparator: '>=',
        value: '0',
      },
    },
  ];
  
  const res = await litNodeClient.executeJs({
    code,
    sessionSigs, // your session
    jsParams: {
        accessControlConditions,
        ciphertext,
        dataToEncryptHash
    }
  });
  
  console.log("decrypted content sent from lit action:", res);
  return res
}

export async function getLitNodeClient() {
  const litNodeClient = new LitNodeClient({
    litNetwork: LitNetwork.DatilDev,
  });

  console.log("Connecting litNodeClient to network...");
  await litNodeClient.connect();

  console.log("litNodeClient connected!");
  return litNodeClient;
}

export const getEthereumSigner = async () => {
  console.log("Connecting to metamask...");
    if (!window?.ethereum) {
      console.error("No metamask");
      return null;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const ethersSigner = provider.getSigner();
    console.log("Connected account:", await ethersSigner.getAddress());

    return ethersSigner;
}

  // export const signMessage = async (message: string) => {
  //   const provider = new ethers.providers.Web3Provider(window.ethereum);
  //   await provider.send("eth_requestAccounts", []);
  //   const ethersSigner = provider.getSigner();
  //   console.log("Connected account:", await ethersSigner.getAddress());
  //   const litNodeClient = await getLitNodeClient();
  //   const sessionSigs = await getSessionSigs(litNodeClient, ethersSigner);

  //   const code = `(async () => {
  //     // sign "hello world" and allow all the nodes to combine the signature and return it to the action.
  //     const utf8Encode = new TextEncoder();
  //     const toSign = utf8Encode.encode('hello world');
  //     ethers.utils.arrayify(
  //       ethers.utils.keccak256(toSign)
  //     );
  //     // Will use the authentication provided to the "executeJs" call from the sdk on the client.
  //     const signature = await Lit.Actions.signAndCombineEcdsa({
  //       toSign,
  //       publicKey,
  //       sigName,
  //     });
      
  //     // Set the response from the action as the signature share which will not need combination on the client
  //     Lit.Actions.setResponse({ response: JSON.stringify(signature) });
  //   })()`;
    
  //   const client = new LitNodeClient({
  //       litNetwork: "datil-dev",
  //   });
  //   await client.connect();
  //   const res = await client.executeJs({
  //       code,
  //       sessionSigs, // your session
  //       jsParams: {
  //         publicKey: pkpPublicKey,
  //         sigName: 'sig1',
  //       }
  //   });
    
  //   console.log("response from singing in a transaction: ", res);

  //   return res
  // }

export const signMessage = async (message: string) => {
  console.log("message-------------ccc", message);
  const ethersSigner = await getEthereumSigner();
  const litNodeClient = await getLitNodeClient();
  const sessionSigs = await getSessionSigs(litNodeClient, ethersSigner);
  console.log("sessionSigs--------------", sessionSigs);
  
  const code = `(async () => {
    const utf8Encode = new TextEncoder();
    // const toSign = ethers.utils.arrayify(
    //   ethers.utils.keccak256(utf8Encode.encode('${message}'))
    // );
     const toSign = [84, 104, 105, 115, 32, 109, 101, 115, 115, 97, 103, 101, 32, 105, 115, 32, 101, 120, 97, 99, 116, 108, 121, 32, 51, 50, 32, 98, 121, 116, 101, 115]; 

    const signature = await Lit.Actions.signEcdsa({
      toSign,
      publicKey,
      sigName,
    });
    
    Lit.Actions.setResponse({ response: JSON.stringify(signature) });
  })()`;

//   const code = `
//     const go = async () => {
//       const utf8Encode = new TextEncoder();

//     const dataToSign = ethers.utils.arrayify(ethers.utils.keccak256(utf8Encode.encode('hello world')));
//     // The params toSign, publicKey, sigName are passed from the jsParams fields and are available here
//     const sigShare = await Lit.Actions.signEcdsa({ toSign: dataToSign, publicKey, sigName });
//     };

//     go();
// `;
  

// const code = `(async () => {
//   const sigName = "sig1";
//   // example transaction
//   let txn = {
//       to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
//       value: 1000000000000000,
//       gasPrice: 20000000000,
//       nonce: 0,
//   };

//   // using ether's serializeTransaction
//   // https://docs.ethers.org/v5/api/utils/transactions/#transactions--functions
//   const serializedTx = ethers.utils.serializeTransaction(txn);
//   let hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(serializedTx));
//   // encode the message into an uint8array for signing
//   const toSignData = await new TextEncoder().encode(hash);
//   const signature = await Lit.Actions.signEcdsa({
//       toSign: toSignData,
//       publicKey,
//       sigName,
//   });

//   // here we're setting the response to the signature output, but there's no need to do this
//   // if your use case requires the signature to not be seen by the client
//   Lit.Actions.setResponse({
//     response: signature
//   });
// })();
// `;

// const litActionCode = `
// const go = async () => {  
//   const url = "https://api.weather.gov/gridpoints/TOP/31,80/forecast";
//   const resp = await fetch(url).then((response) => response.json());
//   const temp = resp.properties.periods[0].temperature;

//   // only sign if the temperature is above 60.  if it's below 60, exit.
//   if (temp < 60) {
//     return;
//   }
  
//   // this requests a signature share from the Lit Node
//   // the signature share will be automatically returned in the HTTP response from the node
//   // all the params (toSign, publicKey, sigName) are passed in from the LitJsSdk.executeJs() function
//   const sigShare = await LitActions.signEcdsa({ toSign, publicKey , sigName });

//     return Lit.Actions.setResponse({ response: JSON.stringify(sigShare) });
//   };

// go();
// `;

// const codeEncrypt = `
// (async () => {
//     const LIT_PREFIX = 'lit_';

//     const result = await Lit.Actions.runOnce(
//         { waitForResponse: true, name: 'encryptedPrivateKey' },
//         async () => {
//             // BIP-32 secret key generation logic
//             const bip32 = require('bip32');
//             const bitcoin = require('bitcoinjs-lib'); // You may need this for networks and other utilities
            
//             const network = bitcoin.networks.bitcoin; // or use testnet: bitcoin.networks.testnet
//             const seed = bitcoin.crypto.sha256('some random seed'); // Replace with an actual seed generation method
//             const root = bip32.fromSeed(seed, network);
//             const generatedPrivateKey = root.toWIF(); // Get the private key in Wallet Import Format (WIF)

//             const private_key = \`\${LIT_PREFIX}\${generatedPrivateKey}\`;

//             const utf8Encode = new TextEncoder();
//             const encodedPrivateKey = utf8Encode.encode(
//                private_key  // For enhanced security, you should prepend all generated private keys with "lit_"
//             );

//             const { ciphertext, dataToEncryptHash } = await Lit.Actions.encrypt({
//                 accessControlConditions, // This should be passed into the Lit Action
//                 to_encrypt: encodedPrivateKey,
//             });
//             return JSON.stringify({
//                 ciphertext,
//                 dataToEncryptHash,
//                 // Return the public key for the generated private key as a string.
//                 publicKey: root.publicKey.toString('hex'), // Get the public key as a hex string
//             });
//         }
//     );

//     // Any other code you'd like to run...

//     Lit.Actions.setResponse({
//         response: result,
//     });
// })();
// `;

// const code = `
// (async () => {
//     const sigName = "sig1";
//     // example transaction
//     let txn = {
//         to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
//         value: 1,
//         gasPrice: 20000000000,
//         nonce: 0,
//     };

//     // using ether's serializeTransaction
//     // https://docs.ethers.org/v5/api/utils/transactions/#transactions--functions
//     const serializedTx = ethers.utils.serializeTransaction(txn);
//     let hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(serializedTx));
//     // encode the message into an uint8array for signing
//     const toSignData = await new TextEncoder().encode(hash);

//     const signature = await Lit.Actions.signAndCombineEcdsa({
//         toSign: toSignData,
//         publicKey,
//         sigName,
//     });

//     // the code in the function given to runOnce below will only be run by one node
//     let res = await Lit.Actions.runOnce({ waitForResponse: true, name: "txnSender" }, async () => {
//         // get the node operator's rpc url for the 'ethereum' chain
//         const rpcUrl = await Lit.Actions.getRpcUrl({ chain: "ethereum" });
//         const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
//         const tx = await provider.sendTransaction(signature);
//         return tx.blockHash; // return the tx to be broadcast to all other nodes
//     });

//     // set the response from the action as the result of runOnce operation
//     // will be sent by all nodes, even though only a single node did the computation
//     Lit.Actions.setResponse(res);
// })()
// `

const _message = new Uint8Array(
  await crypto.subtle.digest('SHA-256', new TextEncoder().encode('Hello world'))
);

console.log("message-------------", _message);

  const res = await litNodeClient.executeJs({
      code,
      sessionSigs, // your session
      jsParams: {
        publicKey: '0x04ab898b2a19e08a57b958435fbf567addbfa74c74a243407c1e30e1bbfa87f116987c012698cb4d02bada37def4accec0c15af67822648b3a0304750f8957a21c',
        sigName: 'sig99xxxxxxxxxx',
        toSign: _message,
      }
  });
  
  console.log("response from singing in a transaction: ", res);

  return res
}
