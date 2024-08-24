'use server'
import { LitNetwork } from "@lit-protocol/constants";
import * as LitJsSdk from "@lit-protocol/lit-node-client-nodejs";
import { LocalStorage } from "node-localstorage";


import { LIT_RPC } from "@lit-protocol/constants";
import * as ethers from "ethers";
import { LitContracts } from "@lit-protocol/contracts-sdk";

export async function getLitNodeClientServerSide() {
    const litNodeClient = new LitJsSdk.LitNodeClientNodeJs({
        alertWhenUnauthorized: false,
        litNetwork: LitNetwork.DatilDev,
        storageProvider: {
          provider: new LocalStorage("./lit_storage.db"),
        }
      });
    
    console.log("Connecting litNodeClient to network...");
    await litNodeClient.connect();
  
    console.log("litNodeClient connected!");
    // TODO: await app.locals.litNodeClient.disconnect();

    return litNodeClient;
  }
  

  export async function getEthereumSignerServerSide() {
    // Change to PROCESS.ENV.PRIVATE_KEY
    const PRIVATE_KEY = '4ba23c46fb90baa9ca829f683beafe7a59dcfadab59b587de46a5b01c11f8362';
    
    const signer = new ethers.Wallet(
      PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    return signer
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
  