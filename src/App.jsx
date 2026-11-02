import { useState } from 'react'
import './App.css'
import { generateMnemonic, mnemonicToSeedSync } from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english.js'
import { HDKey } from '@scure/bip32'
import { TronWeb } from 'tronweb'

function App() {
  const [wallet, setWallet] = useState(null)
  const [positions, setPositions] = useState([])
  const [answers, setAnswers] = useState(['', '', ''])
  const [stage, setStage] = useState('new')
  const [error, setError] = useState('')
  const [showReceive, setShowReceive] = useState(false)
  const [copied, setCopied] = useState(false)
  const [balance, setBalance] = useState(null)
  const [balanceError, setBalanceError] = useState('')
  const [loadingBalance, setLoadingBalance] = useState(false)

  function createWallet() {
    try {
      const mnemonic = generateMnemonic(wordlist, 128)
      const seed = mnemonicToSeedSync(mnemonic)
      const node = HDKey.fromMasterSeed(seed).derive("m/44'/195'/0'/0/0")
      const privateKey = Array.from(node.privateKey)
        .map(x => x.toString(16).padStart(2, '0')).join('')
      const address = TronWeb.address.fromPrivateKey(privateKey)
      if (!address) throw new Error('Manzil yaratilmadi')

      const words = mnemonic.split(' ')
      const indexes = []
      while (indexes.length < 3) {
        const n = crypto.getRandomValues(new Uint32Array(1))[0] % 12
        if (!indexes.includes(n)) indexes.push(n)
      }

      setWallet({ mnemonic, address })
      setPositions(indexes.sort((a, b) => a - b))
      setAnswers(['', '', ''])
      setError('')
      setStage('write')
    } catch (e) {
      setError('Xatolik: ' + e.message)
    }
  }

  function verifyWords() {
    const words = wallet.mnemonic.split(' ')
    const correct = positions.every((p, i) =>
      answers[i].trim().toLowerCase() === words[p]
    )
    if (correct) {
      setStage('done')
      setError('')
    } else {
      setError('So‘zlar mos kelmadi. Qog‘ozdagi yozuvni tekshiring.')
    }
  }

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(wallet.address)
      setCopied(true)
      setError('')
    } catch {
      setError('Nusxalash ishlamadi. Manzilni bosib ushlab nusxalang.')
    }
  }

  async function checkBalance() {
    try {
      setLoadingBalance(true)
      setBalanceError('')
      const client = new TronWeb({
        fullHost: 'https://api.shasta.trongrid.io'
      })
      const sun = await client.trx.getBalance(wallet.address)
      setBalance((Number(sun) / 1000000).toFixed(6))
    } catch (e) {
      setBalanceError('Balansni olishda xatolik. Internetni tekshiring.')
    } finally {
      setLoadingBalance(false)
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

      {stage === 'new' && (
        <section className="balance">
          <h2>Yangi hamyon</h2>
          <p>TERRY Wallet bilan boshlang</p>
          <button onClick={createWallet}>Create Wallet</button>
          {error && <p>{error}</p>}
        </section>
      )}

      {stage === 'write' && (
        <section className="balance">
          <h2>12 ta tiklash so‘zi</h2>
          <p>Ularni qog‘ozga yozing. Hech kimga bermang.</p>
          <div className="words">
            {wallet.mnemonic.split(' ').map((word, i) => (
              <div key={i}>{i + 1}. {word}</div>
            ))}
          </div>
          <button onClick={() => setStage('verify')}>
            So‘zlarni yozdim
          </button>
        </section>
      )}

      {stage === 'verify' && (
        <section className="balance">
          <h2>So‘zlarni tekshirish</h2>
          <p>Qog‘ozingizdan quyidagi so‘zlarni kiriting:</p>
          {positions.map((p, i) => (
            <div key={p}>
              <label>{p + 1}-so‘z</label>
              <input
                value={answers[i]}
                onChange={e => setAnswers(old =>
                  old.map((v, j) => j === i ? e.target.value : v)
                )}
                placeholder="So‘zni kiriting"
              />
            </div>
          ))}
          <button onClick={verifyWords}>Tekshirish</button>
          {error && <p>{error}</p>}
        </section>
      )}

      {stage === 'done' && (
        <section className="balance">
          <h2>Hamyon tasdiqlandi!</h2>
          <p>TRON manzilingiz:</p>
          <p className="address">{wallet.address}</p>
          <h3>Testnet TRX balansi</h3>
          <p>{balance === null ? 'Hali tekshirilmagan' : balance + ' TRX'}</p>
          <button onClick={checkBalance} disabled={loadingBalance}>
            {loadingBalance ? 'Tekshirilmoqda...' : 'Balansni tekshirish'}
          </button>
          {balanceError && <p>{balanceError}</p>}
          <button onClick={() => {
            setShowReceive(!showReceive)
            setCopied(false)
          }}>
            {showReceive ? 'Yopish' : 'Receive / Qabul qilish'}
          </button>

          {showReceive && (
            <div className="asset">
              <div>
                <strong>TRON manzili</strong>
                <p className="address">{wallet.address}</p>
                <button onClick={copyAddress}>Nusxalash</button>
                {copied && <p>Nusxalandi!</p>}
                {error && <p>{error}</p>}
              </div>
            </div>
          )}

          <p className="notice">
            Bu testnet prototipi. Haqiqiy pul yubormang.
          </p>
        </section>
      )}
    </main>
  )
}

export default App
