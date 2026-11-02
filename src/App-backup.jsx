import { useState } from 'react'
import './App.css'
import { generateMnemonic, mnemonicToSeedSync } from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english.js'
import { HDKey } from '@scure/bip32'
import { TronWeb } from 'tronweb'

function App() {
  const [wallet, setWallet] = useState(null)
  const [error, setError] = useState('')

  function createWallet() {
    try {
      setError('')

      const mnemonic = generateMnemonic(wordlist, 128)
      const seed = mnemonicToSeedSync(mnemonic)
      const node = HDKey.fromMasterSeed(seed)
        .derive("m/44'/195'/0'/0/0")

      if (!node.privateKey) throw new Error('Kalit yaratilmadi')

      const privateKey = Array.from(node.privateKey)
        .map(x => x.toString(16).padStart(2, '0'))
        .join('')

      const address = TronWeb.address.fromPrivateKey(privateKey)

      if (!address) throw new Error('Manzil yaratilmadi')

      setWallet({ mnemonic, address })
    } catch (e) {
      setError('Xatolik: ' + e.message)
    }
  }

  return (
    <main className="wallet">
      <header>
        <div className="logo">T</div>
        <div>
          <h2>TERRY <span>WALLET</span></h2>
          <small>Non-custodial wallet</small>
        </div>
        <div className="network">TESTNET</div>
      </header>

      {!wallet ? (
        <section className="balance">
          <h2>Yangi hamyon</h2>
          <p>TERRY Wallet bilan xavfsiz boshlang</p>
          <button onClick={createWallet}>
            Create Wallet
          </button>
          <p className="notice">
            12 ta tiklash so‘zi telefoningizda yaratiladi.
          </p>
          {error && <p>{error}</p>}
        </section>
      ) : (
        <section className="balance">
          <h2>Hamyon yaratildi!</h2>
          <p>12 ta tiklash so‘zingiz:</p>

          <div className="words">
            {wallet.mnemonic.split(' ').map((word, i) => (
              <div key={i}>{i + 1}. {word}</div>
            ))}
          </div>

          <h3>TRON manzilingiz</h3>
          <p className="address">{wallet.address}</p>

          <p className="notice">
            So‘zlarni qog‘ozga yozib, xavfsiz joyda saqlang.
            Hech kimga yubormang.
          </p>
        </section>
      )}
    </main>
  )
}

export default App

