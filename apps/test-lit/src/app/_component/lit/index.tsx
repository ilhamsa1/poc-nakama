'use client';
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { useEffect } from "react";

const litActionCode = `
const go = async () => {
  // test an access control condition
  const testResult = await Lit.Actions.checkConditions({conditions, authSig, chain})

  console.log('testResult', testResult)

  // only sign if the access condition is true
  if (!testResult){
    return;
  }

  const message = new Uint8Array(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode('Hello world'))
  );
  // this is the string "Hello World" for testing, hashed with sha-256 above.
  const toSign = message;
  // this requests a signature share from the Lit Node
  // the signature share will be automatically returned in the HTTP response from the node
  const sigShare = await LitActions.signEcdsa({ toSign, publicKey: "0x02e5896d70c1bc4b4844458748fe0f936c7919d7968341e391fb6d82c258192e64", sigName: "sig1" });
};



go();
`;

const authSig = {
    sig: "0x2bdede6164f56a601fc17a8a78327d28b54e87cf3fa20373fca1d73b804566736d76efe2dd79a4627870a50e66e1a9050ca333b6f98d9415d8bca424980611ca1c",
    derivedVia: "web3.eth.personal.sign",
    signedMessage:
      "localhost wants you to sign in with your Ethereum account:\n0x9D1a5EC58232A894eBFcB5e466E3075b23101B89\n\nThis is a key for Partiful\n\nURI: https://localhost/login\nVersion: 1\nChain ID: 1\nNonce: 1LF00rraLO4f7ZSIt\nIssued At: 2022-06-03T05:59:09.959Z",
    address: "0x9D1a5EC58232A894eBFcB5e466E3075b23101B89",
  };

  const runLitAction = async () => {

    const litNodeClient = new LitJsSdk.LitNodeClient({
        litNetwork: "datil-dev",
      });
    
    await litNodeClient.connect();
    
    const signatures =await litNodeClient.executeJs({
        code: litActionCode,
        sessionSigs: {},
        jsParams: {
          conditions: [
            {
              conditionType: "evmBasic",
              contractAddress: "",
              standardContractType: "",
              chain: "ethereum",
              method: "eth_getBalance",
              parameters: [":userAddress", "latest"],
              returnValueTest: {
                comparator: ">=",
                value: "1",
              },
            },
          ],
          authSig: {
            sig: "0x2bdede6164f56a601fc17a8a78327d28b54e87cf3fa20373fca1d73b804566736d76efe2dd79a4627870a50e66e1a9050ca333b6f98d9415d8bca424980611ca1c",
            derivedVia: "web3.eth.personal.sign",
            signedMessage:
              "localhost wants you to sign in with your Ethereum account:\n0x9D1a5EC58232A894eBFcB5e466E3075b23101B89\n\nThis is a key for Partiful\n\nURI: https://localhost/login\nVersion: 1\nChain ID: 1\nNonce: 1LF00rraLO4f7ZSIt\nIssued At: 2022-06-03T05:59:09.959Z",
            address: "0x9D1a5EC58232A894eBFcB5e466E3075b23101B89",
          },
          chain: "ethereum",
        },
      });
      console.log("signatures: ", signatures);
    };

const encript = async (message: string) => {
    const chain = 'ethereum';
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

  const client = new LitNodeClient({
    litNetwork: "datil-dev"
  });
  await client.connect();
  const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
    {
      accessControlConditions,
      sessionSigs: {}, // your session
      chain,
      dataToEncrypt: message,
    },
    client
  );

  console.log("cipher text:", ciphertext, "hash:", dataToEncryptHash);
}
const Lit = () => {
    useEffect(() => {
        encript("hola");
        runLitAction();
    }, []);

  return (
    <div>
      <h1>Lit</h1>
    </div>
  );
};

export default Lit;