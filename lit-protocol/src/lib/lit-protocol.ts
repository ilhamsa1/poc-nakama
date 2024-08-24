
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

  import { LitContracts } from '@lit-protocol/contracts-sdk';


import * as ethers from "ethers";

interface LitConnection {
   litNodeClient: LitJsSdk.LitNodeClient;
   chain: string;
}

export function litProtocol(): string {
  return 'lit-protocol';
}

async function connectToLit(chain: string): Promise<LitConnection> {
  const litNodeClient = new LitJsSdk.LitNodeClient({
     litNetwork: LitNetwork.DatilDev,
  });
  await litNodeClient.connect();

  return {
     litNodeClient,
     chain,
  };
}

export const getContractClient = async () => {
  const dAppOwnerWallet = new ethers.Wallet('4ba23c46fb90baa9ca829f683beafe7a59dcfadab59b587de46a5b01c11f8362');
  const client = new LitContracts({
    signer: dAppOwnerWallet,
    network: LitNetwork.DatilDev,
    rpc: LIT_RPC.CHRONICLE_YELLOWSTONE,
  });
  
  await client.connect();
}

export async function getSessionSigs(litNodeClient, ethersSigner) {
  console.log("Getting Session Signatures...");
  return litNodeClient.getSessionSigs({
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


// export const authSig = {
//   sig: "0x2bdede6164f56a601fc17a8a78327d28b54e87cf3fa20373fca1d73b804566736d76efe2dd79a4627870a50e66e1a9050ca333b6f98d9415d8bca424980611ca1c",
//   derivedVia: "web3.eth.personal.sign",
//   signedMessage:
//     "localhost wants you to sign in with your Ethereum account:\n0x9D1a5EC58232A894eBFcB5e466E3075b23101B89\n\nThis is a key for Partiful\n\nURI: https://localhost/login\nVersion: 1\nChain ID: 1\nNonce: 1LF00rraLO4f7ZSIt\nIssued At: 2022-06-03T05:59:09.959Z",
//   address: "0x9D1a5EC58232A894eBFcB5e466E3075b23101B89",
// };


const authSig = {
  "sig": "e2fc08f887764365543e36e78a31c98cb5b14242466eb464ebb5def933106d31c780d5d22356c5ca2474860b05fd6058d4f21abb89bc4e94cad0f75e1ca19b08",
  "derivedVia": "litSessionSignViaNacl",
  "signedMessage": "{\"sessionKey\":\"e6497d50ed9486b531455850529cfbaac441b640201b01cf02c33744f582884e\",\"resourceAbilityRequests\":[{\"resource\":{\"resource\":\"*\",\"resourcePrefix\":\"lit-pkp\"},\"ability\":\"pkp-signing\"},{\"resource\":{\"resource\":\"*\",\"resourcePrefix\":\"lit-litaction\"},\"ability\":\"lit-action-execution\"}],\"capabilities\":[{\"sig\":\"0x220a68ef0ce79032dda4c50df24fdb3e91dd16c93789c3e0580632847dc67b8f4bdbee97256bb2290d50788dedfab529738ea43a4d7bf8af53fd4a62b8b1ac4d1b\",\"derivedVia\":\"web3.eth.personal.sign\",\"signedMessage\":\"localhost wants you to sign in with your Ethereum account:\\n0xc6A73FEcBE0a36acF4D87C2d0246d7573466E868\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'.\\n\\nURI: lit:session:e6497d50ed9486b531455850529cfbaac441b640201b01cf02c33744f582884e\\nVersion: 1\\nChain ID: 1\\nNonce: 0x51763ca8e5f52643bfd6aca11d901b252428e94a36d21e86bf6eccc3411ac947\\nIssued At: 2024-08-19T04:58:50.430Z\\nExpiration Time: 2024-08-20T04:58:49.019Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfX0sInByZiI6W119\",\"address\":\"0xc6A73FEcBE0a36acF4D87C2d0246d7573466E868\"}],\"issuedAt\":\"2024-08-19T08:51:02.002Z\",\"expiration\":\"2024-08-20T08:51:01.624Z\",\"nodeAddress\":\"https://15.235.83.220:7470\"}",
  "address": "e6497d50ed9486b531455850529cfbaac441b640201b01cf02c33744f582884e",
  "algo": "ed25519"
}

export const pkpMinting = async () => {
  const controllerWallet = await getContractClient();

  const contractClient = new LitContracts({
    signer: controllerWallet,
  });

  await contractClient.connect();

  const authMethod = {
    authMethodType: AuthMethodType.EthWallet,
    accessToken: JSON.stringify(authSig),
  };
  
  const mintInfo = await contractClient.mintWithAuth({
    authMethod: authMethod,
    scopes: [
          // AuthMethodScope.NoPermissions,
          AuthMethodScope.SignAnything, 
          AuthMethodScope.PersonalSign
      ],
  });

  console.log(mintInfo, 'mintInfo')

  return mintInfo
};

export async function getLitNodeClient() {
  const litNodeClient = new LitNodeClient({
    litNetwork: LitNetwork.DatilDev,
  });

  console.log("Connecting litNodeClient to network...");
  await litNodeClient.connect();

  console.log("litNodeClient connected!");
  return litNodeClient;
}


export const signMessage = async (message: string) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const ethersSigner = provider.getSigner();
  console.log("Connected account:", await ethersSigner.getAddress());
  const litNodeClient = await getLitNodeClient();
  const sessionSigs = await getSessionSigs(litNodeClient, ethersSigner);

  const code = `(async () => {
    const utf8Encode = new TextEncoder();
    const toSign = utf8Encode.encode('he');
    ethers.utils.arrayify(
      ethers.utils.keccak256(toSign)
    );
    const signature = await Lit.Actions.signAndCombineEcdsa({
      toSign,
      publicKey,
      sigName,
    });
    
    Lit.Actions.setResponse({ response: JSON.stringify(signature) });
  })()`;
  

  const res = await litNodeClient.executeJs({
      code,
      sessionSigs, // your session
      jsParams: {
        publicKey: '0x04ab898b2a19e08a57b958435fbf567addbfa74c74a243407c1e30e1bbfa87f116987c012698cb4d02bada37def4accec0c15af67822648b3a0304750f8957a21c',
        sigName: 'sig1',
      }
  });
  
  console.log("response from singing in a transaction: ", res);

  return res
}


const pkpPublicKey = "043fbdeb1244cc190b79856979403b83b01af0db9c43f8fce0e1238e45964b34f50394e3aa956d5b87ec89df33b9d129ed358d96f9536cb8116f8181f8b5baa402";

export const contractPkp = {
  "pkp": {
      "tokenId": "0x8c2fcf32b024830a39ed21643b381818ef6ba42823ad3735a8e600c113f659db",
      "publicKey": "043fbdeb1244cc190b79856979403b83b01af0db9c43f8fce0e1238e45964b34f50394e3aa956d5b87ec89df33b9d129ed358d96f9536cb8116f8181f8b5baa402",
      "ethAddress": "0x5D1Dd45df9A7A685b1b9D493751ce7aB6C032538"
  },
  "tx": {
      "to": "0xF02b6D6b0970DB3810963300a6Ad38D8429c4cdb",
      "from": "0xc6A73FEcBE0a36acF4D87C2d0246d7573466E868",
      "contractAddress": null,
      "transactionIndex": 0,
      "gasUsed": {
          "type": "BigNumber",
          "hex": "0x1193f1"
      },
      "blockHash": "0x181e193e241e3b10fa48e6c74f55369844f1bef68e2ab9c529f7d81dd8794544",
      "transactionHash": "0xf73deec4ecc56b64a1ddb5126a19d3da9b01a1d0147f0ef43ffde3325f1b3a37",
      "blockNumber": 2677006,
      "confirmations": 1,
      "cumulativeGasUsed": {
          "type": "BigNumber",
          "hex": "0x1193f1"
      },
      "status": 1,
      "type": 0,
      "byzantium": true,
  }
}


export const generateAuthSigSign = async () => {
  console.log('dddddddd')
  const authSig = await checkAndSignAuthMessage({
    chain: "ethereum",
    nonce: new Date().toISOString(),
  });

  return authSig
}