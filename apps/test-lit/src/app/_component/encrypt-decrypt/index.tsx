'use client';
import { useState } from "react";
import { encryptData, decryptData } from "@poc/lit-protocol";  
import { ExecuteJsResponse } from "@lit-protocol/types";

const EncryptDecrypt = () => {
  const [text, setText] = useState('');
  const [encryptionData, setEncryptionData] = useState<{ ciphertext: string, dataToEncryptHash: string }>({ ciphertext: '', dataToEncryptHash: '' });
  const [decryptionData, setdecryptionData] = useState<ExecuteJsResponse>({ response: '', logs: '', signatures: '' });
  
  const encrypt = async () => {
    const { ciphertext, dataToEncryptHash } = await encryptData(text);
    console.log("cipher text:", ciphertext, "hash:", dataToEncryptHash);
    setEncryptionData({ ciphertext, dataToEncryptHash });
  }

  const decrypt = async () => {
    const decryptedFiles = await decryptData(encryptionData.ciphertext, encryptionData.dataToEncryptHash);
    setdecryptionData(decryptedFiles);
  }

  return (
    <div className="flex flex-col gap-4 p-2"> 
      <div className="flex gap-2 flex-col p-2">
        <h2 className="text-2xl font-bold">Encrypt and decrypt text within an Lit Action</h2>
        <input placeholder="Enter text" className="bg-gray-200 rounded-md p-2 text-black" type="text" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="bg-blue-500 rounded-md p-2 text-white" onClick={encrypt}>Encrypt text</button>
        <pre>{JSON.stringify(encryptionData, null, 2)}</pre>
        <button className="bg-blue-500 rounded-md p-2 text-white" onClick={decrypt}>decrypt text</button>
        <pre>{JSON.stringify(decryptionData, null, 2)}</pre>
      </div>
    </div>
  );
};

export default EncryptDecrypt;