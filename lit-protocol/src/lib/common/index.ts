
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
import { AuthCallback } from "@lit-protocol/types";

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

export async function getSessionSigs(litNodeClient: LitJsSdk.LitNodeClientNodeJs, ethersSigner:  ethers.ethers.Wallet) {
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
    authNeededCallback: getAuthNeededCallback(litNodeClient, ethersSigner) as AuthCallback,
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

type EncryptionParams = {
    litNodeClient: any;
    ethersSigner: any;
    textData: string;
  };
  
  type DecryptionParams = {
    litNodeClient: any;
    ethersSigner: any;
    ciphertext: string;
    dataToEncryptHash: string;
  };
  
  export const encryptData2 = async ({ litNodeClient, ethersSigner, textData }: EncryptionParams) => {
    // const sessionSigs = await getSessionSigs(litNodeClient, ethersSigner);
  
    const chain = 'ethereum';
    // const accessControlConditions = 
  
    // console.log('sessionSigs===================', sessionSigs);
  
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
        // sessionSigs: sessionSigs as any,
        // chain,
        dataToEncrypt: textData,
      },
      litNodeClient
    );
  
    console.log("cipher text:", ciphertext, "hash:", dataToEncryptHash);
    return { ciphertext, dataToEncryptHash };
  };
  
  export const decryptData2 = async ({ litNodeClient, ethersSigner, ciphertext, dataToEncryptHash }: DecryptionParams) => {
    const chain = 'ethereum';
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
    })();`;
  
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
      sessionSigs,
      jsParams: {
        accessControlConditions,
        ciphertext,
        dataToEncryptHash,
      },
    });
  
    console.log("decrypted content sent from lit action:", res);
    return res;
  };
  
