
import EncryptDecrypt from "./_component/encrypt-decrypt";
import SendTransactionToChain from "./_component/send-transaction-to-chain";
import Nostr from "./_component/nostr";
export default function Index() {
  return (
    <div>
      <EncryptDecrypt />
      <SendTransactionToChain />
      <Nostr />
    </div>
  );
}
