import { generateSecretKey, getPublicKey } from 'nostr-tools/pure'
import { finalizeEvent, verifyEvent } from 'nostr-tools/pure'

const sk = generateSecretKey() // `sk` is a Uint8Array
const pk = getPublicKey(sk) // `pk` is a hex string

const event = finalizeEvent({
    kind: 1,
    created_at: Math.floor(Date.now() / 1000),
    tags: [],
    content: 'hello',
  }, sk)
  
  const isGood = verifyEvent(event)


const Nostr = () => {
  return (
    <div>
      <h1>Nostr  {isGood ? 'yes' : 'no'}</h1>
      {pk}
    </div>
  );
};

export default Nostr;