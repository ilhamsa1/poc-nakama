'use client'

import { generateSecretKey, getPublicKey } from 'nostr-tools/pure'
import { finalizeEvent, verifyEvent } from 'nostr-tools/pure'
import { verifyMessageNoStr } from '@poc/lit-protocol/common'
import { getLitNodeClient, getEthereumSigner, getSessionSigs } from '@poc/lit-protocol'
import { useEffect, useRef, useState } from 'react'
import { LitNodeClient } from '@lit-protocol/lit-node-client'
import { ethers, Signer } from 'ethers'

const sk = generateSecretKey() // `sk` is a Uint8Array
// const pk = getPublicKey(sk) // `pk` is a hex string

const event = finalizeEvent({
    kind: 1,
    created_at: Math.floor(Date.now() / 1000),
    tags: [],
    content: 'hello',
  }, sk)  
  // const isGood = verifyEvent(event)



const Nostr = () => {
  const litNodeClient = useRef<LitNodeClient>(null)
  const sessionSigs = useRef<ethers.Wallet>(null)
  const [messageResponse, setMessageResponse] = useState(null)
  useEffect(() => {
    const initClient = async () => {
      
      if (litNodeClient && sessionSigs) {
        const client = await getLitNodeClient()
        const ethersSigner = await getEthereumSigner()
        const sessionSigs = await getSessionSigs(client, ethersSigner);

        litNodeClient.current = client
        sessionSigs.current = sessionSigs
      }
    }
    initClient()

    return () => {
      if (litNodeClient.current) {
        litNodeClient.current.disconnect()
      }
      if (sessionSigs.current) {
        // sessionSigs.current.disconnect()
      }
    }
  }, [])

  const verifyMessage = async () => {
    console.log('verifying message...')
    console.log('verifying message...', sessionSigs.current, litNodeClient.current)
    if (!litNodeClient.current || !sessionSigs.current) {
      return
    }

    console.log('verifying message ......')
    const response = await verifyMessageNoStr({ 
      litNodeClient: litNodeClient.current,
      sessionSigs: sessionSigs.current
    }, event)
    console.log('response', response) 

    setMessageResponse(response)
  }

  return (
    <div className="flex flex-col gap-4 p-2"> 
      <h2 className="text-2xl font-bold">Encrypt and decrypt text within an Lit Action</h2>
      <div>
        <h1 className='text-xl'>Nostr request</h1>
      </div>
      <pre>{JSON.stringify(event, null, 2)}</pre>
      <button className="bg-blue-500 rounded-md p-2 text-white" onClick={verifyMessage}>
        Verify event lit action
      </button>
      <pre>{JSON.stringify(messageResponse, null, 2)}</pre>
    </div>
  );
};

export default Nostr;